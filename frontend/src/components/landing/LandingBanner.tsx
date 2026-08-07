/**
 * Announcement strip below the sticky header — React + Tailwind,
 * matched to marketing-landing.css HomeBanner_* + Badge_* (dark/small).
 */
export function LandingBanner() {
  return (
    <aside
      className="bg-[#d8f1d0] px-[clamp(1rem,0.9609rem+0.1953vw,1.125rem)] py-[0.625rem]"
      aria-label="Announcement"
      style={{ fontFamily: '"Figtree", ui-sans-serif, system-ui, sans-serif' }}
    >
      <p
        className={[
          "m-0 flex flex-wrap items-center justify-center gap-3",
          "text-center leading-[1.4] tracking-[0.0075em] text-[#337047]",
          "text-[clamp(1rem,0.9565rem+0.2174vw,1.125rem)]",
        ].join(" ")}
      >
        <span
          className={[
            "inline-block rounded-[0.25rem] bg-[#337047] px-[0.5em] py-[0.25em]",
            "font-medium tracking-[0.03125em] text-[#fefdfb]",
            "text-[clamp(0.8rem,0.7863rem+0.0687vw,0.84375rem)]",
          ].join(" ")}
        >
          New
        </span>
        <span>
          <span className="font-semibold">Insights</span> is here.
        </span>
        <a
          href="#features"
          className={[
            "rounded text-[#337047] no-underline",
            "outline outline-[0.125rem] outline-offset-[0.125rem] outline-transparent",
            "transition-[outline-color] duration-150 ease-out",
            "hover:underline focus-visible:outline-[#337047]",
          ].join(" ")}
        >
          Learn more →
        </a>
      </p>
    </aside>
  );
}
