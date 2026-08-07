import type { ReactNode } from "react";

const FONT_SANS =
  '"Figtree", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

/** Marketing fluid type / space (vi units from marketing-landing.css) */
const STEP_M2 = "clamp(0.8rem, 0.7863rem + 0.0687vi, 0.84375rem)"; // --font-size-step--2
const STEP_M1 = "clamp(0.89375rem, 0.8703rem + 0.1172vi, 0.96875rem)"; // --font-size-step--1
const SPACE_1 = "clamp(0.5rem, 0.4805rem + 0.0977vi, 0.5625rem)"; // --space-step-1
const SPACE_3 = "clamp(1rem, 0.9609rem + 0.1953vi, 1.125rem)"; // --space-step-3
const SPACE_5 = "clamp(2rem, 1.9219rem + 0.3906vi, 2.25rem)"; // --space-step-5
const SPACE_5_7 = "clamp(2rem, 1.2188rem + 3.9063vi, 4.5rem)"; // --space-step-5-step-7
const SPACE_7 = "clamp(4rem, 3.8438rem + 0.7813vi, 4.5rem)"; // --space-step-7
const SPACE_3_5 = "clamp(1rem, 0.6094rem + 1.9531vi, 2.25rem)"; // --space-step-3-step-5

const FLOATING =
  "shadow-[0_1rem_1.5rem_-0.5rem_rgba(23,23,23,0.10),0_0.25rem_0.5rem_-0.25rem_rgba(23,23,23,0.10),0_0_0.0625rem_0.0625rem_rgba(23,23,23,0.05)]";

const FOCUS_RING =
  "outline outline-[0.125rem] outline-offset-[0.125rem] outline-transparent transition-[outline-color] duration-150 ease-out focus-visible:outline-white";

type FooterLink = { href: string; label: string; external?: boolean; badge?: string };
type FooterGroup = { heading: string; links: FooterLink[] };

const LEFT_MULTI: FooterGroup[] = [
  {
    heading: "Features",
    links: [
      { href: "/create", label: "Create" },
      { href: "/publish", label: "Publish" },
      { href: "/community", label: "Community" },
      { href: "/insights", label: "Insights", badge: "New" },
      { href: "/collaborate", label: "Collaborate" },
    ],
  },
  {
    heading: "Tools",
    links: [
      { href: "/ai-assistant", label: "AI Assistant" },
      { href: "/start-page", label: "Start Page" },
      { href: "/integrations", label: "Integrations" },
      { href: "/apps/ios", label: "iOS App" },
      { href: "/apps/android", label: "Android App" },
      { href: "/extensions", label: "Browser Extension" },
      { href: "/mcp", label: "Social Media MCP" },
      { href: "/api", label: "SMC API" },
    ],
  },
];

const LEFT_REST: FooterGroup[] = [
  {
    heading: "Channels",
    links: [
      { href: "/bluesky", label: "Bluesky" },
      { href: "/facebook", label: "Facebook" },
      { href: "/google-business-profile", label: "Google Business Profile" },
      { href: "/instagram", label: "Instagram" },
      { href: "/linkedin", label: "LinkedIn" },
      { href: "/mastodon", label: "Mastodon" },
      { href: "/pinterest", label: "Pinterest" },
      { href: "/threads", label: "Threads" },
      { href: "/tiktok", label: "TikTok" },
      { href: "/x", label: "X" },
      { href: "/youtube", label: "YouTube" },
    ],
  },
  {
    heading: "Made for",
    links: [
      { href: "/made-for/creators", label: "Creators" },
      { href: "/made-for/small-business", label: "Small Business" },
      { href: "/partners/agencies", label: "Agencies" },
      { href: "/nonprofits", label: "Nonprofits" },
      { href: "/made-for/higher-education", label: "Higher Education" },
      { href: "/made-for/developers", label: "Developers" },
      { href: "/made-for/startups", label: "Startups" },
    ],
  },
];

const RIGHT_RESOURCES: FooterGroup = {
  heading: "Resources",
  links: [
    { href: "/resources/", label: "Blog" },
    { href: "/templates", label: "Template Library" },
    { href: "/social-media-benchmarks", label: "Social Media Benchmarks" },
    { href: "/library", label: "Resource Library" },
    { href: "/social-media-terms", label: "Social Media Terms Glossary" },
    { href: "/free-tools", label: "Free Marketing Tools" },
    { href: "/ai-assistant/social-media-post-creator", label: "AI Social Media Post Generator" },
    { href: "/compare", label: "Compare SMC" },
    { href: "/our-community", label: "Our Community" },
    { href: "/api", label: "Developer Docs" },
  ],
};

const RIGHT_MULTI: FooterGroup[] = [
  {
    heading: "Support",
    links: [
      { href: "/support", label: "Help Center" },
      { href: "/status", label: "Status" },
      { href: "/changelog", label: "Changelog" },
      { href: "/feedback", label: "Request a Feature" },
    ],
  },
  {
    heading: "Transparency",
    links: [
      { href: "/open", label: "Open Hub" },
      { href: "/metrics", label: "Transparent Metrics" },
      { href: "/transparent-pricing", label: "Transparent Pricing" },
      { href: "/salaries", label: "Transparent Salaries" },
      { href: "/roadmap", label: "Product Roadmap" },
    ],
  },
];

const RIGHT_COMPANY: FooterGroup = {
  heading: "Company",
  links: [
    { href: "/about", label: "About" },
    { href: "/journey", label: "Careers" },
    { href: "/press", label: "Press" },
    { href: "/partners", label: "Partner Program" },
    { href: "/legal", label: "Legal" },
    { href: "/sitemap", label: "Sitemap" },
  ],
};

const SOCIALS: { label: string; href: string; path: ReactNode }[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    path: (
      <>
        <path
          fillRule="evenodd"
          d="M16.192 8.902a7.29 7.29 0 1 0 0 14.58 7.29 7.29 0 0 0 0-14.58Zm0 12.014a4.734 4.734 0 1 1 0-9.468 4.734 4.734 0 0 1 0 9.468Z"
        />
        <path d="M25.471 8.614a1.7 1.7 0 1 1-3.4 0 1.7 1.7 0 0 1 3.4 0Z" />
        <path
          fillRule="evenodd"
          d="M16.192 2c-3.859 0-4.336 0-5.848.09-1.176.023-2.339.245-3.44.656a6.872 6.872 0 0 0-2.517 1.64 7.051 7.051 0 0 0-1.641 2.517 10.552 10.552 0 0 0-.656 3.441c-.07 1.512-.09 1.99-.09 5.848 0 3.859 0 4.336.09 5.848.023 1.176.245 2.34.656 3.441.355.95.915 1.809 1.64 2.516a7.05 7.05 0 0 0 2.517 1.641c1.103.41 2.266.631 3.441.657 1.512.07 1.99.09 5.848.09 3.859 0 4.337 0 5.848-.09a10.444 10.444 0 0 0 3.441-.657 6.873 6.873 0 0 0 2.516-1.64 6.963 6.963 0 0 0 1.641-2.517c.41-1.102.631-2.265.657-3.44.07-1.513.09-1.99.09-5.849 0-3.858 0-4.336-.09-5.848a10.444 10.444 0 0 0-.657-3.44 6.871 6.871 0 0 0-1.64-2.517 6.961 6.961 0 0 0-2.517-1.641 10.552 10.552 0 0 0-3.44-.656C20.537 2.01 20.05 2 16.19 2Zm0 2.556c3.79 0 4.237 0 5.739.08.9.012 1.79.177 2.635.487a4.735 4.735 0 0 1 2.696 2.695 7.65 7.65 0 0 1 .487 2.636c.07 1.491.08 1.989.08 5.738v.002c0 3.748 0 4.235-.08 5.737-.012.9-.177 1.79-.487 2.635a4.734 4.734 0 0 1-2.696 2.695 7.647 7.647 0 0 1-2.635.488c-1.492.07-1.99.08-5.739.08-3.75 0-4.237 0-5.738-.08a7.956 7.956 0 0 1-2.636-.488 4.733 4.733 0 0 1-2.695-2.695 7.648 7.648 0 0 1-.487-2.635c-.07-1.492-.08-1.99-.08-5.739 0-3.75 0-4.237.08-5.738.012-.9.177-1.791.487-2.636a4.734 4.734 0 0 1 2.695-2.695 7.648 7.648 0 0 1 2.636-.487c1.501-.07 1.989-.08 5.738-.08Z"
        />
      </>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    path: (
      <path d="M31.33 16.755C31.33 8.605 24.765 2 16.666 2 8.565 2 2 8.606 2 16.755c0 7.364 5.363 13.468 12.374 14.575V21.02H10.65v-4.265h3.724v-3.25c0-3.699 2.19-5.741 5.54-5.741 1.604 0 3.282.288 3.282.288v3.63h-1.85c-1.821 0-2.39 1.138-2.39 2.305v2.768h4.068l-.65 4.265h-3.417v10.31c7.01-1.107 12.373-7.21 12.373-14.575Z" />
    ),
  },
  {
    label: "Bluesky",
    href: "https://bsky.app/",
    path: (
      <path d="M7.692 5.615c3.363 2.347 6.98 7.104 8.308 9.656 1.328-2.552 4.945-7.31 8.308-9.656 2.427-1.692 6.359-3.002 6.359 1.166 0 .832-.514 6.992-.815 7.993-1.047 3.476-4.863 4.363-8.257 3.827 5.933.938 7.442 4.046 4.183 7.153-6.19 5.902-8.897-1.48-9.59-3.372-.128-.347-.187-.51-.188-.372 0-.138-.06.025-.188.372-.693 1.891-3.4 9.274-9.59 3.372-3.259-3.108-1.75-6.215 4.183-7.154-3.394.537-7.21-.35-8.257-3.827-.301-1-.815-7.16-.815-7.992 0-4.168 3.932-2.858 6.359-1.166Z" />
    ),
  },
  {
    label: "X",
    href: "https://x.com/",
    path: (
      <path d="M23.573 5.075h3.912l-8.546 9.768 10.054 13.291H21.12l-6.165-8.06-7.055 8.06H3.987l9.14-10.447L3.483 5.075h8.072l5.573 7.369 6.445-7.369Zm-1.372 20.718h2.167l-13.991-18.5H8.05l14.15 18.5Z" />
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/",
    path: (
      <path d="M26.627 26.113h-4.182v-6.562c0-1.562 0-3.583-2.185-3.583s-2.53 1.708-2.53 3.469v6.676h-4.182v-13.54h4.036v1.843h.063a4.415 4.415 0 0 1 1.69-1.637 4.435 4.435 0 0 1 2.293-.54c4.265 0 5.05 2.792 5.05 6.437l-.053 7.438ZM8.74 10.77a2.452 2.452 0 0 1-2.26-1.504 2.43 2.43 0 0 1 .53-2.657 2.45 2.45 0 0 1 2.666-.528 2.444 2.444 0 0 1 1.51 2.252c0 .646-.257 1.266-.716 1.723a2.451 2.451 0 0 1-1.73.714Zm2.091 15.343H6.648v-13.54h4.182v13.54ZM4.526 2c-.554 0-1.086.22-1.478.61a2.08 2.08 0 0 0-.613 1.473v24.218c0 .553.22 1.082.613 1.473.392.39.924.61 1.478.61H28.73c.554 0 1.086-.22 1.478-.61.392-.39.612-.92.612-1.473V4.041a2.08 2.08 0 0 0-.627-1.446A2.095 2.095 0 0 0 28.73 2H4.526Z" />
    ),
  },
  {
    label: "Threads",
    href: "https://www.threads.net/",
    path: (
      <path d="M23.59 14.831a10.86 10.86 0 0 0-.42-.19c-.247-4.551-2.734-7.157-6.91-7.184h-.056c-2.498 0-4.575 1.066-5.854 3.006l2.297 1.576c.955-1.45 2.454-1.758 3.558-1.758h.038c1.375.009 2.412.408 3.084 1.188.488.568.815 1.352.977 2.342-1.219-.207-2.537-.271-3.946-.19-3.97.228-6.523 2.544-6.351 5.761.087 1.632.9 3.036 2.289 3.953 1.174.775 2.687 1.155 4.26 1.069 2.076-.114 3.704-.906 4.84-2.355.864-1.1 1.41-2.525 1.65-4.321.99.597 1.724 1.383 2.128 2.327.69 1.606.73 4.245-1.424 6.396-1.886 1.885-4.154 2.7-7.581 2.726-3.802-.029-6.677-1.248-8.546-3.624-1.75-2.225-2.655-5.44-2.689-9.553.034-4.114.939-7.328 2.689-9.553 1.87-2.376 4.744-3.595 8.546-3.624 3.829.029 6.754 1.254 8.695 3.642.952 1.17 1.67 2.643 2.142 4.36l2.691-.718c-.573-2.113-1.475-3.934-2.703-5.445C24.506 1.602 20.867.032 16.178 0h-.018C11.48.032 7.882 1.607 5.465 4.68c-2.151 2.734-3.26 6.54-3.298 11.309v.022c.037 4.77 1.147 8.575 3.298 11.31C7.882 30.392 11.48 31.967 16.16 32h.018c4.16-.029 7.093-1.118 9.508-3.532 3.16-3.157 3.066-7.115 2.024-9.544-.747-1.743-2.172-3.158-4.12-4.093Zm-7.183 6.753c-1.74.099-3.548-.683-3.637-2.355-.066-1.24.883-2.625 3.744-2.79.327-.018.649-.028.965-.028a13.6 13.6 0 0 1 2.895.294c-.33 4.118-2.264 4.786-3.967 4.88Z" />
    ),
  },
];

const LANGS: { href: string; lang: string; label: string; current?: boolean }[] = [
  { href: "/", lang: "en", label: "English", current: true },
  { href: "/es/", lang: "es", label: "Español" },
  { href: "/fr/", lang: "fr", label: "Français" },
  { href: "/de/", lang: "de", label: "Deutsch" },
  { href: "/it/", lang: "it", label: "Italiano" },
  { href: "/nl/", lang: "nl", label: "Nederlands" },
  { href: "/pt/", lang: "pt", label: "Português" },
];

/** Badge — green / small (pure Tailwind clone of Badge_badge) */
function NewBadge() {
  return (
    <span
      className={[
        "inline-block !rounded ![padding:0.25em_0.5em]",
        "!bg-[#d8f1d0] !text-[#337047]",
        "!font-medium !tracking-[0.03125em]",
        "![font-size:clamp(0.8rem,0.7863rem+0.0687vi,0.84375rem)]",
      ].join(" ")}
      style={{
        fontFamily: FONT_SANS,
        fontSize: STEP_M2,
        fontWeight: 500,
        letterSpacing: "0.03125em",
      }}
    >
      New
    </span>
  );
}

function FooterLogo() {
  return (
    <span
      aria-hidden
      className={[
        "inline-block !font-bold !leading-none !tracking-[-0.04em] !text-[#b0ec9c]",
        /* Slightly smaller on the narrowest phones so trailing content has room */
        "![font-size:clamp(2.75rem,8vw,4rem)] ![block-size:auto] ![line-height:1]",
        "lg:![font-size:6rem]",
      ].join(" ")}
      style={{ fontFamily: FONT_SANS }}
    >
      SMC
    </span>
  );
}

function LinkGroup({ group }: { group: FooterGroup }) {
  return (
    <div className="min-w-0">
      <h3
        className={[
          "!m-0 ![margin-block-end:clamp(0.5rem,0.4805rem+0.0977vi,0.5625rem)]",
          "![font-size:clamp(0.89375rem,0.8703rem+0.1172vi,0.96875rem)]",
          "!font-normal !leading-[1.4] !tracking-[0.0075em] !text-[#b0ec9c]",
        ].join(" ")}
        style={{
          fontFamily: FONT_SANS,
          fontSize: STEP_M1,
          marginBlockEnd: SPACE_1,
          color: "#b0ec9c",
        }}
      >
        {group.heading}
      </h3>
      <ul
        className="!m-0 flex !list-none !flex-col !p-0 ![row-gap:clamp(0.5rem,0.4805rem+0.0977vi,0.5625rem)]"
        style={{ rowGap: SPACE_1 }}
      >
        {group.links.map((link) => (
          <li key={link.href + link.label} className="min-w-0">
            <a
              href={link.href}
              {...(link.external ? { rel: "noopener noreferrer", target: "_blank" } : {})}
              className={[
                "!rounded ![font-size:clamp(0.89375rem,0.8703rem+0.1172vi,0.96875rem)]",
                "!font-normal !leading-[1.4] !tracking-[0.0075em] !text-white !no-underline",
                "break-words hyphens-auto",
                FOCUS_RING,
                link.badge ? "inline-flex !flex-wrap !items-center !gap-[0.375rem]" : "",
              ].join(" ")}
              style={{
                fontFamily: FONT_SANS,
                fontSize: STEP_M1,
              }}
            >
              {link.label}
              {link.badge ? <NewBadge /> : null}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** LanguageSelector — pure Tailwind (opens upward) */
function LanguageSelector() {
  return (
    <details
      className={[
        "group/lang relative z-20 !mb-[clamp(1rem,0.9609rem+0.1953vi,1.125rem)] !inline-flex",
      ].join(" ")}
      style={{ marginBlockEnd: SPACE_3 }}
    >
      <summary
        className={[
          /* !flex beats marketing `summary { display:list-item }` wrap */
          "!flex !flex-nowrap !cursor-pointer !list-none !items-center !gap-[0.5ch]",
          "!whitespace-nowrap !rounded-md !border-0 !bg-transparent !p-0 !text-[#b0ec9c]",
          "transition-[outline-color,color] duration-150 ease-out",
          "hover:!text-[#d8f1d0] group-open/lang:!text-[#d8f1d0]",
          "[&::-webkit-details-marker]:hidden",
          FOCUS_RING,
        ].join(" ")}
      >
        <svg
          className="!size-6 shrink-0"
          width={24}
          height={24}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          aria-hidden
        >
          <path d="M19.42 14.333h-3.531a1.555 1.555 0 0 0-1.556 1.556v3.53M8.111 5.265v1.292a2.333 2.333 0 0 0 2.333 2.333A1.555 1.555 0 0 1 12 10.444a1.555 1.555 0 1 0 3.111 0c0-.855.7-1.555 1.556-1.555h2.465m-7.91 10.85v-3.072a1.556 1.556 0 0 0-1.555-1.556 1.555 1.555 0 0 1-1.556-1.556v-.777a1.556 1.556 0 0 0-1.555-1.556H4.26M19.778 12a7.778 7.778 0 1 1-15.556 0 7.778 7.778 0 0 1 15.556 0" />
        </svg>
        <span
          className="!shrink-0 !whitespace-nowrap ![font-size:clamp(0.89375rem,0.8703rem+0.1172vi,0.96875rem)] !leading-[1.4]"
          style={{ fontFamily: FONT_SANS, fontSize: STEP_M1 }}
        >
          English
        </span>
        <svg
          className="!size-3 shrink-0 transition-transform duration-150 ease-out group-open/lang:rotate-180"
          width={12}
          height={12}
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.25"
            d="m3 4.5 3 3 3-3"
          />
        </svg>
      </summary>

      <ul
        className={[
          /* Right-align menu so it doesn't wrap off-screen in the trailing column */
          "absolute bottom-[calc(100%+0.5rem)] right-0 left-auto z-30 !m-0 !min-w-48 !list-none !p-1",
          "!rounded-[0.625rem] !border !border-solid !border-[#cbcac2] !bg-[#fefdfb]",
          FLOATING,
        ].join(" ")}
      >
        {LANGS.map((l) => (
          <li key={l.lang} className="!whitespace-nowrap">
            <a
              href={l.href}
              lang={l.lang}
              {...(l.current ? { "aria-current": "true" as const } : {})}
              className={[
                "!flex !flex-nowrap !items-center !justify-between !gap-2 !rounded !px-3 !py-2 !no-underline",
                "!whitespace-nowrap ![font-size:clamp(0.89375rem,0.8703rem+0.1172vi,0.96875rem)] !text-[#213130]",
                "select-none transition-[outline-color,background-color] duration-150 ease-out",
                "hover:!bg-[#f1f1ea]",
                "outline outline-[0.125rem] outline-offset-[0.125rem] outline-transparent",
                "focus-visible:outline-[#213130]",
              ].join(" ")}
              style={{ fontFamily: FONT_SANS, fontSize: STEP_M1 }}
            >
              {l.label}
              {l.current ? (
                <svg
                  className="!size-4 shrink-0 !text-[#213130]"
                  width={16}
                  height={16}
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M3 8l3.5 3.5L13 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

/**
 * Site footer — pure Tailwind (Footer_* tokens).
 * Dark brand panel, mint headings, link columns, language menu, socials, policies.
 */
export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className={[
        "relative !overflow-visible !rounded-t-[1.25rem] !bg-[#213130] !text-white !tracking-[0.0075em]",
        "![padding-block:clamp(4rem,3.8438rem+0.7813vi,4.5rem)]",
        "![padding-inline:clamp(1rem,0.6094rem+1.9531vi,2.25rem)]",
      ].join(" ")}
      style={{
        fontFamily: FONT_SANS,
        letterSpacing: "0.0075em",
        paddingBlock: SPACE_7,
        paddingInline: SPACE_3_5,
        backgroundColor: "#213130",
        color: "#fff",
      }}
    >
      <h2 className="sr-only">SMC</h2>

      {/* Footer_footerLinks — 2 cols → nested 3-col groups ≥64rem */}
      <div
        className={[
          "mx-auto grid !max-w-[80rem] !grid-cols-2 !items-start",
          "![margin-block-end:clamp(2rem,1.2188rem+3.9063vi,4.5rem)]",
          /* Tighter column gap on narrow screens so 2-col link lists aren’t crushed */
          "![column-gap:clamp(1rem,0.5rem+2.5vi,3.375rem)]",
          "![row-gap:clamp(1.5rem,0.9141rem+2.9297vi,3.375rem)]",
        ].join(" ")}
        style={{
          marginBlockEnd: SPACE_5_7,
        }}
      >
        <div
          className={[
            "grid ![row-gap:clamp(2rem,1.9219rem+0.3906vi,2.25rem)]",
            "lg:!grid-cols-3 lg:![column-gap:clamp(1.5rem,0.9141rem+2.9297vi,3.375rem)]",
          ].join(" ")}
          style={{ rowGap: SPACE_5 }}
        >
          <div
            className="grid ![row-gap:clamp(2rem,1.9219rem+0.3906vi,2.25rem)]"
            style={{ rowGap: SPACE_5 }}
          >
            {LEFT_MULTI.map((g) => (
              <LinkGroup key={g.heading} group={g} />
            ))}
          </div>
          {LEFT_REST.map((g) => (
            <LinkGroup key={g.heading} group={g} />
          ))}
        </div>

        <div
          className={[
            "grid ![row-gap:clamp(2rem,1.9219rem+0.3906vi,2.25rem)]",
            "lg:!grid-cols-3 lg:![column-gap:clamp(1.5rem,0.9141rem+2.9297vi,3.375rem)]",
          ].join(" ")}
          style={{ rowGap: SPACE_5 }}
        >
          <LinkGroup group={RIGHT_RESOURCES} />
          <div
            className="grid ![row-gap:clamp(2rem,1.9219rem+0.3906vi,2.25rem)]"
            style={{ rowGap: SPACE_5 }}
          >
            {RIGHT_MULTI.map((g) => (
              <LinkGroup key={g.heading} group={g} />
            ))}
          </div>
          <LinkGroup group={RIGHT_COMPANY} />
        </div>
      </div>

      {/* Footer_trailingContent */}
      <div
        className={[
          "mx-auto flex !max-w-[80rem] !flex-col",
          "md:!flex-row md:!items-end md:!justify-between",
        ].join(" ")}
      >
        <a
          href="/"
          className={[
            "inline-block !rounded-xl",
            "![margin-block-end:clamp(2rem,1.9219rem+0.3906vi,2.25rem)] md:![margin-block-end:0]",
            FOCUS_RING,
          ].join(" ")}
        >
          <span className="sr-only">SMC</span>
          <FooterLogo />
        </a>

        <div className="flex !flex-col !items-center md:!items-end">
          <LanguageSelector />

          <div
            className="![margin-block-end:clamp(1rem,0.9609rem+0.1953vi,1.125rem)]"
            style={{ marginBlockEnd: SPACE_3 }}
          >
            <h3 className="sr-only">Social media</h3>
            <ul
              className={[
                "!m-0 flex !list-none !flex-wrap !items-center !justify-center !p-0",
                "![gap:clamp(1rem,0.75rem+1vi,1.6875rem)]",
                "md:!justify-end",
              ].join(" ")}
            >
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    rel="noopener noreferrer"
                    target="_blank"
                    className={["inline-block !rounded", FOCUS_RING].join(" ")}
                  >
                    <span className="sr-only">{s.label}</span>
                    <svg
                      className="!fill-[#fefdfb]"
                      width={32}
                      height={32}
                      viewBox="0 0 32 32"
                      aria-hidden
                    >
                      {s.path}
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="sr-only">Policies</h3>
            <div
              className={[
                "flex !flex-wrap !items-center !gap-1",
                "![font-size:clamp(0.89375rem,0.8703rem+0.1172vi,0.96875rem)]",
                "!font-normal !leading-[1.4] !tracking-[0.0075em] !text-white",
              ].join(" ")}
              style={{ fontFamily: FONT_SANS, fontSize: STEP_M1 }}
            >
              <p className="!m-0">Copyright ©{year} SMC</p>
              <span aria-hidden>|</span>
              <p className="!m-0">
                <a
                  className={["!rounded !text-white !no-underline", FOCUS_RING].join(" ")}
                  href="/legal#privacy-policy"
                >
                  Privacy
                </a>
              </p>
              <span aria-hidden>|</span>
              <p className="!m-0">
                <a
                  className={["!rounded !text-white !no-underline", FOCUS_RING].join(" ")}
                  href="/legal#terms"
                >
                  Terms
                </a>
              </p>
              <span aria-hidden>|</span>
              <p className="!m-0">
                <a
                  className={["!rounded !text-white !no-underline", FOCUS_RING].join(" ")}
                  href="/legal#security"
                >
                  Security
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
