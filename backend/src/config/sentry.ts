import * as Sentry from "@sentry/node";
import { expressIntegration } from "@sentry/node";
import { env } from "./env.js";

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    // Sentry disabled — no DSN configured
    return;
  }

  Sentry.init({
    dsn,
    environment: env.NODE_ENV,
    integrations: [
      // Automatically attaches HTTP request data to every event
      expressIntegration(),
    ],
    // Capture 100% of errors
    sampleRate: 1.0,
    // Performance tracing: 10% in production, 100% in dev
    tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 1.0,
    // Skip in test runs
    enabled: env.NODE_ENV !== "test",
    beforeSend(event) {
      // Strip auth tokens / cookies before sending to Sentry
      if (event.request?.headers) {
        delete event.request.headers["authorization"];
        delete event.request.headers["cookie"];
      }
      return event;
    },
  });
}

/**
 * Capture an exception manually — use in catch blocks where you want
 * to track the error but still handle it gracefully.
 */
export function captureException(
  err: unknown,
  context?: Record<string, unknown>,
) {
  if (!process.env.SENTRY_DSN) return;

  Sentry.withScope((scope) => {
    if (context) {
      scope.setExtras(context);
    }
    Sentry.captureException(err);
  });
}

/**
 * Set user context for the current request scope.
 * Call after auth middleware resolves the user.
 */
export function setSentryUser(user: { id: string; email?: string }) {
  if (!process.env.SENTRY_DSN) return;
  Sentry.setUser({ id: user.id, email: user.email });
}

export { Sentry };
