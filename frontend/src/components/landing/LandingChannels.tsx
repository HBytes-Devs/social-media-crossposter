import { useId } from "react";
import { CHANNEL_ICONS, type ChannelId } from "./channelIcons";

/** Matches marketing --container-max-inline-size-wide + --space-step-3-step-5 */
const CONTAINER =
  "mx-auto max-w-[93.5rem] px-[clamp(1rem,0.6094rem+1.9531vi,2.25rem)]";

const FONT_SANS =
  '"Figtree", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
const FONT_HEADING =
  '"Stolzl", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

/** Marketing fluid type / space steps (vi units from marketing-landing.css) */
const STEP_M1 = "clamp(0.89375rem, 0.8703rem + 0.1172vi, 0.96875rem)"; // --font-size-step--1
const STEP_1 = "clamp(1.25rem, 1.1632rem + 0.4341vi, 1.5rem)"; // --font-size-step-1
const SPACE_0 = "clamp(0.25rem, 0.2305rem + 0.0977vi, 0.3125rem)"; // --space-step-0
const SPACE_5_7 = "clamp(2rem, 1.2188rem + 3.9063vi, 4.5rem)"; // --space-step-5-step-7 / --gutter

/** --shadow-floating */
const FLOATING =
  "shadow-[0_1rem_1.5rem_-0.5rem_rgba(23,23,23,0.10),0_0.25rem_0.5rem_-0.25rem_rgba(23,23,23,0.10),0_0_0.0625rem_0.0625rem_rgba(23,23,23,0.05)]";

const CHANNELS: { id: ChannelId; label: string; href: string; color: string }[] = [
  { id: "linkedin", label: "LinkedIn", href: "#platforms", color: "#2967b3" },
  { id: "threads", label: "Threads", href: "#platforms", color: "#000" },
  { id: "pinterest", label: "Pinterest", href: "#platforms", color: "#e60022" },
  { id: "bluesky", label: "Bluesky", href: "#platforms", color: "#1083fe" },
  { id: "youtube", label: "YouTube", href: "#platforms", color: "red" },
  { id: "x", label: "X", href: "#platforms", color: "#000" },
  {
    id: "google-business-profile",
    label: "Google Business Profile",
    href: "#platforms",
    color: "#4b7de2",
  },
  { id: "instagram", label: "Instagram", href: "#platforms", color: "#ed0274" },
  { id: "mastodon", label: "Mastodon", href: "#platforms", color: "#6161ff" },
  { id: "tiktok", label: "TikTok", href: "#platforms", color: "#000" },
  { id: "facebook", label: "Facebook", href: "#platforms", color: "#1876f2" },
];

function LabelArrow() {
  return (
    <svg
      className="!size-4 ![block-size:1rem] ![inline-size:1rem] shrink-0"
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
 * “Connect your favorite accounts” — pure Tailwind (no ChannelsSection_*).
 * Tokens from marketing-landing.css ChannelsSection_* + HomeContent_channelsSection.
 *
 * Cascade note: marketing-landing.css ships unscoped `.text-center` / `.justify-center`
 * that load after app utilities and beat non-important `lg:text-left` / `lg:justify-start`.
 * Use max-lg:* for mobile-only center, and ! for desktop start alignment.
 */
export function LandingChannels() {
  const headingId = useId();

  return (
    <section
      id="platforms"
      className="pt-[clamp(2rem,1.2188rem+3.9063vi,4.5rem)]"
      aria-labelledby={headingId}
      style={{
        fontFamily: FONT_SANS,
        paddingBlockStart: SPACE_5_7,
      }}
    >
      <div className={CONTAINER}>
        {/*
          ChannelsSection_container + tileContainer:
          - display:grid; align-items:center; gap:space-step-3; padding:1.875rem
          - ≥64rem: grid-template-columns:1fr 5fr; gap:gutter (space-5-7)
          - ≤47.9375rem: padding:1.25rem .844rem 2.71rem
          - bg neutral-200; radius medium 1.25rem
        */}
        <div
          className={[
            "grid items-center rounded-[1.25rem] bg-[#f1f1ea]",
            "gap-[clamp(1rem,0.9609rem+0.1953vi,1.125rem)]",
            "p-[1.875rem]",
            "max-md:px-[0.844rem] max-md:pb-[2.71rem] max-md:pt-5",
            /* Heading left, open middle gap, icons cluster on the right */
            "lg:grid-cols-[minmax(12rem,auto)_1fr] lg:gap-[clamp(3rem,2rem+5vi,6rem)]",
          ].join(" ")}
          style={{ fontFamily: FONT_SANS }}
        >
          <div className="min-w-0 lg:justify-self-start">
            <h2
              id={headingId}
              className={[
                "!m-0 max-lg:!text-center lg:!text-left",
                "![margin-block-end:clamp(0.25rem,0.2305rem+0.0977vi,0.3125rem)]",
                "![font-size:clamp(1.25rem,1.1632rem+0.4341vi,1.5rem)]",
                "!font-normal !leading-[1.2] text-[#213130]",
                "![font-family:Stolzl,ui-sans-serif,system-ui,sans-serif]",
              ].join(" ")}
              style={{
                fontFamily: FONT_HEADING,
                fontSize: STEP_1,
                fontWeight: 400,
                lineHeight: 1.2,
                margin: 0,
                marginBlockEnd: SPACE_0,
                color: "#213130",
              }}
            >
              Connect your favorite accounts
            </h2>
          </div>

          <div className="flex min-w-0 flex-auto items-center max-lg:!justify-center lg:!justify-end">
            <ul
              className={[
                "relative z-10 m-0 flex list-none flex-wrap p-0",
                "max-lg:!justify-center lg:!justify-end",
                /*
                  Gaps must match the flex-basis calc below:
                  mobile: 4-across · md–lg: 6-across · ≥lg: free row with larger gap.
                */
                "![column-gap:clamp(0.5rem,0.4805rem+0.0977vi,0.5625rem)] !gap-y-3.5",
                "md:![column-gap:clamp(0.75rem,0.7109rem+0.1953vi,0.875rem)] md:!gap-y-4",
                "lg:![column-gap:1.5rem] lg:!gap-y-10",
              ].join(" ")}
            >
              {CHANNELS.map((ch) => {
                const Icon = CHANNEL_ICONS[ch.id];
                return (
                  <li
                    key={ch.id}
                    className={[
                      "relative z-10",
                      /* Mobile: 4-across for readable tiles; md–lg: 6-across (marketing) */
                      "max-md:!max-w-14 max-md:!flex-[0_1_calc((100%-3*0.5rem)/4)]",
                      "md:max-lg:!max-w-12 md:max-lg:!flex-[0_1_calc((100%-5*0.75rem)/6)]",
                      "lg:!max-w-none lg:!flex-none",
                    ].join(" ")}
                  >
                    <a
                      href={ch.href}
                      className={[
                        "group relative z-10 inline-flex w-full flex-col items-center justify-center outline-none",
                        /* ~44px touch target floor on small screens */
                        "max-lg:min-h-11 max-lg:min-w-11",
                        "lg:w-auto lg:min-h-0 lg:min-w-0",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "relative z-10 inline-flex aspect-square w-full items-center justify-center",
                          "rounded-[0.5rem] text-white",
                          FLOATING,
                          "outline outline-[0.125rem] outline-offset-[0.125rem] outline-transparent",
                          "transition-[transform,outline-color] duration-150 ease-out motion-reduce:transition-none",
                          "group-hover:scale-105 group-focus-visible:outline-[#213130]",
                          "lg:!size-[3.25rem] lg:![block-size:3.25rem] lg:![inline-size:3.25rem]",
                          "lg:aspect-auto lg:!h-[3.25rem] lg:!w-[3.25rem]",
                        ].join(" ")}
                        style={{ backgroundColor: ch.color }}
                        data-channel={ch.id}
                      >
                        <Icon />
                      </span>
                      <span className="sr-only">SMC × {ch.label}</span>
                      {/*
                        Hover label centered under the icon (lg+).
                        Avoid Tailwind `opacity-0` — marketing CSS forces it visible.
                      */}
                      <span
                        className={[
                          "pointer-events-none absolute top-full z-20 mt-2 hidden items-center gap-1 whitespace-nowrap text-[#213130]",
                          "left-1/2 ![opacity:0]",
                          "![transform:translateX(-50%)_translateY(-0.25rem)]",
                          "transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none",
                          "group-hover:![opacity:1] group-hover:![transform:translateX(-50%)_translateY(0)]",
                          "group-focus-visible:![opacity:1] group-focus-visible:![transform:translateX(-50%)_translateY(0)]",
                          "lg:!flex",
                        ].join(" ")}
                        aria-hidden
                      >
                        <span
                          className={[
                            "shrink-0",
                            "![font-size:clamp(0.89375rem,0.8703rem+0.1172vi,0.96875rem)]",
                            "![font-family:Figtree,ui-sans-serif,system-ui,sans-serif]",
                          ].join(" ")}
                          style={{
                            fontFamily: FONT_SANS,
                            fontSize: STEP_M1,
                          }}
                        >
                          SMC × {ch.label}
                        </span>
                        <LabelArrow />
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
