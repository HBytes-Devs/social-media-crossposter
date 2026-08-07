import { useId } from "react";

const CDN = "https://buffer.com/cdn-cgi/image";

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
const STEP_3 = "clamp(1.95625rem, 1.7056rem + 1.2375vi, 2.6625rem)"; // --font-size-step-3
const SPACE_1 = "clamp(0.5rem, 0.4805rem + 0.0977vi, 0.5625rem)"; // --space-step-1
const SPACE_3 = "clamp(1rem, 0.9609rem + 0.1953vi, 1.125rem)"; // --space-step-3
const SPACE_3_5 = "clamp(1rem, 0.6094rem + 1.9531vi, 2.25rem)"; // --space-step-3-step-5
const SPACE_5_7 = "clamp(2rem, 1.2188rem + 3.9063vi, 4.5rem)"; // --space-step-5-step-7

const RAISED =
  "shadow-[0_0.25rem_0.75rem_-0.125rem_rgba(23,23,23,0.10),0_0_0.0625rem_0.0625rem_rgba(23,23,23,0.05)]";

function srcSet(path: string) {
  return [
    `${CDN}/width=640,quality=75,format=auto/img/homepage/${path} 1x`,
    `${CDN}/width=1920,quality=75,format=auto/img/homepage/${path} 2x`,
  ].join(", ");
}

function src(path: string) {
  return `${CDN}/width=1920,quality=75,format=auto/img/homepage/${path}`;
}

type Theme = "coral" | "purple" | "orange" | "aqua";

type Card = {
  theme: Theme;
  title: string;
  href: string;
  body: string;
  image: string;
  imageAlt: string;
};

/** SMC palette --color-*-300 hex from marketing-landing.css */
const THEME_BG: Record<Theme, string> = {
  coral: "bg-[#ffb2a8]",
  purple: "bg-[#d4c2ff]",
  orange: "bg-[#ffbb8a]",
  aqua: "bg-[#9feae2]",
};

const CARDS: Card[] = [
  {
    theme: "coral",
    title: "Collaborate",
    href: "#features",
    body: "Manage, edit, and approve social media posts from your team.",
    image: "collaborate.webp",
    imageAlt:
      "Collaborate space with a publishing calendar and team approval workflows.",
  },
  {
    theme: "purple",
    title: "Mobile app",
    href: "#features",
    body: "Manage your social media accounts from anywhere.",
    image: "mobile-app.webp",
    imageAlt: "Mobile app with multiple social media accounts and a publishing queue.",
  },
  {
    theme: "orange",
    title: "Start page",
    href: "#features",
    body: "Turn your social bio into a powerful, personalized hub.",
    image: "start-page.webp",
    imageAlt: "Start Page social bio with custom theming, images, and links.",
  },
  {
    theme: "aqua",
    title: "AI assistant",
    href: "#features",
    body: "Brainstorm ideas, rewrite content, and craft platform-specific posts.",
    image: "ai-assistant.webp",
    imageAlt: "AI Assistant with options to generate posts from prompts and refine content.",
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

function MoreFeatureCard({ card }: { card: Card }) {
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
      <div
        className={[
          "flex flex-col",
          "![padding-block-start:clamp(0.5rem,0.4805rem+0.0977vi,0.5625rem)]",
          "![padding-inline:clamp(0.5rem,0.4805rem+0.0977vi,0.5625rem)]",
          "gap-[clamp(0.5rem,0.4805rem+0.0977vi,0.5625rem)]",
        ].join(" ")}
        style={{
          paddingBlockStart: SPACE_1,
          paddingInline: SPACE_1,
          gap: SPACE_1,
        }}
      >
        <div
          className={[
            "flex items-center justify-center overflow-hidden rounded-[0.625rem]",
            THEME_BG[card.theme],
          ].join(" ")}
        >
          <img
            alt={card.imageAlt}
            loading="lazy"
            decoding="async"
            width={640}
            height={512}
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

      {/*
        Marketing CSS is unlayered and beats Tailwind @layer utilities:
        - h1–h6 { font-size: inherit } → use <p> for title (not h3)
        - p,h3,… { margin: 0 } → !mb + inline marginBlockEnd on title
        Title = text-heading tokens at step-0 (inherits body size in source)
        CTA = step--1 / underline / 0.125rem offset
      */}
      <div
        className={[
          "flex flex-1 flex-col justify-between",
          "gap-[clamp(1rem,0.9609rem+0.1953vi,1.125rem)]",
          "![padding-block:clamp(1rem,0.9609rem+0.1953vi,1.125rem)]",
          "![padding-inline:clamp(1rem,0.9609rem+0.1953vi,1.125rem)]",
        ].join(" ")}
        style={{
          gap: SPACE_3,
          paddingBlock: SPACE_3,
          paddingInline: SPACE_3,
        }}
      >
        <div>
          <p
            className={[
              "mt-0",
              "![margin-block-end:clamp(1rem,0.9609rem+0.1953vi,1.125rem)]",
              "![font-size:clamp(1rem,0.9565rem+0.2174vi,1.125rem)]",
              "text-[#213130]",
              "!font-normal !leading-[1.1] !tracking-[-0.02em]",
              "![font-family:Stolzl,ui-sans-serif,system-ui,sans-serif]",
            ].join(" ")}
            style={{
              fontFamily: FONT_HEADING,
              fontSize: STEP_0,
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginBlockEnd: SPACE_3,
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
        </div>

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
 * “…and so much more!” feature cards — pure Tailwind (no MoreFeaturesSection_* / text-heading).
 * Tokens from marketing-landing.css MoreFeaturesSection_* + text-heading.
 */
export function LandingMoreFeatures() {
  const headingId = useId();

  return (
    <section
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
      <div
        className={[CONTAINER, "grid gap-[clamp(1rem,0.6094rem+1.9531vi,2.25rem)]"].join(
          " ",
        )}
        style={{ gap: SPACE_3_5 }}
      >
        <h2
          id={headingId}
          className={[
            "m-0 text-center",
            "![font-size:clamp(1.95625rem,1.7056rem+1.2375vi,2.6625rem)]",
            "!font-normal !leading-[1.1] !tracking-[-0.02em] text-[#213130]",
            "![font-family:Stolzl,ui-sans-serif,system-ui,sans-serif]",
          ].join(" ")}
          style={{
            fontFamily: FONT_HEADING,
            fontSize: STEP_3,
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            margin: 0,
            textAlign: "center",
          }}
        >
          <span aria-hidden>…</span>and so much more!
        </h2>

        <div
          className={[
            "grid grid-cols-1 justify-center",
            "gap-[clamp(1rem,0.9609rem+0.1953vi,1.125rem)]",
            "min-[32rem]:grid-cols-2",
            /* 4-up is too cramped between md–lg; match marketing ≥64rem */
            "lg:grid-cols-4",
          ].join(" ")}
          style={{ gap: SPACE_3 }}
        >
          {CARDS.map((card) => (
            <MoreFeatureCard key={card.title} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
