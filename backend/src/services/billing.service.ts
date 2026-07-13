import type { SubscriptionStatus, SubscriptionTier } from "@prisma/client";
import Stripe from "stripe";
import { env } from "../config/env.js";
import { PAID_TIERS, stripePriceIdForTier, tierFromStripePriceId } from "../config/plans.js";
import { prisma } from "../config/database.js";
import { AppError } from "../middleware/error.middleware.js";
import { logger } from "../utils/logger.js";

let stripeClient: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(env.STRIPE_SECRET_KEY?.trim());
}

function getStripe(): Stripe {
  if (!isStripeConfigured()) {
    throw new AppError(503, "Billing is not configured. Add Stripe keys to the server environment.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY!);
  }

  return stripeClient;
}

async function getOrCreateCustomer(userId: string): Promise<{ id: string; email: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, stripeCustomerId: true },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.stripeCustomerId) {
    return { id: user.stripeCustomerId, email: user.email };
  }

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { smcUserId: user.id },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return { id: customer.id, email: user.email };
}

export async function createCheckoutSession(
  userId: string,
  tier: SubscriptionTier,
): Promise<{ url: string }> {
  if (tier === "FREE" || !PAID_TIERS.includes(tier)) {
    throw new AppError(400, "Invalid plan for checkout");
  }

  const priceId = stripePriceIdForTier(tier);
  if (!priceId) {
    throw new AppError(
      503,
      `Stripe price ID for ${tier} is not configured. Set STRIPE_PRICE_${tier} in environment.`,
    );
  }

  const stripe = getStripe();
  const customer = await getOrCreateCustomer(userId);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customer.id,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: env.STRIPE_CANCEL_URL,
    metadata: {
      smcUserId: userId,
      smcTier: tier,
    },
    subscription_data: {
      metadata: {
        smcUserId: userId,
        smcTier: tier,
      },
    },
  });

  if (!session.url) {
    throw new AppError(500, "Failed to create checkout session");
  }

  return { url: session.url };
}

export async function createPortalSession(userId: string): Promise<{ url: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    throw new AppError(400, "No billing account found. Subscribe to a paid plan first.");
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: env.STRIPE_CANCEL_URL,
  });

  return { url: session.url };
}

function mapStripeStatus(status: string): SubscriptionStatus {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "trialing":
      return "TRIALING";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
    case "unpaid":
      return "CANCELED";
    default:
      return "INCOMPLETE";
  }
}

function subscriptionPeriodEnd(subscription: Stripe.Subscription): Date | null {
  const end = (subscription as Stripe.Subscription & { current_period_end?: number })
    .current_period_end;
  return end ? new Date(end * 1000) : null;
}

function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const sub = (invoice as Stripe.Invoice & { subscription?: string | { id?: string } | null })
    .subscription;
  if (!sub) return null;
  return typeof sub === "string" ? sub : sub.id ?? null;
}

async function applySubscriptionUpdate(
  userId: string,
  subscription: Stripe.Subscription,
): Promise<void> {
  const priceId = subscription.items.data[0]?.price.id ?? null;
  const tier = tierFromStripePriceId(priceId) ?? "FREE";
  const status = mapStripeStatus(subscription.status);

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: status === "CANCELED" ? "FREE" : tier,
      subscriptionStatus: status,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      currentPeriodEnd: subscriptionPeriodEnd(subscription),
    },
  });
}

async function resetToFree(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: "FREE",
      subscriptionStatus: "ACTIVE",
      stripeSubscriptionId: null,
      stripePriceId: null,
      currentPeriodEnd: null,
    },
  });
}

export async function handleStripeWebhook(payload: Buffer, signature: string): Promise<void> {
  if (!env.STRIPE_WEBHOOK_SECRET?.trim()) {
    throw new AppError(503, "Stripe webhook secret is not configured");
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.warn("Stripe webhook signature verification failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(400, "Invalid webhook signature");
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.smcUserId;
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

      if (userId && subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await applySubscriptionUpdate(userId, subscription);
      }
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.smcUserId;
      if (userId) {
        await applySubscriptionUpdate(userId, subscription);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.smcUserId;
      if (userId) {
        await resetToFree(userId);
      }
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoiceSubscriptionId(invoice);

      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = subscription.metadata?.smcUserId;
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: { subscriptionStatus: "PAST_DUE" },
          });
        }
      }
      break;
    }
    default:
      logger.info(`Unhandled Stripe event: ${event.type}`);
  }
}
