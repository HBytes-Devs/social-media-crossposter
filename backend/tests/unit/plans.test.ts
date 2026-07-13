import { describe, expect, it } from "vitest";
import {
  getPlan,
  isPlatformAllowedForTier,
  PLANS,
  tierFromStripePriceId,
} from "../../src/config/plans.js";

describe("plans config", () => {
  it("defines three tiers with basic free", () => {
    expect(PLANS.FREE.priceUsd).toBe(0);
    expect(PLANS.FREE.name).toBe("Basic");
    expect(PLANS.MEDIUM.priceUsd).toBeGreaterThan(0);
    expect(PLANS.PREMIUM.priceUsd).toBeGreaterThan(PLANS.MEDIUM.priceUsd);
  });

  it("restricts free tier to LinkedIn", () => {
    expect(isPlatformAllowedForTier("FREE", "LINKEDIN")).toBe(true);
    expect(isPlatformAllowedForTier("FREE", "REDDIT")).toBe(false);
    expect(isPlatformAllowedForTier("PREMIUM", "REDDIT")).toBe(true);
  });

  it("maps stripe price ids from env", () => {
    process.env.STRIPE_PRICE_MEDIUM = "price_medium_test";
    process.env.STRIPE_PRICE_PREMIUM = "price_premium_test";

    expect(tierFromStripePriceId("price_medium_test")).toBe("MEDIUM");
    expect(tierFromStripePriceId("price_premium_test")).toBe("PREMIUM");
    expect(tierFromStripePriceId("unknown")).toBeNull();
  });

  it("returns plan limits for medium tier", () => {
    const plan = getPlan("MEDIUM");
    expect(plan.limits.analytics).toBe(true);
    expect(plan.limits.maxAccounts).toBe(5);
  });
});
