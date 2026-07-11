import { describe, expect, it } from "vitest";
import {
  dateKey,
  fromLocalDatetimeValue,
  pad2,
  parseDateKey,
  toLocalDatetimeValue,
} from "./datetime";

describe("datetime helpers", () => {
  it("pad2 zero-pads single digits", () => {
    expect(pad2(3)).toBe("03");
    expect(pad2(12)).toBe("12");
  });

  it("round-trips local datetime value", () => {
    const iso = "2026-07-11T14:30:00.000Z";
    const local = toLocalDatetimeValue(iso);
    expect(local).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    const back = fromLocalDatetimeValue(local);
    expect(back).not.toBeNull();
  });

  it("returns null for invalid local datetime", () => {
    expect(fromLocalDatetimeValue("")).toBeNull();
  });

  it("dateKey and parseDateKey are inverse", () => {
    const date = new Date(2026, 6, 11, 15, 45);
    expect(dateKey(parseDateKey(dateKey(date)))).toBe(dateKey(date));
  });
});
