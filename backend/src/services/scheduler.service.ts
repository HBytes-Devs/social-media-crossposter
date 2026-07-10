import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import * as postsService from "./posts.service.js";

let pollTimer: ReturnType<typeof setInterval> | null = null;
let processing = false;

export async function processDueScheduledPosts(): Promise<number> {
  if (processing) {
    return 0;
  }

  processing = true;
  let processed = 0;

  try {
    const duePosts = await postsService.listDueScheduledPosts();

    for (const due of duePosts) {
      try {
        const claimed = await postsService.claimScheduledPost(due.id);
        if (!claimed) continue;

        logger.info("Publishing scheduled post", {
          postId: due.id,
          userId: due.userId,
          scheduledFor: due.scheduledFor?.toISOString(),
        });
        await postsService.publishPost(due.userId, due.id, { alreadyClaimed: true });
        processed++;
      } catch (error) {
        logger.error("Failed to publish scheduled post", {
          postId: due.id,
          userId: due.userId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return processed;
  } finally {
    processing = false;
  }
}

export function startScheduler() {
  if (pollTimer) return;

  const pollMs = env.SCHEDULER_POLL_INTERVAL_MS;
  logger.info(`Scheduler started (poll every ${pollMs}ms)`);

  void processDueScheduledPosts();

  pollTimer = setInterval(() => {
    void processDueScheduledPosts();
  }, pollMs);
}

export function stopScheduler() {
  if (!pollTimer) return;
  clearInterval(pollTimer);
  pollTimer = null;
  logger.info("Scheduler stopped");
}
