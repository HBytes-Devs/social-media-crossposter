import type { LinkedInAdsDatePreset } from "./linkedin-ads.types.js";

export function resolveDateRange(
  preset: LinkedInAdsDatePreset,
  from?: string,
  to?: string,
): { from: Date; to: Date } {
  const end = to ? new Date(`${to}T00:00:00.000Z`) : new Date();
  end.setUTCHours(0, 0, 0, 0);

  let start: Date;

  if (preset === "CUSTOM") {
    if (!from || !to) {
      throw new Error("CUSTOM range requires from and to (YYYY-MM-DD)");
    }
    start = new Date(`${from}T00:00:00.000Z`);
  } else {
    const days = preset === "LAST_7_DAYS" ? 7 : preset === "LAST_30_DAYS" ? 30 : 90;
    start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (days - 1));
  }

  start.setUTCHours(0, 0, 0, 0);
  return { from: start, to: end };
}

export function toLinkedInDateRange(from: Date, to: Date): string {
  const s = {
    year: from.getUTCFullYear(),
    month: from.getUTCMonth() + 1,
    day: from.getUTCDate(),
  };
  const e = {
    year: to.getUTCFullYear(),
    month: to.getUTCMonth() + 1,
    day: to.getUTCDate(),
  };

  return `(start:(year:${s.year},month:${s.month},day:${s.day}),end:(year:${e.year},month:${e.month},day:${e.day}))`;
}

export function buildTotals(input: {
  impressions: number;
  clicks: number;
  costMicros: bigint | number;
  conversions: number;
}) {
  const costMicros = BigInt(input.costMicros);
  const impressions = input.impressions;
  const clicks = input.clicks;
  const cost = Number(costMicros) / 1_000_000;
  const ctr =
    impressions > 0 ? Math.round((clicks / impressions) * 10_000) / 100 : 0;

  return {
    impressions,
    clicks,
    costMicros: String(costMicros),
    cost,
    conversions: input.conversions,
    ctr,
  };
}

export function currencyToMicros(value: unknown): bigint {
  if (typeof value === "number" && Number.isFinite(value)) {
    return BigInt(Math.round(value * 1_000_000));
  }
  if (typeof value === "string" && value.trim()) {
    const n = Number.parseFloat(value);
    if (Number.isFinite(n)) return BigInt(Math.round(n * 1_000_000));
  }
  return 0n;
}
