import type { MetaAdsDatePreset } from "./meta-ads.types.js";

export function resolveDateRange(
  preset: MetaAdsDatePreset,
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

export function toMetaDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
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

export function spendToMicros(value: unknown): bigint {
  if (typeof value === "number" && Number.isFinite(value)) {
    return BigInt(Math.round(value * 1_000_000));
  }
  if (typeof value === "string" && value.trim()) {
    const n = Number.parseFloat(value);
    if (Number.isFinite(n)) return BigInt(Math.round(n * 1_000_000));
  }
  return 0n;
}

export function conversionsFromActions(
  actions?: Array<{ action_type?: string; value?: string }>,
): number {
  if (!actions?.length) return 0;

  let total = 0;
  for (const action of actions) {
    const type = action.action_type ?? "";
    if (
      type.includes("purchase") ||
      type.includes("lead") ||
      type.includes("complete_registration") ||
      type === "offsite_conversion"
    ) {
      total += Number.parseFloat(action.value ?? "0") || 0;
    }
  }
  return total;
}
