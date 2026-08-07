import { useId } from "react";

const CDN = "https://buffer.com/cdn-cgi/image";

/** Matches marketing --space-step-3-step-5 / --container-max-inline-size-wide */
const CONTAINER =
  "mx-auto max-w-[93.5rem] px-[clamp(1rem,0.6094rem+1.9531vw,2.25rem)]";

const FONT = '"Figtree", ui-sans-serif, system-ui, sans-serif';

type Logo = {
  alt: string;
  src: string;
  srcSet: string;
  width: number;
  height: number;
  /** Logo scale vs base --_logo-height (1 / 0.78 / 0.62) */
  scale: "default" | "medium" | "small";
};

const SCALE_CLASS: Record<Logo["scale"], string> = {
  default: "[--logo-scale:1]",
  medium: "[--logo-scale:0.78]",
  small: "[--logo-scale:0.62]",
};

const LOGOS: Logo[] = [
  {
    alt: "Metallica",
    width: 410,
    height: 140,
    scale: "default",
    src: `${CDN}/width=828,quality=75,format=auto/img/homepage/social-proof-logos/metallica.webp`,
    srcSet: `${CDN}/width=640,quality=75,format=auto/img/homepage/social-proof-logos/metallica.webp 1x, ${CDN}/width=828,quality=75,format=auto/img/homepage/social-proof-logos/metallica.webp 2x`,
  },
  {
    alt: "Benefit",
    width: 420,
    height: 140,
    scale: "default",
    src: `${CDN}/width=1080,quality=75,format=auto/img/homepage/social-proof-logos/benefit.webp`,
    srcSet: `${CDN}/width=640,quality=75,format=auto/img/homepage/social-proof-logos/benefit.webp 1x, ${CDN}/width=1080,quality=75,format=auto/img/homepage/social-proof-logos/benefit.webp 2x`,
  },
  {
    alt: "Wired",
    width: 480,
    height: 97,
    scale: "medium",
    src: `${CDN}/width=1080,quality=75,format=auto/img/homepage/social-proof-logos/wired.webp`,
    srcSet: `${CDN}/width=640,quality=75,format=auto/img/homepage/social-proof-logos/wired.webp 1x, ${CDN}/width=1080,quality=75,format=auto/img/homepage/social-proof-logos/wired.webp 2x`,
  },
  {
    alt: "Semrush",
    width: 480,
    height: 64,
    scale: "small",
    src: `${CDN}/width=1080,quality=75,format=auto/img/homepage/social-proof-logos/semrush.webp`,
    srcSet: `${CDN}/width=640,quality=75,format=auto/img/homepage/social-proof-logos/semrush.webp 1x, ${CDN}/width=1080,quality=75,format=auto/img/homepage/social-proof-logos/semrush.webp 2x`,
  },
  {
    alt: "Crocs",
    width: 480,
    height: 88,
    scale: "medium",
    src: `${CDN}/width=1080,quality=75,format=auto/img/homepage/social-proof-logos/crocs.webp`,
    srcSet: `${CDN}/width=640,quality=75,format=auto/img/homepage/social-proof-logos/crocs.webp 1x, ${CDN}/width=1080,quality=75,format=auto/img/homepage/social-proof-logos/crocs.webp 2x`,
  },
  {
    alt: "ElevenLabs",
    width: 480,
    height: 63,
    scale: "small",
    src: `${CDN}/width=1080,quality=75,format=auto/img/homepage/social-proof-logos/elevenlabs.webp`,
    srcSet: `${CDN}/width=640,quality=75,format=auto/img/homepage/social-proof-logos/elevenlabs.webp 1x, ${CDN}/width=1080,quality=75,format=auto/img/homepage/social-proof-logos/elevenlabs.webp 2x`,
  },
  {
    alt: "Pizza Hut",
    width: 167,
    height: 140,
    scale: "default",
    src: `${CDN}/width=384,quality=75,format=auto/img/homepage/social-proof-logos/pizza-hut.webp`,
    srcSet: `${CDN}/width=256,quality=75,format=auto/img/homepage/social-proof-logos/pizza-hut.webp 1x, ${CDN}/width=384,quality=75,format=auto/img/homepage/social-proof-logos/pizza-hut.webp 2x`,
  },
  {
    alt: "Vice",
    width: 443,
    height: 140,
    scale: "default",
    src: `${CDN}/width=1080,quality=75,format=auto/img/homepage/social-proof-logos/vice.webp`,
    srcSet: `${CDN}/width=640,quality=75,format=auto/img/homepage/social-proof-logos/vice.webp 1x, ${CDN}/width=1080,quality=75,format=auto/img/homepage/social-proof-logos/vice.webp 2x`,
  },
  {
    alt: "Clash of Clans",
    width: 305,
    height: 140,
    scale: "default",
    src: `${CDN}/width=640,quality=75,format=auto/img/homepage/social-proof-logos/clash-of-clans.webp`,
    srcSet: `${CDN}/width=384,quality=75,format=auto/img/homepage/social-proof-logos/clash-of-clans.webp 1x, ${CDN}/width=640,quality=75,format=auto/img/homepage/social-proof-logos/clash-of-clans.webp 2x`,
  },
];

function LogoGroup({ hidden }: { hidden?: boolean }) {
  return (
    <ul
      className={[
        "m-0 flex list-none flex-nowrap items-center",
        "shrink-0 gap-[var(--logo-gap)] px-[calc(var(--logo-gap)/2)]",
        "motion-reduce:aria-[hidden=true]:hidden",
      ].join(" ")}
      aria-hidden={hidden ? true : undefined}
    >
      {LOGOS.map((logo) => (
        <li
          key={`${hidden ? "dup-" : ""}${logo.alt}`}
          className={[
            "flex shrink-0 items-center justify-center",
            SCALE_CLASS[logo.scale],
          ].join(" ")}
        >
          <img
            alt={hidden ? "" : logo.alt}
            loading="eager"
            decoding="async"
            width={logo.width}
            height={logo.height}
            src={logo.src}
            srcSet={logo.srcSet}
            className={[
              /* Beat marketing img reset: block-size:auto; max-inline-size:100% */
              "!h-[calc(var(--logo-height)*var(--logo-scale))]",
              "!max-h-[calc(var(--logo-height)*var(--logo-scale))]",
              "![block-size:calc(var(--logo-height)*var(--logo-scale))]",
              "!w-auto !max-w-none ![inline-size:auto] ![max-inline-size:none]",
              "object-contain",
            ].join(" ")}
            style={{ color: "transparent" }}
          />
        </li>
      ))}
    </ul>
  );
}

/**
 * Social-proof logos marquee — pure Tailwind (no SocialProofLogosSection_*).
 * Visible copy: "100,000 creators…"; real count exposed via aria-label only.
 */
export function LandingSocialProofLogos() {
  const headingId = useId();

  return (
    <section
      className="overflow-hidden pt-[clamp(2rem,1.2188rem+3.9063vw,4.5rem)] tracking-[0.0075em]"
      aria-labelledby={headingId}
      style={{ fontFamily: FONT }}
    >
      <div
        className={[
          CONTAINER,
          "mb-[clamp(1.5rem,1.4414rem+0.293vw,1.6875rem)] flex items-center",
          "gap-[clamp(0.75rem,0.6328rem+0.5859vw,1.125rem)]",
        ].join(" ")}
      >
        <span
          aria-hidden
          className="block h-[0.0625rem] min-w-[1.5rem] flex-1 bg-[#e4e3dd]"
        />
        <h2
          id={headingId}
          aria-label="239,262 creators, brands, and agencies using SMC"
          className={[
            /* min-w-0 so long copy can wrap inside the flex row (avoids x-overflow) */
            "m-0 min-w-0 shrink text-center text-balance text-[#6e6e68]",
            "text-[clamp(1rem,0.9565rem+0.2174vw,1.125rem)]",
            "!font-normal !leading-[1.4] !tracking-[0.0075em]",
            "![font-family:Figtree,ui-sans-serif,system-ui,sans-serif]",
          ].join(" ")}
          style={{
            // Beat marketing global h1–h6 (Stolzl / tight tracking)
            fontFamily: FONT,
            fontWeight: 400,
            lineHeight: 1.4,
            letterSpacing: "0.0075em",
          }}
        >
          100,000 creators, brands, and agencies using SMC
        </h2>
        <span
          aria-hidden
          className="block h-[0.0625rem] min-w-[1.5rem] flex-1 bg-[#e4e3dd]"
        />
      </div>

      <div
        className={[
          "overflow-hidden motion-reduce:overflow-x-auto",
          "[--logo-height:1.5rem] md:[--logo-height:2rem]",
          "[--logo-gap:clamp(2rem,1.2188rem+3.9063vi,4.5rem)]",
          "[mask-image:linear-gradient(90deg,#0000,#000_6%_94%,#0000)]",
          "[-webkit-mask-image:linear-gradient(90deg,#0000,#000_6%_94%,#0000)]",
        ].join(" ")}
      >
        <div
          className={[
            "flex w-max flex-nowrap",
            "motion-safe:animate-smc-social-proof-scroll",
            "motion-safe:hover:[animation-play-state:paused]",
          ].join(" ")}
        >
          <LogoGroup />
          <LogoGroup hidden />
        </div>
      </div>
    </section>
  );
}
