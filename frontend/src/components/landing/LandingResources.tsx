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
const STEP_1 = "clamp(1.25rem, 1.1632rem + 0.4341vi, 1.5rem)"; // --font-size-step-1
const STEP_3 = "clamp(1.95625rem, 1.7056rem + 1.2375vi, 2.6625rem)"; // --font-size-step-3
const SPACE_1 = "clamp(0.5rem, 0.4805rem + 0.0977vi, 0.5625rem)"; // --space-step-1
const SPACE_3 = "clamp(1rem, 0.9609rem + 0.1953vi, 1.125rem)"; // --space-step-3
const SPACE_4 = "clamp(1.5rem, 1.4414rem + 0.293vi, 1.6875rem)"; // --space-step-4
const SPACE_5 = "clamp(2rem, 1.9219rem + 0.3906vi, 2.25rem)"; // --space-step-5
const SPACE_5_7 = "clamp(2rem, 1.2188rem + 3.9063vi, 4.5rem)"; // --space-step-5-step-7 / --gutter

const RAISED =
  "shadow-[0_0.25rem_0.75rem_-0.125rem_rgba(23,23,23,0.10),0_0_0.0625rem_0.0625rem_rgba(23,23,23,0.05)]";

function srcSet(path: string, w1: number, w2: number) {
  return [
    `${CDN}/width=${w1},quality=75,format=auto/img/homepage/${path} 1x`,
    `${CDN}/width=${w2},quality=75,format=auto/img/homepage/${path} 2x`,
  ].join(", ");
}

function src(path: string, w: number) {
  return `${CDN}/width=${w},quality=75,format=auto/img/homepage/${path}`;
}

type Theme = "purple" | "aqua" | "coral" | "fuscia" | "yellow";

type Resource = {
  theme: Theme;
  href: string;
  title: string;
  text: string;
  small: string;
  large: string;
  largeW2: number;
  horizontal?: boolean;
  /** Image first (Best Time to Post) — data-content-trailing in source */
  contentTrailing?: boolean;
};

/**
 * SMC --color-*-300 (marketing-landing.css).
 * purple/yellow are oklch in source; use the hex painted on the live homepage.
 */
const THEME_HEX: Record<Theme, string> = {
  purple: "#d4c2ff",
  aqua: "#9feae2",
  coral: "#ffb2a8",
  fuscia: "#f3bdff",
  yellow: "#ffd88a",
};

const THEME_BG: Record<Theme, string> = {
  purple: "!bg-[#d4c2ff]",
  aqua: "!bg-[#9feae2]",
  coral: "!bg-[#ffb2a8]",
  fuscia: "!bg-[#f3bdff]",
  yellow: "!bg-[#ffd88a]",
};

const RESOURCES: Resource[] = [
  {
    theme: "purple",
    href: "/free-tools",
    title: "Free Marketing Tools",
    text: "A collection of free tools to make your social media marketing easier and more effective",
    small: "free-marketing-tools-small.webp",
    large: "free-marketing-tools-large.webp",
    largeW2: 828,
  },
  {
    theme: "aqua",
    href: "/social-media-terms",
    title: "Social Media Glossary",
    text: "A glossary of the most popular terms to help you make sense of all the social media lingo",
    small: "social-media-glossary-small.webp",
    large: "social-media-glossary-large.webp",
    largeW2: 750,
    horizontal: true,
  },
  {
    theme: "coral",
    href: "/social-media-marketing",
    title: "Social Media Marketing 101",
    text: "Your go-to guide for mastering the basics of social media and beyond",
    small: "social-media-marketing-101-small.webp",
    large: "social-media-marketing-101-large.webp",
    largeW2: 828,
  },
  {
    theme: "fuscia",
    href: "/resources/best-time-to-post-social-media",
    title: "Best Time to Post",
    text: "Discover the best times to post on social media to maximize your engagement",
    small: "best-time-to-post-small.webp",
    large: "best-time-to-post-large.webp",
    largeW2: 828,
    contentTrailing: true,
  },
  {
    theme: "yellow",
    href: "/resources/",
    title: "Social Media Resources",
    text: "A collection of articles and interviews packed with tips, stories, and insights to level up your social media marketing game",
    small: "social-media-resources-small.webp",
    large: "social-media-resources-large.webp",
    largeW2: 828,
  },
];

/**
 * Bento grid areas — ResourcesSection_resourceContainer nth-of-type at ≥64rem.
 * Source uses `1/5/1/-1` for glossary; CSS Grid treats end===start as start+1 → one row.
 * Write explicit `1/5/2/-1` so the span is unambiguous.
 */
const GRID_AREA = [
  "lg:[grid-area:1/1/3/5]",
  "lg:[grid-area:1/5/2/-1]",
  "lg:[grid-area:3/1/-1/5]",
  "lg:[grid-area:2/5/-1/8]",
  "lg:[grid-area:2/8/-1/-1]",
] as const;

function CtaArrow() {
  return (
    <svg
      className="!size-4 ![block-size:1rem] ![inline-size:1rem] text-[#213130] transition-colors duration-150 ease-out"
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

function ResourceCard({ resource, index }: { resource: Resource; index: number }) {
  return (
    <div
      className={[
        /* shrink-0 for mobile horizontal scroll; grid items fill their area at lg */
        "flex shrink-0 lg:!h-full lg:!min-h-0 lg:!min-w-0 lg:!shrink",
        "!rounded-[1.25rem] !bg-[#fefdfb]",
        "![padding:clamp(0.5rem,0.4805rem+0.0977vi,0.5625rem)]",
        RAISED,
        GRID_AREA[index],
      ].join(" ")}
      style={{
        padding: SPACE_1,
        backgroundColor: "#fefdfb",
        borderRadius: "1.25rem",
      }}
      {...(resource.contentTrailing ? { "data-content-trailing": "true" } : {})}
    >
      <div
        className={[
          "group relative !flex w-64 flex-col justify-between overflow-hidden",
          "rounded-[calc(1.25rem-clamp(0.5rem,0.4805rem+0.0977vi,0.5625rem))]",
          "transition-[filter] duration-150 ease-out hover:brightness-[1.03]",
          "min-[36rem]:w-80 lg:!h-full lg:!w-full lg:!max-w-none",
          THEME_BG[resource.theme],
          /* marketing unlayered .flex beats lg:grid — force grid for horizontal card */
          resource.horizontal
            ? "lg:!grid lg:!grid-cols-2 lg:!gap-[clamp(1rem,0.9609rem+0.1953vi,1.125rem)]"
            : "",
        ].join(" ")}
        data-theme={resource.theme}
        style={{ backgroundColor: THEME_HEX[resource.theme] }}
      >
        {/*
          Marketing CSS is unlayered and beats Tailwind @layer utilities:
          - h1–h6 { font-size: inherit } → use <p> for title (not h3)
          - p,h3,… { margin: 0 } → !mb + inline marginBlockEnd
          Title = text-heading tokens at step-1 / Stolzl
          Body = Figtree step-0 / #646464
        */}
        <div
          className={[
            resource.contentTrailing ? "order-1" : "",
            "![padding-block:clamp(1.5rem,1.4414rem+0.293vi,1.6875rem)]",
            "![padding-inline:clamp(1rem,0.9609rem+0.1953vi,1.125rem)]",
          ].join(" ")}
          style={{ paddingBlock: SPACE_4, paddingInline: SPACE_3 }}
        >
          <p
            className={[
              "mt-0",
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
            }}
          >
            <a
              href={resource.href}
              className={[
                "flex items-center justify-between",
                "gap-[clamp(0.5rem,0.4805rem+0.0977vi,0.5625rem)]",
                "rounded-[0.625rem] text-inherit no-underline outline-none",
                "before:pointer-events-auto before:absolute before:inset-0 before:z-[1]",
                "before:rounded-[1.25rem] before:outline before:outline-2",
                "before:outline-offset-8 before:outline-transparent",
                "before:transition-[outline-color] before:duration-150 before:ease-out",
                "before:content-['']",
                "focus-visible:before:outline-[#213130]",
              ].join(" ")}
              style={{ gap: SPACE_1 }}
            >
              <span>{resource.title}</span>
              <span className="flex shrink-0 items-center justify-center transition-transform duration-150 ease-out will-change-transform group-hover:-rotate-45">
                <CtaArrow />
              </span>
            </a>
          </p>
          <p
            className={[
              "!m-0",
              "![font-size:clamp(1rem,0.9565rem+0.2174vi,1.125rem)]",
              "!font-normal !leading-[1.4] !tracking-[0.0075em] text-[#646464]",
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
            {resource.text}
          </p>
        </div>

        <div
          className={[
            "pointer-events-none relative",
            resource.contentTrailing ? "order-0" : "",
          ].join(" ")}
        >
          <div className="flex lg:!hidden">
            <img
              alt=""
              width={320}
              height={224}
              loading="lazy"
              decoding="async"
              src={src(resource.small, 640)}
              srcSet={srcSet(resource.small, 384, 640)}
              className="!h-auto ![block-size:auto] !w-full ![inline-size:100%] !max-w-full ![max-inline-size:100%]"
              style={{ color: "transparent" }}
            />
          </div>
          <div className="hidden transition-transform duration-[400ms] ease-out will-change-transform lg:!flex motion-safe:group-hover:scale-105">
            <img
              alt=""
              loading="lazy"
              decoding="async"
              src={src(resource.large, resource.largeW2)}
              srcSet={srcSet(resource.large, 384, resource.largeW2)}
              className="!h-auto ![block-size:auto] !w-full ![inline-size:100%] !max-w-full ![max-inline-size:100%]"
              style={{ color: "transparent" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Resources bento — pure Tailwind (no ResourcesSection_*).
 * Tokens from marketing-landing.css ResourcesSection_* + text-eyebrow / text-heading.
 */
export function LandingResources() {
  const headingId = useId();

  return (
    <section
      id="resources"
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
        {/* Intro: headline left, sub right ≥64rem — ResourcesSection_intro */}
        <div
          className={[
            "![margin-block-end:clamp(2rem,1.9219rem+0.3906vi,2.25rem)]",
            "lg:grid lg:grid-cols-2 lg:items-center",
            "lg:gap-[clamp(2rem,1.2188rem+3.9063vi,4.5rem)]",
          ].join(" ")}
          style={{ marginBlockEnd: SPACE_5 }}
        >
          <div>
            {/*
              Eyebrow = text-eyebrow (step--1 / medium / tracking 0.0625em / lh 1.4 / Figtree)
              Use <p> for visible eyebrow; keep h2 sr/id for a11y label — marketing h2 font-size inherit
            */}
            <h2
              id={headingId}
              className={[
                "mt-0 uppercase text-[#337047]",
                "![margin-block-end:clamp(0.5rem,0.4805rem+0.0977vi,0.5625rem)]",
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
                marginBlockEnd: SPACE_1,
              }}
            >
              Resources
            </h2>
            <p
              className={[
                "mt-0 text-[#213130]",
                "![margin-block-end:clamp(0.5rem,0.4805rem+0.0977vi,0.5625rem)]",
                "![font-size:clamp(1.95625rem,1.7056rem+1.2375vi,2.6625rem)]",
                "!font-normal !leading-[1.1] !tracking-[-0.02em]",
                "![font-family:Stolzl,ui-sans-serif,system-ui,sans-serif]",
              ].join(" ")}
              style={{
                fontFamily: FONT_HEADING,
                fontSize: STEP_3,
                fontWeight: 400,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                marginBlockEnd: SPACE_1,
              }}
            >
              Fuel your social media success
            </p>
          </div>
          <p
            className={[
              "!m-0",
              "![font-size:clamp(1rem,0.9565rem+0.2174vi,1.125rem)]",
              "!font-normal !leading-[1.4] !tracking-[0.0075em] text-[#373737]",
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
            Everything you need to level up your social strategy—in one place.
          </p>
        </div>

        <div
          className={[
            "-mt-1 w-full !overflow-x-auto pt-1",
            "![padding-block-end:clamp(1rem,0.9609rem+0.1953vi,1.125rem)]",
            /* marketing CSS can fight overflow utilities */
            "lg:!overflow-x-visible lg:!justify-center",
          ].join(" ")}
          style={{ paddingBlockEnd: SPACE_3 }}
        >
          {/*
            CRITICAL: marketing-landing.css ships unlayered `.flex{display:flex}` which
            beats Tailwind @layer `lg:grid`. Without `lg:!grid` the bento collapses into
            a single horizontal flex row (what the user was seeing).
          */}
          <div
            className={[
              /* pe so the last card isn’t flush against the scroll edge on mobile */
              "!flex gap-[clamp(1rem,0.9609rem+0.1953vi,1.125rem)] max-lg:!pe-1",
              "lg:!grid lg:!grid-cols-12 lg:!pe-0",
              /*
                Source uses minmax(0,min-content), but with overflow:hidden on cards
                that collapses row tracks. `auto` keeps the bento proportions while
                sizing to image+text content (matches the screenshot).
              */
              "lg:!grid-rows-[repeat(3,auto)]",
            ].join(" ")}
            style={{ gap: SPACE_3 }}
          >
            {RESOURCES.map((r, i) => (
              <ResourceCard key={r.title} resource={r} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
