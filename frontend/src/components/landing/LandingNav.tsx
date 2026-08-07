import { useEffect, useId, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Features", href: "#features", chevron: true },
  { label: "Integrations", href: "#platforms", chevron: true },
  { label: "Made for", href: "#audiences", chevron: true },
  { label: "Resources", href: "#resources", chevron: true },
  { label: "Pricing", href: "#pricing", chevron: false },
] as const;

/** SMC wordmark for the marketing header. */
function LogoMark() {
  return (
    <span
      aria-hidden
      className="inline-block text-[1.375rem] font-bold leading-none tracking-[-0.04em] sm:text-[1.75rem]"
      style={{ fontFamily: '"Figtree", ui-sans-serif, system-ui, sans-serif' }}
    >
      SMC
    </span>
  );
}

function ChevronDown() {
  return (
    <svg className="size-4 shrink-0" width={24} height={24} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M5.293 8.293a1 1 0 0 1 1.414 0L12 13.586l5.293-5.293a1 1 0 1 1 1.414 1.414l-6 6a1 1 0 0 1-1.414 0l-6-6a1 1 0 0 1 0-1.414Z"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
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
      <path d="M4 12h16M4 6h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
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
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/** Ghost pill — Log in (pure Tailwind) */
function LoginButton({
  className = "",
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <RouterLink
      to="/login"
      data-smc-auth="login"
      onClick={onClick}
      className={[
        "group/login relative !inline-flex !no-underline !outline-none",
        "!rounded-full transition-[outline-color] duration-150 ease-out",
        "focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-offset-2 focus-visible:!outline-[#213130]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className={[
          "relative !inline-flex !flex-1 !items-center !justify-center",
          "!rounded-full !border !border-solid !border-[#213130] !bg-transparent",
          "![padding-block:0.5em] ![padding-inline:1.25em]",
          "![font-size:clamp(1rem,0.9565rem+0.2174vi,1.125rem)] !leading-[1.4] !tracking-[0.0075em] !text-[#213130]",
          "transition-[transform,background-color] duration-150 ease-out will-change-transform",
          "group-hover/login:!-translate-y-0.5 group-hover/login:!bg-[#f7f7f3]",
        ].join(" ")}
      >
        Log in
      </span>
    </RouterLink>
  );
}

/** Brand pill — Get started (pure Tailwind) */
function SignupButton({
  className = "",
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <RouterLink
      to="/register"
      data-smc-auth="register"
      onClick={onClick}
      className={[
        "group/signup relative !inline-flex !no-underline !outline-none",
        "!rounded-full transition-[outline-color] duration-150 ease-out",
        "focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-offset-2 focus-visible:!outline-[#213130]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className={[
          "relative !inline-flex !flex-1 !items-center !justify-center",
          "!rounded-full !border !border-solid !border-[#b0ec9c] !bg-[#b0ec9c]",
          "![padding-block:0.5em] ![padding-inline:1.25em]",
          "![font-size:clamp(1rem,0.9565rem+0.2174vi,1.125rem)] !leading-[1.4] !tracking-[0.0075em] !text-[#213130]",
          "transition-[border-color,background-color,transform] duration-150 ease-out will-change-transform",
          "group-hover/signup:!-translate-y-0.5 group-hover/signup:!border-[#90d788] group-hover/signup:!bg-[#90d788]",
        ].join(" ")}
      >
        {/* Shorter label beside hamburger when the bar is tight (~≤480px) */}
        <span className="max-[30rem]:!inline min-[30.0625rem]:!hidden">Get started</span>
        <span className="max-[30rem]:!hidden min-[30.0625rem]:!inline">Get started for free</span>
      </span>
    </RouterLink>
  );
}

/**
 * Sticky marketing header — React + Tailwind.
 */
export function LandingNav() {
  const labelId = useId();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 2);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        /* Stay above all landing sections (many use z-10+) while scrolling.
           !z-50 beats marketing Nav z-index:2 cascade. */
        "sticky top-0 !z-50 bg-[#fefdfb] tracking-[0.0075em] text-[#213130]",
        "transition-[box-shadow] duration-200 ease-out",
        scrolled
          ? "shadow-[0_1px_0_rgba(23,23,23,0.06),0_0.5rem_1rem_-0.5rem_rgba(23,23,23,0.12)]"
          : "shadow-none",
      ].join(" ")}
      data-theme="light"
      style={{
        fontFamily: '"Figtree", ui-sans-serif, system-ui, sans-serif',
        zIndex: 50,
      }}
    >
      <nav
        className="mx-auto max-w-[93.5rem] px-4 py-[0.875rem] sm:px-6 md:px-8 lg:px-9"
        aria-labelledby={labelId}
      >
        <p className="sr-only" id={labelId}>
          Top navigation
        </p>

        <div className="relative flex items-center justify-between gap-2">
          {/* Leading — logo */}
          <div className="relative flex items-center">
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-[0.625rem] text-[#213130] outline outline-2 outline-offset-2 outline-transparent transition-[outline-color] duration-150 ease-out focus-visible:outline-[#213130]"
            >
              <span className="sr-only">SMC</span>
              <LogoMark />
            </a>
          </div>

          {/* Middle — desktop links (≥1024px) */}
          <div className="hidden items-center gap-2 lg:!flex">
            {NAV_ITEMS.map((item) =>
              item.chevron ? (
                <a
                  key={item.label}
                  href={item.href}
                  className="relative flex items-center gap-[0.5ch] rounded-[0.375rem] px-[0.75em] py-[0.25em] pe-[0.5em] text-[#213130] no-underline outline outline-2 outline-offset-2 outline-transparent transition-[outline-color,background-color] duration-150 ease-out hover:bg-[#e4e3dd] focus-visible:outline-[#213130]"
                >
                  <span>{item.label}</span>
                  <span className="relative block size-4">
                    <ChevronDown />
                  </span>
                </a>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-[0.375rem] px-[0.75em] py-[0.25em] text-[#213130] no-underline outline outline-2 outline-offset-2 outline-transparent transition-[outline-color,background-color] duration-150 ease-out hover:bg-[#f1f1ea] focus-visible:outline-[#213130]"
                >
                  {item.label}
                </a>
              ),
            )}
          </div>

          {/* Trailing — auth + mobile trigger */}
          <div className="relative flex items-center gap-2">
            {/* Login ≥36rem; signup ≥22rem (matches former Nav_* visibility) */}
            <LoginButton className="!hidden min-[36rem]:!inline-flex" />
            <SignupButton className="!hidden min-[22rem]:!inline-flex" />

            {/* Hamburger — <1024px */}
            <button
              type="button"
              className="-me-2 flex items-center justify-center gap-[1ch] rounded-[0.625rem] border-0 bg-transparent p-2 text-[#213130] outline outline-2 outline-offset-2 outline-transparent transition-[background-color,outline-color] duration-150 ease-out hover:bg-[#f1f1ea] focus-visible:outline-[#213130] lg:!hidden"
              aria-label="Navigation menu"
              aria-haspopup="dialog"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile full-screen panel */}
      {open ? (
        <div
          className="fixed inset-0 z-[60] max-h-dvh overflow-y-auto bg-[#fefdfb] px-4 pb-8 tracking-[0.0075em] text-[#213130] sm:px-6 lg:!hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          style={{ fontFamily: '"Figtree", ui-sans-serif, system-ui, sans-serif' }}
        >
          <div className="mb-6 flex items-center justify-between gap-2 py-[0.875rem]">
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-[0.625rem] text-[#213130]"
              onClick={() => setOpen(false)}
            >
              <span className="sr-only">SMC</span>
              <LogoMark />
            </a>
            <button
              type="button"
              className="-me-2 flex items-center justify-center rounded-[0.625rem] border-0 bg-transparent p-2 text-[#213130] outline outline-2 outline-offset-2 outline-transparent transition-[background-color,outline-color] duration-150 ease-out hover:bg-[#f1f1ea] focus-visible:outline-[#213130]"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center rounded-[0.375rem] px-[0.75em] py-[0.5em] text-base font-semibold text-[#213130] no-underline hover:bg-[#f1f1ea]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-col gap-3 [&_a]:!w-full [&_a]:!justify-center [&_a_span]:!w-full [&_a_span]:!justify-center">
              <LoginButton onClick={() => setOpen(false)} />
              <SignupButton onClick={() => setOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
