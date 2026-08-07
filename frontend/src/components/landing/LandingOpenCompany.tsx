import { useId } from "react";

const FONT_SANS =
  '"Figtree", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
const FONT_HEADING =
  '"Stolzl", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

const CONTAINER =
  "mx-auto max-w-[93.5rem] px-[clamp(1rem,0.6094rem+1.9531vi,2.25rem)]";

/** Marketing fluid type / space steps (vi units) */
const STEP_M1 = "clamp(0.89375rem, 0.8703rem + 0.1172vi, 0.96875rem)";
const STEP_0 = "clamp(1rem, 0.9565rem + 0.2174vi, 1.125rem)";
const STEP_2 = "clamp(1.5625rem, 1.4107rem + 0.7591vi, 2rem)";
const STEP_3 = "clamp(1.95625rem, 1.7056rem + 1.2375vi, 2.6625rem)";
const SPACE_1 = "clamp(0.5rem, 0.4805rem + 0.0977vi, 0.5625rem)";
const SPACE_3 = "clamp(1rem, 0.9609rem + 0.1953vi, 1.125rem)";
const SPACE_3_5 = "clamp(1rem, 0.6094rem + 1.9531vi, 2.25rem)";
const SPACE_5 = "clamp(2rem, 1.9219rem + 0.3906vi, 2.25rem)";
const SPACE_5_7 = "clamp(2rem, 1.2188rem + 3.9063vi, 4.5rem)";

const RAISED =
  "shadow-[0_0.25rem_0.75rem_-0.125rem_rgba(23,23,23,0.10),0_0_0.0625rem_0.0625rem_rgba(23,23,23,0.05)]";
const FLOATING =
  "hover:shadow-[0_1rem_1.5rem_-0.5rem_rgba(23,23,23,0.10),0_0.25rem_0.5rem_-0.25rem_rgba(23,23,23,0.10),0_0_0.0625rem_0.0625rem_rgba(23,23,23,0.05)]";

const METRICS = [
  { label: "MAU", subtitle: "Monthly active users", value: "239,262" },
  { label: "Total customers", subtitle: "Total customers", value: "79,214" },
  { label: "Teammates", subtitle: "Across 15 countries", value: "73" },
  { label: "ARR", subtitle: "Annual recurring revenue", value: "$25.9M" },
] as const;

function CtaArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      className={[
        "!size-4 ![block-size:1rem] ![inline-size:1rem] shrink-0 text-[#213130]",
        "transition-transform duration-150 ease-out will-change-transform",
        className,
      ].join(" ")}
      width={24}
      height={24}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M11.47 4.47a.75.75 0 0 1 1.06 0l7 7a.75.75 0 0 1 0 1.06l-7 7a.75.75 0 1 1-1.06-1.06l5.72-5.72H5a.75.75 0 0 1 0-1.5h12.19l-5.72-5.72a.75.75 0 0 1 0-1.06Z"
      />
    </svg>
  );
}

/** Ghost pill CTA — pure Tailwind (beats marketing `a` / button resets) */
function OpenDashboardLink({
  size,
  className = "",
}: {
  size: "large" | "default";
  className?: string;
}) {
  const padBlock = "0.5em";
  const fontSize = size === "large" ? STEP_0 : STEP_M1;

  return (
    <a
      href="/open"
      className={[
        "group/cta relative !inline-flex no-underline outline-none",
        "rounded-full transition-[outline-color] duration-150 ease-out",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#213130]",
        className,
      ].join(" ")}
    >
      <span
        className={[
          "relative !inline-flex flex-1 items-center justify-center",
          "rounded-full border border-solid border-[#213130] !bg-transparent",
          "text-center text-[#213130] will-change-transform",
          "transition-[transform,background-color] duration-150 ease-out",
          "hover:!bg-[#f1f1ea]",
          "![padding-inline-start:1.25em] ![padding-inline-end:1em]",
          "gap-[clamp(0.5rem,0.4805rem+0.0977vi,0.5625rem)]",
        ].join(" ")}
        style={{
          fontFamily: FONT_SANS,
          fontSize,
          fontWeight: 400,
          lineHeight: 1.4,
          letterSpacing: "0.0075em",
          paddingBlock: padBlock,
          columnGap: SPACE_1,
        }}
      >
        <span>Open dashboard</span>
        <CtaArrow className="group-hover/cta:-rotate-45" />
      </span>
    </a>
  );
}

/**
 * About us / Open company — pure Tailwind.
 * Desktop: copy left, “Open dashboard” right (space-between).
 * Tokens from OpenCompanySection_* + text-eyebrow / text-heading.
 */
export function LandingOpenCompany() {
  const headingId = useId();

  return (
    <section
      id="about"
      className={[
        "![padding-block:clamp(2rem,1.2188rem+3.9063vi,4.5rem)]",
        "tracking-[0.0075em] text-[#213130]",
        "![font-size:clamp(1rem,0.9565rem+0.2174vi,1.125rem)] !leading-[1.4]",
      ].join(" ")}
      aria-labelledby={headingId}
      style={{
        fontFamily: FONT_SANS,
        fontSize: STEP_0,
        letterSpacing: "0.0075em",
        lineHeight: 1.4,
        paddingBlock: SPACE_5_7,
      }}
    >
      <div className={CONTAINER}>
        {/*
          Mobile: stacked + centered.
          ≥64rem: row, space-between — heading/paragraph LEFT, CTA RIGHT.
          marketing `.text-center` / `.items-center` need `!` overrides.
        */}
        <div
          className={[
            "!flex !flex-col !items-center max-lg:!text-center",
            "![margin-block-end:clamp(2rem,1.2188rem+3.9063vi,4.5rem)]",
            "lg:!flex-row lg:!items-start lg:!justify-between",
            "lg:!gap-[clamp(1rem,0.6094rem+1.9531vi,2.25rem)]",
            "lg:!text-left",
          ].join(" ")}
          style={{ marginBlockEnd: SPACE_5_7 }}
        >
          <div className="min-w-0 lg:!flex-1">
            {/* Eyebrow — Figtree step--1 / medium / neutral-800; avoid h2 size inherit */}
            <p
              id={headingId}
              role="heading"
              aria-level={2}
              className={[
                "mt-0 uppercase text-[#262626]",
                "![margin-block-end:clamp(1rem,0.9609rem+0.1953vi,1.125rem)]",
                "![font-size:clamp(0.89375rem,0.8703rem+0.1172vi,0.96875rem)]",
                "!font-medium !leading-[1.4] !tracking-[0.0625em]",
              ].join(" ")}
              style={{
                fontFamily: FONT_SANS,
                fontSize: STEP_M1,
                fontWeight: 500,
                lineHeight: 1.4,
                letterSpacing: "0.0625em",
                marginBlockEnd: SPACE_3,
              }}
            >
              About us
            </p>

            {/* Title — Stolzl step-3 / lh 1.1 / -0.02em */}
            <p
              className={[
                "mt-0 text-[#213130]",
                "![margin-block-end:clamp(1rem,0.9609rem+0.1953vi,1.125rem)]",
                "![font-size:clamp(1.95625rem,1.7056rem+1.2375vi,2.6625rem)]",
                "!font-normal !leading-[1.1] !tracking-[-0.02em]",
              ].join(" ")}
              style={{
                fontFamily: FONT_HEADING,
                fontSize: STEP_3,
                fontWeight: 400,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                marginBlockEnd: SPACE_3,
              }}
            >
              We are an open company
            </p>

            <p
              className={[
                "!m-0 max-w-[65ch]",
                "![font-size:clamp(1rem,0.9565rem+0.2174vi,1.125rem)]",
                "!font-normal !leading-[1.4] !tracking-[0.0075em] text-[#213130]",
              ].join(" ")}
              style={{
                fontFamily: FONT_SANS,
                fontSize: STEP_0,
                fontWeight: 400,
                lineHeight: 1.4,
                letterSpacing: "0.0075em",
                margin: 0,
              }}
            >
              Since 2013, we’ve shared SMC’s finances, team salaries, and other key metrics openly.
              Our commitment to transparency is rooted in our belief that it fosters trust, keeps us
              accountable, and helps drive positive change within our industry.
            </p>
          </div>

          {/* Desktop CTA — right side */}
          <OpenDashboardLink
            size="large"
            className="mt-6 !hidden shrink-0 lg:!mt-0 lg:!inline-flex"
          />
        </div>

        <dl
          className={[
            "!m-0 !grid !grid-cols-2",
            "gap-[clamp(1rem,0.9609rem+0.1953vi,1.125rem)]",
            "![margin-block-end:clamp(2rem,1.9219rem+0.3906vi,2.25rem)]",
            "lg:!mb-0 lg:!grid-cols-4",
          ].join(" ")}
          style={{ gap: SPACE_3, marginBlockEnd: SPACE_5 }}
        >
          {METRICS.map((m) => (
            <div
              key={m.label}
              className={[
                "group relative !flex !min-w-0 !flex-col !rounded-[1.25rem]",
                "border border-solid !border-[#e4e3dd] !bg-white",
                "![padding:clamp(0.75rem,0.5rem+1vi,1.125rem)]",
                RAISED,
                FLOATING,
                "transition-[transform,box-shadow] duration-150 ease-out will-change-transform",
                "hover:-translate-y-1",
              ].join(" ")}
              style={{
                padding: SPACE_3,
                borderRadius: "1.25rem",
                backgroundColor: "#fff",
                borderColor: "#e4e3dd",
              }}
            >
              <dt
                className={[
                  "!flex !flex-col !text-left",
                  "![margin-block-end:clamp(1rem,0.6094rem+1.9531vi,2.25rem)]",
                ].join(" ")}
                style={{ marginBlockEnd: SPACE_3_5 }}
              >
                <span
                  className="text-[#213130] !font-normal !leading-[1.1] !tracking-[-0.02em]"
                  style={{
                    fontFamily: FONT_HEADING,
                    fontSize: STEP_0,
                    fontWeight: 400,
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {m.label}
                </span>
                <span
                  className="text-[#262626] !font-normal !leading-[1.4] !tracking-[0.0075em]"
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: STEP_M1,
                    fontWeight: 400,
                    lineHeight: 1.4,
                    letterSpacing: "0.0075em",
                  }}
                >
                  {m.subtitle}
                </span>
              </dt>
              <dd
                className={[
                  "!m-0 !mt-auto break-words tabular-nums text-[#213130]",
                  "max-lg:!text-right lg:!text-left",
                  "![font-size:clamp(1.375rem,1.2rem+0.7591vi,2rem)]",
                  "!font-normal !leading-[1.1] !tracking-[-0.02em]",
                ].join(" ")}
                style={{
                  fontFamily: FONT_HEADING,
                  fontSize: STEP_2,
                  fontWeight: 400,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  fontVariantNumeric: "tabular-nums",
                  marginBlockStart: "auto",
                  margin: 0,
                }}
              >
                {m.value}
              </dd>
            </div>
          ))}
        </dl>

        {/* Mobile CTA */}
        <div className="!flex !justify-center lg:!hidden">
          <OpenDashboardLink size="default" />
        </div>
      </div>
    </section>
  );
}
