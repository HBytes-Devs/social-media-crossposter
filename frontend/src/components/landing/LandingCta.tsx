import { useId } from "react";
import { Link as RouterLink } from "react-router-dom";

const FONT_SANS =
  '"Figtree", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
const FONT_HEADING =
  '"Stolzl", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

const CONTAINER =
  "mx-auto max-w-[93.5rem] px-[clamp(1rem,0.6094rem+1.9531vi,2.25rem)]";

/** Marketing fluid type / space (vi units from marketing-landing.css) */
const STEP_0 = "clamp(1rem, 0.9565rem + 0.2174vi, 1.125rem)"; // --font-size-step-0
const SPACE_1 = "clamp(0.5rem, 0.4805rem + 0.0977vi, 0.5625rem)"; // --space-step-1
const SPACE_3_5 = "clamp(1rem, 0.6094rem + 1.9531vi, 2.25rem)"; // --space-step-3-step-5

/** --shadow-raised */
const RAISED =
  "shadow-[0_0.25rem_0.75rem_-0.125rem_rgba(23,23,23,0.10),0_0_0.0625rem_0.0625rem_rgba(23,23,23,0.05)]";

function CtaArrow() {
  return (
    <svg
      className={[
        "!size-5 ![block-size:1.25rem] ![inline-size:1.25rem] shrink-0",
        "transition-transform duration-150 ease-out will-change-transform",
        "group-hover/cta:-rotate-45",
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

/**
 * Primary pill CTA — pure Tailwind clone of LinkButtonPrimary
 * (large + icon right): brand-mid #283e3d → brand-dark #213130 on hover,
 * content lifts, arrow rotates −45°.
 */
function GetStartedButton() {
  return (
    <RouterLink
      to="/register"
      data-smc-auth="register"
      className={[
        "group/cta relative !inline-block !rounded-full !no-underline !outline-none",
        "transition-[outline-color] duration-150 ease-out",
        "focus-visible:!outline focus-visible:!outline-[0.125rem] focus-visible:!outline-offset-[0.125rem] focus-visible:!outline-[#283e3d]",
      ].join(" ")}
    >
      {/* Lift shadow plate (marketing :before) */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full bg-transparent transition-transform duration-150 ease-out will-change-transform group-hover/cta:translate-y-[0.125rem]"
      />
      <span
        className={[
          "relative !inline-flex !items-center !justify-center",
          "!rounded-full !border !border-solid !border-[#283e3d] !bg-[#283e3d] !text-white",
          "![column-gap:clamp(0.5rem,0.4805rem+0.0977vi,0.5625rem)]",
          /* Slightly tighter pad on small screens; large pad from ~md up */
          "![padding-block:0.75em] ![padding-inline:1.25em_1em]",
          "sm:![padding-inline:1.75em_1.5em]",
          "![font-size:clamp(1rem,0.9565rem+0.2174vi,1.125rem)] !font-normal !leading-[1.4] !tracking-[0.0075em]",
          "transition-[border-color,background-color,transform] duration-150 ease-out will-change-transform",
          "group-hover/cta:!-translate-y-[0.125rem] group-hover/cta:!border-[#213130] group-hover/cta:!bg-[#213130]",
        ].join(" ")}
        style={{
          fontFamily: FONT_SANS,
          fontSize: STEP_0,
          fontWeight: 400,
          letterSpacing: "0.0075em",
          lineHeight: 1.4,
        }}
      >
        <span>Get started for free</span>
        <CtaArrow />
      </span>
    </RouterLink>
  );
}

/**
 * Final CTA banner — pure Tailwind (CTASection_* tokens).
 * Cream frame + mint panel + Stolzl heading + dark pill button.
 */
export function LandingCta() {
  const headingId = useId();

  return (
    <section
      className="!py-[clamp(1rem,0.6094rem+1.9531vi,2.25rem)] !tracking-[0.0075em] !text-[#213130]"
      data-theme="light"
      aria-labelledby={headingId}
      style={{
        fontFamily: FONT_SANS,
        paddingBlock: SPACE_3_5,
        letterSpacing: "0.0075em",
        color: "#213130",
      }}
    >
      <div className={CONTAINER}>
        {/* CTASection_contentContainer — cream + raised shadow + step-1 padding */}
        <div
          className={[
            "!rounded-[1.25rem] !bg-[#fefdfb]",
            "![padding:clamp(0.5rem,0.4805rem+0.0977vi,0.5625rem)]",
            RAISED,
          ].join(" ")}
          style={{ padding: SPACE_1 }}
        >
          {/* CTASection_content — green-300 panel */}
          <div
            className={[
              "flex !flex-col !items-center !text-center",
              "!gap-[clamp(1rem,0.6094rem+1.9531vi,2.25rem)]",
              "rounded-[calc(1.25rem-clamp(0.5rem,0.4805rem+0.0977vi,0.5625rem))] !bg-[#b0ec9c]",
              /* Comfortable mobile pad without oversizing the mint panel */
              "![padding-block:clamp(1.75rem,1.2188rem+3.9063vi,4.5rem)]",
              "![padding-inline:clamp(1rem,0.6094rem+1.9531vi,2.25rem)]",
              "lg:![padding-inline:clamp(2rem,1.2188rem+3.9063vi,4.5rem)]",
            ].join(" ")}
          >
            <h2
              id={headingId}
              className={[
                "!m-0 !max-w-[20ch] text-pretty !text-[#213130]",
                "!font-normal !leading-[1.1] !tracking-[-0.02em]",
                "![font-size:clamp(1.95625rem,1.7056rem+1.2375vi,2.6625rem)]",
                "lg:![font-size:clamp(2.44375rem,2.0551rem+1.9315vi,3.55rem)]",
                "![font-family:Stolzl,ui-sans-serif,system-ui,sans-serif]",
              ].join(" ")}
              style={{
                fontFamily: FONT_HEADING,
                fontWeight: 400,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                margin: 0,
                maxInlineSize: "20ch",
                color: "#213130",
              }}
            >
              Grow your social presence with confidence
            </h2>

            <GetStartedButton />

            <p
              className={[
                "!m-0 !text-[#213130]",
                "![font-size:clamp(1rem,0.9565rem+0.2174vi,1.125rem)]",
                "!font-normal !leading-[1.4] !tracking-[0.0075em]",
              ].join(" ")}
              style={{
                fontFamily: FONT_SANS,
                fontWeight: 400,
                lineHeight: 1.4,
                letterSpacing: "0.0075em",
                margin: 0,
                color: "#213130",
              }}
            >
              No credit card needed. Free forever.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
