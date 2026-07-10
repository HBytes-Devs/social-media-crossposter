export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function toLocalDatetimeValue(iso?: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function fromLocalDatetimeValue(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function defaultScheduleDatetime(): string {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 60);
  date.setSeconds(0, 0);
  date.setMinutes(Math.ceil(date.getMinutes() / 15) * 15);
  return toLocalDatetimeValue(date.toISOString());
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function calendarEventDate(post: {
  scheduledFor: string | null;
  publishedAt: string | null;
}): Date | null {
  const raw = post.scheduledFor ?? post.publishedAt;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}
