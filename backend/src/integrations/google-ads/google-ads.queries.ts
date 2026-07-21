import type { GoogleAdsDatePreset } from "./google-ads.types.js";

export function resolveDateRange(
  preset: GoogleAdsDatePreset,
  from?: string,
  to?: string,
): { from: Date; to: Date; preset: GoogleAdsDatePreset } {
  const end = startOfDay(to ? new Date(to) : new Date());

  if (preset === "CUSTOM") {
    if (!from || !to) {
      throw new Error("Custom date range requires from and to");
    }

    return {
      from: startOfDay(new Date(from)),
      to: end,
      preset,
    };
  }

  const days = preset === "LAST_7_DAYS" ? 7 : preset === "LAST_30_DAYS" ? 30 : 90;
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));

  return { from: startOfDay(start), to: end, preset };
}

export function formatGaqlDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function microsToCost(micros: bigint | number): number {
  const value = typeof micros === "bigint" ? Number(micros) : micros;
  return Math.round((value / 1_000_000) * 100) / 100;
}

export function buildTotals(input: {
  impressions: number;
  clicks: number;
  costMicros: bigint | number;
  conversions: number;
}) {
  const costMicros =
    typeof input.costMicros === "bigint" ? input.costMicros.toString() : String(input.costMicros);
  const ctr =
    input.impressions > 0
      ? Math.round((input.clicks / input.impressions) * 10_000) / 100
      : 0;

  return {
    impressions: input.impressions,
    clicks: input.clicks,
    costMicros,
    cost: microsToCost(input.costMicros),
    conversions: input.conversions,
    ctr,
  };
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function buildAccountMetricsQuery(from: string, to: string): string {
  return `
    SELECT
      segments.date,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.ctr
    FROM customer
    WHERE segments.date BETWEEN '${from}' AND '${to}'
    ORDER BY segments.date
  `;
}

export function buildCampaignMetricsQuery(from: string, to: string): string {
  return `
    SELECT
      campaign.id,
      campaign.name,
      segments.date,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.ctr
    FROM campaign
    WHERE segments.date BETWEEN '${from}' AND '${to}'
      AND campaign.status != 'REMOVED'
    ORDER BY segments.date
  `;
}
