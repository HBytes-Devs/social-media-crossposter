import { useId } from "react";

const FONT = '"Figtree", ui-sans-serif, system-ui, sans-serif';
const CONTAINER = "mx-auto max-w-[93.5rem] px-[clamp(1rem,0.6094rem+1.9531vw,2.25rem)]";
const CDN = "https://buffer.com/cdn-cgi/image";
const WIDTHS = [16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840];

function srcSet(path: string) {
  return WIDTHS.map(
    (w) => `${CDN}/width=${w},quality=75,format=auto/img/homepage/${path} ${w}w`,
  ).join(", ");
}

function src(path: string) {
  return `${CDN}/width=1920,quality=75,format=auto/img/homepage/${path}`;
}

function TertiaryArrow() {
  return (
    <svg className="size-4 shrink-0" width={24} height={24} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M11.47 4.47a.75.75 0 0 1 1.06 0l7 7a.75.75 0 0 1 0 1.06l-7 7a.75.75 0 1 1-1.06-1.06l5.72-5.72H5a.75.75 0 0 1 0-1.5h12.19l-5.72-5.72a.75.75 0 0 1 0-1.06Z"
      />
    </svg>
  );
}

/**
 * Customer support — React + Tailwind,
 * matched to marketing-landing.css CustomerSupportSection_*.
 */
export function LandingSupport() {
  const headingId = useId();

  return (
    <section
      id="support"
      className="tracking-[0.0075em] text-[#213130]"
      aria-labelledby={headingId}
      style={{ fontFamily: FONT }}
    >
      <div
        className={[
          CONTAINER,
          "grid gap-[clamp(2rem,1.2188rem+3.9063vw,4.5rem)] py-[clamp(2rem,1.2188rem+3.9063vw,4.5rem)]",
          "lg:grid-cols-2 lg:items-center",
        ].join(" ")}
      >
        <div className="grid min-w-0 gap-[clamp(1rem,0.9609rem+0.1953vw,1.125rem)]">
          <h2
            id={headingId}
            className="m-0 text-[clamp(0.89375rem,0.8703rem+0.1172vw,0.96875rem)] font-medium uppercase leading-[1.4] tracking-[0.0625em] text-[#4a4a45]"
          >
            Customer Support
          </h2>
          <p
            className={[
              "m-0 font-semibold leading-[1.2] tracking-[-0.02em] text-[#213130]",
              "text-[clamp(1.95625rem,1.7056rem+1.2375vw,2.6625rem)]",
            ].join(" ")}
          >
            Human support, worldwide
          </p>
          <p className="m-0 max-w-[65ch] text-[clamp(1rem,0.9565rem+0.2174vw,1.125rem)] leading-[1.4]">
            Our global Customer Advocacy team is spread across time zones to make sure help is always
            nearby. Whether you have a quick question, need technical support, or just want to
            connect, we’re here for you — no bots, just real people who care.
          </p>
          <div className="mb-[clamp(1rem,0.9609rem+0.1953vw,1.125rem)] flex flex-wrap gap-[clamp(0.5rem,0.4805rem+0.0977vw,0.5625rem)]">
            <a
              href="/support"
              className={[
                "group/ghost relative !inline-flex !no-underline !outline-none !rounded-full",
                "transition-[outline-color] duration-150 ease-out",
                "focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-offset-2 focus-visible:!outline-[#213130]",
              ].join(" ")}
            >
              <span
                className={[
                  "relative !inline-flex !items-center !justify-center",
                  "!rounded-full !border !border-solid !border-[#213130] !bg-transparent",
                  "![padding-block:0.5em] ![padding-inline:1.25em]",
                  "![font-size:clamp(0.89375rem,0.8703rem+0.1172vi,0.96875rem)] !leading-[1.4] !text-[#213130]",
                  "transition-[transform,background-color] duration-150 ease-out",
                  "group-hover/ghost:!-translate-y-0.5 group-hover/ghost:!bg-[#f7f7f3]",
                ].join(" ")}
              >
                Visit the Help Center
              </span>
            </a>
            <a
              href="https://discord.gg/aQdKKr6kDY"
              rel="noopener noreferrer"
              target="_blank"
              className={[
                "group/ghost relative !inline-flex !no-underline !outline-none !rounded-full",
                "transition-[outline-color] duration-150 ease-out",
                "focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-offset-2 focus-visible:!outline-[#213130]",
              ].join(" ")}
            >
              <span
                className={[
                  "relative !inline-flex !items-center !justify-center",
                  "!rounded-full !border !border-solid !border-[#213130] !bg-transparent",
                  "![padding-block:0.5em] ![padding-inline:1.25em]",
                  "![font-size:clamp(0.89375rem,0.8703rem+0.1172vi,0.96875rem)] !leading-[1.4] !text-[#213130]",
                  "transition-[transform,background-color] duration-150 ease-out",
                  "group-hover/ghost:!-translate-y-0.5 group-hover/ghost:!bg-[#f7f7f3]",
                ].join(" ")}
              >
                Join Discord
              </span>
            </a>
          </div>
          <p className="m-0 max-w-[65ch] text-[clamp(1rem,0.9565rem+0.2174vw,1.125rem)] leading-[1.4]">
            We prioritize customer connection as a company and you could end up speaking with a
            teammate in any role at SMC, from Marketers to Engineers.
          </p>
          <div>
            <a
              href="/about"
              className={[
                "group/tertiary relative !inline-flex !items-center !gap-[0.5ch]",
                "!rounded-full !text-[#4a4a45] !underline ![text-underline-offset:0.125rem] !outline-none",
                "transition-[outline-color] duration-150 ease-out",
                "focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-offset-[0.5rem] focus-visible:!outline-[#213130]",
              ].join(" ")}
            >
              <span className="!inline-flex !items-center !gap-[0.5ch] transition-transform duration-150 ease-out will-change-transform group-hover/tertiary:-translate-y-0.5">
                <span>Learn more about our global team</span>
                <TertiaryArrow />
              </span>
            </a>
          </div>
        </div>

        <div className="flex min-w-0 items-center justify-center">
          <span className="inline-flex w-full max-w-full items-center justify-center overflow-hidden rounded-[1.25rem]">
            <img
              className="aspect-[3/2] h-auto w-full max-w-full object-cover"
              alt=""
              width={1920}
              height={1280}
              loading="lazy"
              decoding="async"
              sizes="(min-width: 64rem) 45vw, calc(100vw - 2 * clamp(1rem, 0.6094rem + 1.9531vw, 2.25rem))"
              srcSet={srcSet("customer-support-team.webp")}
              src={src("customer-support-team.webp")}
            />
          </span>
        </div>
      </div>
    </section>
  );
}
