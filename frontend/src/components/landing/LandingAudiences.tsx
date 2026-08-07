import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { CHANNEL_ICONS, type ChannelId } from "./channelIcons";

/**
 * Pure Tailwind Audiences / Verticals section.
 * Marketing CSS is unlayered and beats Tailwind @layer utilities:
 * - button { padding:0; border-radius:0; background:#0000; font:inherit }
 * - h4–h6 { font-size:inherit; margin:0 }
 * Use `!` + inline styles (same pattern as LandingCoreFeatures).
 */

const FONT_SANS =
  '"Figtree", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
const FONT_HEADING =
  '"Stolzl", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

/** Marketing fluid tokens (vi from marketing-landing.css) */
const STEP_M2 = "clamp(0.8rem, 0.7863rem + 0.0687vi, 0.84375rem)"; // --font-size-step--2
const STEP_M1 = "clamp(0.89375rem, 0.8703rem + 0.1172vi, 0.96875rem)"; // --font-size-step--1
const STEP_2 = "clamp(1.5625rem, 1.4107rem + 0.7591vi, 2rem)"; // --font-size-step-2
const SPACE_1 = "clamp(0.5rem, 0.4805rem + 0.0977vi, 0.5625rem)"; // --space-step-1
const SPACE_2 = "clamp(0.75rem, 0.7109rem + 0.1953vi, 0.875rem)"; // --space-step-2
const SPACE_3 = "clamp(1rem, 0.9609rem + 0.1953vi, 1.125rem)"; // --space-step-3
const SPACE_3_5 = "clamp(1rem, 0.6094rem + 1.9531vi, 2.25rem)"; // --space-step-3-step-5
const SPACE_5 = "clamp(2rem, 1.9219rem + 0.3906vi, 2.25rem)"; // --space-step-5
const SPACE_5_7 = "clamp(2rem, 1.2188rem + 3.9063vi, 4.5rem)"; // --space-step-5-step-7

const CONTAINER =
  "mx-auto max-w-[93.5rem] px-[clamp(1rem,0.6094rem+1.9531vi,2.25rem)]";

const CDN = "https://buffer.com/cdn-cgi/image";
const BRAND = "#213130";

/**
 * VerticalsSection_contentLeadingHeading__xKagh
 * Source uses h4, but marketing CSS sets h4–h6 { font-size: inherit },
 * which kills step-2. Use a non-h4 element + ! utilities (CoreFeatures pattern).
 *
 * Tokens:
 * - font: Stolzl (--font-family-heading)
 * - size: --font-size-step-2 = clamp(1.5625rem, 1.4107rem + 0.7591vi, 2rem)
 * - weight: 400
 * - line-height: 1.1 (--line-height-heading / --line-height-tight)
 * - letter-spacing: -0.02em (--letter-spacing-heading / --letter-spacing-tight)
 * - color: #213130
 * - margin-block-end: --space-step-2
 */
const HEADLINE_CLASS = [
  "!m-0 text-balance text-[#213130]",
  "![margin-block-end:clamp(0.75rem,0.7109rem+0.1953vi,0.875rem)]",
  "![font-size:clamp(1.5625rem,1.4107rem+0.7591vi,2rem)]",
  "!font-normal !leading-[1.1] !tracking-[-0.02em]",
  "![font-family:Stolzl,ui-sans-serif,system-ui,sans-serif]",
].join(" ");

const HEADLINE_STYLE: CSSProperties = {
  fontFamily: FONT_HEADING,
  fontSize: STEP_2,
  fontWeight: 400,
  lineHeight: 1.1,
  letterSpacing: "-0.02em",
  margin: 0,
  marginBlockEnd: SPACE_2,
  color: BRAND,
  textWrap: "balance",
};

/**
 * Source markup (Creators tab):
 *   <span class="visually-hidden"> to </span><span aria-hidden="true"> → </span>
 * Sighted: " → " · Screen readers: " to "
 */
function ToArrow() {
  return (
    <>
      <span
        className={[
          "!absolute !m-[-1px] !h-px !w-px !overflow-hidden !whitespace-nowrap",
          "!border-0 !p-0 ![clip:rect(0,0,0,0)] ![clip-path:inset(50%)]",
        ].join(" ")}
      >
        {" "}
        to{" "}
      </span>
      <span aria-hidden="true"> → </span>
    </>
  );
}

type Theme = "purple" | "yellow" | "aqua";

type Member = {
  name: string;
  user: string;
  followers: string;
  channel: ChannelId;
  img: string;
};

type Tab = {
  label: string;
  theme: Theme;
  heading: ReactNode;
  text: string;
  items: string[];
  eyebrow: string;
  members: Member[];
};

/**
 * Exact Verticals theme hexes from marketing-landing.css.
 * Prefer the winning hex definitions (not the oklch twins):
 * --color-purple-100 resolves to #e6dbff (oklch twin ≈ #f3e8ff ≈ purple-050,
 * which made member cards invisible against the community panel).
 */
const THEME: Record<
  Theme,
  {
    /** --color-*-100 — tab active/hover + community panel */
    accent100: string;
    /** --color-*-050 — member cards */
    accent050: string;
    /** --color-*-900 — community eyebrow */
    accent900: string;
    /** --color-*-800 — checklist icons */
    accent800: string;
  }
> = {
  purple: {
    accent100: "#e6dbff",
    accent050: "#f1ebff",
    accent900: "#331282",
    accent800: "#5628b8",
  },
  yellow: {
    accent100: "#ffebc2",
    accent050: "#fff6e6",
    accent900: "#724f08",
    accent800: "#b2811f",
  },
  aqua: {
    accent100: "#cdf4f0",
    accent050: "#e5faf8",
    accent900: "#175955",
    accent800: "#2d8b83",
  },
};

/** Important Tailwind bg classes — marketing CSS is unlayered and beats utilities */
const THEME_BG_100: Record<Theme, string> = {
  purple: "!bg-[#e6dbff]",
  yellow: "!bg-[#ffebc2]",
  aqua: "!bg-[#cdf4f0]",
};
const THEME_BG_050: Record<Theme, string> = {
  purple: "!bg-[#f1ebff]",
  yellow: "!bg-[#fff6e6]",
  aqua: "!bg-[#e5faf8]",
};

const CHANNEL_BG: Partial<Record<ChannelId, string>> = {
  x: "bg-black",
  linkedin: "bg-[#2967b3]",
  instagram: "bg-[#ed0274]",
};

const TABS: Tab[] = [
  {
    label: "Creators",
    theme: "purple",
    // Sighted: "Grow from zero → one → one million"
    // A11y:     "Grow from zero to one to one million"
    heading: (
      <>
        Grow from zero
        <ToArrow />
        one
        <ToArrow />
        one million
      </>
    ),
    text: "Whether you’re just getting started on your creator journey or scaling your audience to new heights, SMC will get your content in front of more people.",
    items: [
      "Save all your ideas as inspiration strikes",
      "Learn exactly what content works best and why",
      "Create once, crosspost everywhere",
    ],
    eyebrow: "The SMC creator community",
    members: [
      {
        name: "Rita Iglesias",
        user: "@rita_codes",
        followers: "34.9k followers on X",
        channel: "x",
        img: "rita-iglesias.webp",
      },
      {
        name: "Paul de La Baume",
        user: "@Pauldelabaume",
        followers: "21k followers on LinkedIn",
        channel: "linkedin",
        img: "paul-de-la-baume.webp",
      },
      {
        name: "Lola Tatiana Veiga Bastos",
        user: "@yola_bastos",
        followers: "14.6k followers on Instagram",
        channel: "instagram",
        img: "yola-bastos.webp",
      },
    ],
  },
  {
    label: "Small businesses",
    theme: "yellow",
    heading: "Level up your social presence without draining your time",
    text: "Every minute and every dollar counts when you’re running a small business. SMC multiplies your efforts and keeps your online presence thriving with minimal effort.",
    items: [
      "Schedule content weeks or even months in advance",
      "See all your posts in one simple dashboard",
      "World-class customer support",
    ],
    eyebrow: "The SMC small business community",
    members: [
      {
        name: "Midmodmood",
        user: "@midmod.mood",
        followers: "236k followers on Instagram",
        channel: "instagram",
        img: "midmodmood.webp",
      },
      {
        name: "Tina Larsson, The Folson Group",
        user: "@tinalarssonli",
        followers: "12k followers on LinkedIn",
        channel: "linkedin",
        img: "tina-larsson.webp",
      },
      {
        name: "Pia Cato",
        user: "@vanillapodbakery",
        followers: "5.5k followers on Instagram",
        channel: "instagram",
        img: "pia-cato.webp",
      },
    ],
  },
  {
    label: "Agencies",
    theme: "aqua",
    heading: "The most trusted tool for freelancers and agencies",
    text: "SMC has been helping freelancers, consultants, and agencies grow their client accounts for more than a decade.",
    items: [
      "Intuitive review and approval workflows",
      "Custom access and permissions",
      "Unlimited user invites",
      "Pricing that scales with your business",
      "99% post reliability",
    ],
    eyebrow: "The SMC agency community",
    members: [
      {
        name: "Red Pigeon Media",
        user: "@redpigeonmedia",
        followers: "2.2k followers on Instagram",
        channel: "instagram",
        img: "red-pigeon-media.webp",
      },
      {
        name: "Shored Up Digital",
        user: "@shoredupdigital",
        followers: "2.5k followers on Instagram",
        channel: "instagram",
        img: "shored-up-digital.webp",
      },
      {
        name: "Influence Media",
        user: "@weareinfluencemedia",
        followers: "5.5k followers on Instagram",
        channel: "instagram",
        img: "influence-media.webp",
      },
    ],
  },
];

function CheckIcon({ color }: { color: string }) {
  return (
    <svg
      className="!size-[1.125rem] ![block-size:1.125rem] ![inline-size:1.125rem] shrink-0"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      aria-hidden
      style={{ color }}
    >
      <path
        fill="currentColor"
        d="M20.707 5.293a1 1 0 0 1 0 1.414l-11 11a1 1 0 0 1-1.414 0l-5-5a1 1 0 1 1 1.414-1.414L9 15.586 19.293 5.293a1 1 0 0 1 1.414 0Z"
      />
    </svg>
  );
}

function MemberCard({ member, theme }: { member: Member; theme: Theme }) {
  const Icon = CHANNEL_ICONS[member.channel];
  const t = THEME[theme];
  return (
    <div
      className={[
        "inline-flex !flex-col !items-center !text-center",
        "!rounded-[0.625rem]",
        THEME_BG_050[theme],
        "![padding-block:clamp(1rem,0.6094rem+1.9531vi,2.25rem)]",
        "![padding-inline:clamp(1rem,0.9609rem+0.1953vi,1.125rem)]",
      ].join(" ")}
      style={{
        backgroundColor: t.accent050,
        background: t.accent050,
        paddingBlock: SPACE_3_5,
        paddingInline: SPACE_3,
        borderRadius: "0.625rem",
        textAlign: "center",
      }}
    >
      <span
        className="relative mb-[clamp(0.75rem,0.7109rem+0.1953vi,0.875rem)] inline-flex"
        style={{ marginBlockEnd: SPACE_2 }}
      >
        <span className="relative flex !size-[4.75rem] ![block-size:4.75rem] ![inline-size:4.75rem] items-center justify-center overflow-hidden !rounded-full">
          <img
            alt=""
            width={76}
            height={76}
            loading="lazy"
            decoding="async"
            className="!size-full !h-full !w-full object-cover"
            style={{ color: "transparent" }}
            src={`${CDN}/width=256,quality=75,format=auto/img/testimonials/${member.img}`}
            srcSet={`${CDN}/width=96,quality=75,format=auto/img/testimonials/${member.img} 1x, ${CDN}/width=256,quality=75,format=auto/img/testimonials/${member.img} 2x`}
          />
        </span>
        <span
          className={[
            "absolute bottom-0 -end-[0.75rem] flex items-center justify-center",
            "!rounded-full !border-2 !border-solid !border-white !p-1 text-white",
            CHANNEL_BG[member.channel] || "bg-black",
          ].join(" ")}
        >
          <span className="flex !size-8 ![block-size:2rem] ![inline-size:2rem] items-center justify-center [&_svg]:!size-8 [&_svg]:![block-size:2rem] [&_svg]:![inline-size:2rem]">
            {Icon ? <Icon /> : null}
          </span>
        </span>
      </span>
      <h5 className="sr-only">{member.name}</h5>
      <dl className="m-0 flex flex-1 flex-col">
        <div>
          <dt className="sr-only">Username</dt>
          <dd
            className={[
              "!m-0",
              "![margin-block-end:clamp(0.5rem,0.4805rem+0.0977vi,0.5625rem)]",
              "![font-size:clamp(0.89375rem,0.8703rem+0.1172vi,0.96875rem)]",
              "!font-semibold !leading-[1.4] !tracking-[0.0075em]",
              "text-[#213130]",
              "![font-family:Figtree,ui-sans-serif,system-ui,sans-serif]",
            ].join(" ")}
            style={{
              fontFamily: FONT_SANS,
              fontSize: STEP_M1,
              fontWeight: 600,
              lineHeight: 1.4,
              letterSpacing: "0.0075em",
              margin: 0,
              marginBlockEnd: SPACE_1,
              color: BRAND,
            }}
          >
            {member.user}
          </dd>
        </div>
        <div>
          <dt className="sr-only">Followers</dt>
          <dd
            className={[
              "!m-0 uppercase",
              "![font-size:clamp(0.8rem,0.7863rem+0.0687vi,0.84375rem)]",
              "!font-medium !leading-[1.4] !tracking-[0.0625em]",
              "text-[#213130]",
              "![font-family:Figtree,ui-sans-serif,system-ui,sans-serif]",
            ].join(" ")}
            style={{
              fontFamily: FONT_SANS,
              fontSize: STEP_M2,
              fontWeight: 500,
              lineHeight: 1.4,
              letterSpacing: "0.0625em",
              textTransform: "uppercase",
              margin: 0,
              color: BRAND,
            }}
          >
            {member.followers}
          </dd>
        </div>
      </dl>
    </div>
  );
}

/**
 * Audiences / verticals tabs — React + pure Tailwind,
 * matched to marketing-landing.css VerticalsSection_*.
 */
export function LandingAudiences() {
  const headingId = useId();
  const [active, setActive] = useState(0);
  const tab = TABS[active];
  const t = THEME[tab.theme];

  return (
    <section
      id="audiences"
      className="!tracking-[0.0075em] text-[#213130]"
      aria-labelledby={headingId}
      style={{ fontFamily: FONT_SANS, color: BRAND, letterSpacing: "0.0075em" }}
    >
      <div className={CONTAINER}>
        <div
          className="flex !flex-col !bg-transparent py-[clamp(2rem,1.2188rem+3.9063vi,4.5rem)]"
          style={{
            gap: SPACE_3_5,
            paddingBlock: SPACE_5_7,
            flexDirection: "column",
            backgroundColor: "transparent",
            color: BRAND,
          }}
          data-theme={tab.theme}
        >
          <h2 className="sr-only" id={headingId}>
            Whoever you are, we’ve got you covered
          </h2>

          {/*
            Tab pills — VerticalsSection_tabTrigger__TAWSY
            padding .5em 1.25em | radius 100vmax | 1px brand border | step--1
            inactive: transparent bg | active/hover: theme-100
          */}
          <div
            role="tablist"
            aria-label="Audience"
            className="flex !flex-wrap !items-center !justify-center"
            style={{ gap: SPACE_1, alignItems: "center", justifyContent: "center" }}
          >
            {TABS.map((item, i) => {
              const selected = i === active;
              const theme = THEME[item.theme];
              const tabStyle: CSSProperties = {
                fontFamily: FONT_SANS,
                fontSize: STEP_M1,
                color: BRAND,
                backgroundColor: selected ? theme.accent100 : "transparent",
                borderWidth: "0.0625rem",
                borderStyle: "solid",
                borderColor: BRAND,
                borderRadius: "100vmax",
                outlineStyle: "solid",
                outlineWidth: "0.125rem",
                outlineOffset: "0.125rem",
                outlineColor: "transparent",
                cursor: "pointer",
                transitionProperty: "outline-color, background-color, color",
                transitionDuration: "0.15s",
                transitionTimingFunction: "ease-out",
                opacity: 1,
                letterSpacing: "0.0075em",
                lineHeight: 1.4,
                fontWeight: 400,
                appearance: "none",
                WebkitAppearance: "none",
              };
              return (
                <button
                  key={item.label}
                  type="button"
                  role="tab"
                  id={`smc-audience-tab-${i}`}
                  aria-selected={selected}
                  aria-controls={`smc-audience-panel-${i}`}
                  tabIndex={selected ? 0 : -1}
                  data-theme={item.theme}
                  onClick={() => setActive(i)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.accent100;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = selected
                      ? theme.accent100
                      : "transparent";
                  }}
                  onFocus={(e) => {
                    if (e.currentTarget.matches(":focus-visible")) {
                      e.currentTarget.style.outlineColor = BRAND;
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outlineColor = "transparent";
                  }}
                  className={[
                    /* Beat marketing button reset: padding/radius/bg/font */
                    "!m-0 !cursor-pointer !border-solid !shrink-0",
                    "!rounded-full ![border-radius:100vmax]",
                    "!border ![border-width:0.0625rem] !border-[#213130]",
                    /* Tighter horizontal pad on narrow viewports so 3 pills fit/wrap cleanly */
                    "!px-[0.875em] !py-[0.5em] ![padding:0.5em_0.875em]",
                    "min-[24rem]:!px-[1.25em] min-[24rem]:![padding:0.5em_1.25em]",
                    "![font-size:clamp(0.89375rem,0.8703rem+0.1172vi,0.96875rem)]",
                    "!font-normal !leading-[1.4] !tracking-[0.0075em] !text-[#213130]",
                    "![font-family:Figtree,ui-sans-serif,system-ui,sans-serif]",
                    "!opacity-100",
                    "!outline !outline-2 !outline-offset-2 !outline-transparent",
                    "transition-[outline-color,background-color,color] duration-150 ease-out",
                    "focus-visible:!outline-[#213130]",
                  ].join(" ")}
                  style={tabStyle}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            id={`smc-audience-panel-${active}`}
            aria-labelledby={`smc-audience-tab-${active}`}
            tabIndex={0}
          >
            <div
              className={[
                "grid !items-center overflow-hidden !bg-transparent",
                "p-[clamp(1rem,0.6094rem+1.9531vi,2.25rem)]",
                "min-[36rem]:!p-0",
                "min-[84rem]:grid-cols-[2fr_3fr]",
                "![gap:clamp(1rem,0.6094rem+1.9531vi,2.25rem)]",
                "min-[84rem]:![gap:clamp(2rem,1.9219rem+0.3906vi,2.25rem)]",
              ].join(" ")}
              style={{
                alignItems: "center",
                gap: SPACE_3_5,
                backgroundColor: "transparent",
                color: BRAND,
              }}
              data-theme={tab.theme}
            >
              {/* Left: copy — Stolzl headline, Figtree body + checklist */}
              <div
                className="flex !flex-col !items-center !justify-center !text-center"
                style={{ textAlign: "center" }}
              >
                {/*
                  Non-h4: marketing h4–h6 { font-size: inherit } kills step-2.
                  Same class for Creators / Small businesses / Agencies.
                */}
                <p
                  role="heading"
                  aria-level={4}
                  className={HEADLINE_CLASS}
                  style={HEADLINE_STYLE}
                >
                  {tab.heading}
                </p>
                <p
                  className={[
                    "!m-0 max-w-[60ch]",
                    "![margin-block-end:clamp(2rem,1.9219rem+0.3906vi,2.25rem)]",
                    "![font-size:clamp(0.89375rem,0.8703rem+0.1172vi,0.96875rem)]",
                    "!font-normal !leading-[1.4] !tracking-[0.0075em] text-[#213130]",
                    "![font-family:Figtree,ui-sans-serif,system-ui,sans-serif]",
                  ].join(" ")}
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: STEP_M1,
                    fontWeight: 400,
                    lineHeight: 1.4,
                    letterSpacing: "0.0075em",
                    margin: 0,
                    marginBlockEnd: SPACE_5,
                    maxInlineSize: "60ch",
                    color: BRAND,
                  }}
                >
                  {tab.text}
                </p>
                <ul
                  className={[
                    "!m-0 flex !list-none !flex-col !items-stretch !justify-center !p-0",
                    "min-[36rem]:!flex-row min-[36rem]:!flex-wrap min-[36rem]:!items-center",
                    "![font-size:clamp(0.89375rem,0.8703rem+0.1172vi,0.96875rem)]",
                    "![font-family:Figtree,ui-sans-serif,system-ui,sans-serif]",
                  ].join(" ")}
                  style={{
                    gap: SPACE_2,
                    fontSize: STEP_M1,
                    fontFamily: FONT_SANS,
                    paddingInlineStart: 0,
                    listStyle: "none",
                    margin: 0,
                  }}
                >
                  {tab.items.map((item) => (
                    <li
                      key={item}
                      className="flex !items-start !text-left min-[36rem]:!items-center"
                      style={{ gap: SPACE_1 }}
                    >
                      <CheckIcon color={t.accent800} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: community panel + creator cards */}
              <div
                className={[
                  "grid !rounded-[1.25rem]",
                  THEME_BG_100[tab.theme],
                ].join(" ")}
                style={{
                  backgroundColor: t.accent100,
                  background: t.accent100,
                  borderRadius: "1.25rem",
                  padding: SPACE_3_5,
                  gap: SPACE_3,
                }}
              >
                <p
                  className={[
                    "!m-0 uppercase",
                    "![font-size:clamp(0.89375rem,0.8703rem+0.1172vi,0.96875rem)]",
                    "!font-medium !leading-[1.4] !tracking-[0.0625em]",
                    "![font-family:Figtree,ui-sans-serif,system-ui,sans-serif]",
                  ].join(" ")}
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: STEP_M1,
                    fontWeight: 500,
                    lineHeight: 1.4,
                    letterSpacing: "0.0625em",
                    textTransform: "uppercase",
                    margin: 0,
                    color: t.accent900,
                  }}
                >
                  {tab.eyebrow}
                </p>
                <div className="grid grid-cols-1 gap-[clamp(1rem,0.9609rem+0.1953vi,1.125rem)] min-[36rem]:grid-cols-2 min-[48rem]:grid-cols-3">
                  {tab.members.map((m) => (
                    <MemberCard key={m.user} member={m} theme={tab.theme} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
