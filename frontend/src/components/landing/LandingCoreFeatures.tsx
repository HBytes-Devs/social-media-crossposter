import { useId } from "react";

const CDN = "https://buffer.com/cdn-cgi/image";
const IMG_SIZES =
  "(min-width: 82.125rem) 612px, (min-width: 48rem) calc((100vw - (2 * clamp(1rem, 0.6094rem + 1.9531vw, 2.25rem)) - clamp(1rem, 0.9609rem + 0.1953vw, 1.125rem)) / 2), calc(100vw - (2 * clamp(1rem, 0.6094rem + 1.9531vw, 2.25rem)))";

const WIDTHS = [16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840];

/** Matches marketing --container-max-inline-size-wide + --space-step-3-step-5 */
const CONTAINER =
  "mx-auto max-w-[93.5rem] px-[clamp(1rem,0.6094rem+1.9531vi,2.25rem)]";

const FONT_SANS =
  '"Figtree", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
const FONT_HEADING =
  '"Stolzl", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

/** Marketing fluid type / space steps (vi units from marketing-landing.css) */
const STEP_M1 = "clamp(0.89375rem, 0.8703rem + 0.1172vi, 0.96875rem)"; // --font-size-step--1
const STEP_0 = "clamp(1rem, 0.9565rem + 0.2174vi, 1.125rem)"; // --font-size-step-0
const STEP_1 = "clamp(1.25rem, 1.1632rem + 0.4341vi, 1.5rem)"; // --font-size-step-1
const SPACE_1 = "clamp(0.5rem, 0.4805rem + 0.0977vi, 0.5625rem)"; // --space-step-1
const SPACE_3 = "clamp(1rem, 0.9609rem + 0.1953vi, 1.125rem)"; // --space-step-3
const SPACE_4 = "clamp(1.5rem, 1.4414rem + 0.293vi, 1.6875rem)"; // --space-step-4
const SPACE_5_7 = "clamp(2rem, 1.2188rem + 3.9063vi, 4.5rem)"; // --space-step-5-step-7

const RAISED =
  "shadow-[0_0.25rem_0.75rem_-0.125rem_rgba(23,23,23,0.10),0_0_0.0625rem_0.0625rem_rgba(23,23,23,0.05)]";

function srcSet(path: string) {
  return WIDTHS.map(
    (w) => `${CDN}/width=${w},quality=75,format=auto/img/homepage/${path} ${w}w`,
  ).join(", ");
}

function src(path: string) {
  return `${CDN}/width=3840,quality=75,format=auto/img/homepage/${path}`;
}

type Align = "center" | "right";
type Theme = "fuscia" | "green" | "yellow" | "blue";

type Card = {
  theme: Theme;
  eyebrow: string;
  title: string;
  href: string;
  body: string;
  image: string;
  imageAlt: string;
  align: Align;
};

const THEME_BG: Record<Theme, string> = {
  fuscia: "bg-[#f3bdff]",
  green: "bg-[#b0ec9c]",
  yellow: "bg-[#ffd88a]",
  blue: "bg-[#addaff]",
};

const ALIGN_CLASS: Record<Align, string> = {
  center: "justify-center",
  right: "justify-end",
};

const CARDS: Card[] = [
  {
    theme: "fuscia",
    eyebrow: "Publish",
    title: "The most complete set of publishing integrations, ever",
    href: "#features",
    body: "Schedule your content to the most popular platforms including Facebook, Instagram, TikTok, LinkedIn, Threads, Bluesky, YouTube Shorts, Pinterest, Google Business, Mastodon and X.",
    image: "publish-composer.webp",
    imageAlt:
      "Publish space with a queue for multiple social media accounts, a calendar view, and scheduling options.",
    align: "center",
  },
  {
    theme: "green",
    eyebrow: "Create",
    title: "Turn any idea into the perfect post",
    href: "#features",
    body: "Whether you’re flying solo or working with a team, SMC has all the features to help you create, organize, and repurpose your content for any channel. There’s also an AI Assistant if you need it.",
    image: "create-ideas.webp",
    imageAlt:
      "Create space with columns and sorting for content ideas, including an AI Assistant for generating posts and refining content.",
    align: "right",
  },
  {
    theme: "yellow",
    eyebrow: "Community",
    title: "Reply to comments in a flash",
    href: "#features",
    body: "Engage with your audience across all your channels at 10x speed. SMC will help you triage and respond to comments from one simple dashboard.",
    image: "community-comments.webp",
    imageAlt: "Community space with filterable and sortable comments across multiple social media accounts.",
    align: "center",
  },
  {
    theme: "blue",
    eyebrow: "Insights",
    title: "Answers, not just analytics",
    href: "#features",
    body: "Whether it’s basic analytics or in-depth reporting, SMC will help you learn what works and how to improve.",
    image: "insights.webp",
    imageAlt: "Insights reporting dashboard with analytics and recommendations.",
    align: "right",
  },
];

function CtaArrow() {
  return (
    <svg
      className="!size-4 ![block-size:1rem] ![inline-size:1rem] transition-colors duration-150 ease-out"
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

function FeatureCard({ card }: { card: Card }) {
  return (
    <div
      className={[
        "group relative flex flex-col rounded-[1.25rem] bg-[#fefdfb]",
        RAISED,
        "transition-transform duration-150 ease-out will-change-transform",
        "hover:-translate-y-1",
      ].join(" ")}
      data-theme={card.theme}
    >
      {/*
        DOM order matches source; flex `order` paints image first.
        Marketing CSS is unlayered and beats Tailwind @layer utilities:
        - h1–h6 { font-size: inherit } → use <p> for eyebrow (not h3)
        - p,h3,… { margin: 0 } → !mb + inline marginBlockEnd on eyebrow/title
        Eyebrow = text-eyebrow (step--1 / medium / tracking 0.0625em / lh 1.4)
        Title = text-heading + step-1 / Stolzl / tracking -0.02em / lh 1.1 / min 2lh
      */}
      <p
        className={[
          "order-1 mt-0",
          "!pt-[clamp(1rem,0.9609rem+0.1953vi,1.125rem)]",
          "![padding-inline:clamp(1.5rem,1.4414rem+0.293vi,1.6875rem)]",
          "![margin-block-end:clamp(1rem,0.9609rem+0.1953vi,1.125rem)]",
          "![font-size:clamp(0.89375rem,0.8703rem+0.1172vi,0.96875rem)]",
          "uppercase text-[#337047]",
          "!font-medium !leading-[1.4] !tracking-[0.0625em]",
          "![font-family:Figtree,ui-sans-serif,system-ui,sans-serif]",
        ].join(" ")}
        style={{
          fontFamily: FONT_SANS,
          fontSize: STEP_M1,
          fontWeight: 500,
          lineHeight: 1.4,
          letterSpacing: "0.0625em",
          marginBlockEnd: SPACE_3,
          paddingBlockStart: SPACE_3,
          paddingInline: SPACE_4,
        }}
      >
        {card.eyebrow}
      </p>

      <p
        className={[
          "order-2 mt-0 ![min-block-size:2lh]",
          "![padding-inline:clamp(1.5rem,1.4414rem+0.293vi,1.6875rem)]",
          "![margin-block-end:clamp(0.5rem,0.4805rem+0.0977vi,0.5625rem)]",
          "![font-size:clamp(1.25rem,1.1632rem+0.4341vi,1.5rem)]",
          "text-[#213130]",
          "!font-normal !leading-[1.1] !tracking-[-0.02em]",
          "![font-family:Stolzl,ui-sans-serif,system-ui,sans-serif]",
        ].join(" ")}
        style={{
          fontFamily: FONT_HEADING,
          fontSize: STEP_1,
          fontWeight: 400,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          marginBlockEnd: SPACE_1,
          paddingInline: SPACE_4,
          minBlockSize: "2lh",
        }}
      >
        <a
          className={[
            "text-inherit no-underline outline-none",
            "before:pointer-events-auto before:absolute before:inset-0 before:z-[1]",
            "before:rounded-[1.25rem] before:outline before:outline-2",
            "before:outline-offset-2 before:outline-transparent",
            "before:transition-[outline-color] before:duration-150 before:ease-out",
            "before:content-['']",
            "focus-visible:before:outline-[#213130]",
          ].join(" ")}
          href={card.href}
        >
          {card.title}
        </a>
      </p>

      <div
        className={[
          "order-0",
          "![padding-block-start:clamp(0.5rem,0.4805rem+0.0977vi,0.5625rem)]",
          "![padding-inline:clamp(0.5rem,0.4805rem+0.0977vi,0.5625rem)]",
        ].join(" ")}
        style={{ paddingBlockStart: SPACE_1, paddingInline: SPACE_1 }}
      >
        <div
          className={[
            "flex flex-col overflow-hidden text-center",
            "rounded-[0.625rem]",
            "gap-[clamp(1rem,0.6094rem+1.9531vi,2.25rem)]",
            THEME_BG[card.theme],
          ].join(" ")}
        >
          <div className={["flex", ALIGN_CLASS[card.align]].join(" ")}>
            <img
              alt={card.imageAlt}
              loading="lazy"
              decoding="async"
              width={612}
              height={342}
              sizes={IMG_SIZES}
              srcSet={srcSet(card.image)}
              src={src(card.image)}
              className={[
                /* Beat marketing img reset: block-size:auto; max-inline-size:100% */
                "!h-auto ![block-size:auto]",
                "!w-full ![inline-size:100%]",
                "!max-w-full ![max-inline-size:100%]",
                "transition-transform duration-[400ms] ease-out will-change-transform",
                "motion-safe:group-hover:scale-105",
              ].join(" ")}
              style={{ color: "transparent" }}
            />
          </div>
        </div>
      </div>

      <div
        className={[
          "order-3 flex flex-1 flex-col justify-between",
          "gap-[clamp(1.5rem,1.4414rem+0.293vi,1.6875rem)]",
          "![padding-inline:clamp(1.5rem,1.4414rem+0.293vi,1.6875rem)]",
          "![padding-block-end:clamp(1.5rem,1.4414rem+0.293vi,1.6875rem)]",
        ].join(" ")}
        style={{
          gap: SPACE_4,
          paddingInline: SPACE_4,
          paddingBlockEnd: SPACE_4,
        }}
      >
        <p
          className={[
            "!m-0",
            "![font-size:clamp(1rem,0.9565rem+0.2174vi,1.125rem)]",
            "!font-normal !leading-[1.4] !tracking-[0.0075em] text-[#213130]",
            "![font-family:Figtree,ui-sans-serif,system-ui,sans-serif]",
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
          {card.body}
        </p>
        <span
          className={[
            "flex items-center gap-[0.5ch] underline underline-offset-[0.125rem]",
            "![font-size:clamp(0.89375rem,0.8703rem+0.1172vi,0.96875rem)]",
            "!leading-[1.4] !tracking-[0.0075em] text-[#213130]",
            "![font-family:Figtree,ui-sans-serif,system-ui,sans-serif]",
          ].join(" ")}
          aria-hidden
          style={{
            fontFamily: FONT_SANS,
            fontSize: STEP_M1,
            lineHeight: 1.4,
            letterSpacing: "0.0075em",
            textUnderlineOffset: "0.125rem",
          }}
        >
          <span>Learn more</span>
          <span className="flex shrink-0 items-center justify-center transition-transform duration-150 ease-out will-change-transform group-hover:-rotate-45">
            <CtaArrow />
          </span>
        </span>
      </div>
    </div>
  );
}

/**
 * Core features 2×2 cards — pure Tailwind (no CoreFeaturesSection_* / CoreFeatureCard_*).
 * Tokens from marketing-landing.css CoreFeatureCard_* / CoreFeaturesSection_* + text-eyebrow / text-heading.
 */
export function LandingCoreFeatures() {
  const headingId = useId();

  return (
    <section
      id="features"
      className={[
        "pt-[clamp(2rem,1.2188rem+3.9063vi,4.5rem)]",
        "tracking-[0.0075em] text-[#213130]",
        "![font-size:clamp(1rem,0.9565rem+0.2174vi,1.125rem)] !leading-[1.4]",
      ].join(" ")}
      aria-labelledby={headingId}
      style={{
        fontFamily: FONT_SANS,
        fontSize: STEP_0,
        letterSpacing: "0.0075em",
        lineHeight: 1.4,
        paddingBlockStart: SPACE_5_7,
      }}
    >
      <h2 className="sr-only" id={headingId}>
        Core features
      </h2>
      <div className={CONTAINER}>
        <div
          className="grid grid-cols-1 gap-[clamp(1rem,0.9609rem+0.1953vi,1.125rem)] md:grid-cols-2"
          style={{ gap: SPACE_3 }}
        >
          {CARDS.map((card) => (
            <FeatureCard key={card.eyebrow} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
