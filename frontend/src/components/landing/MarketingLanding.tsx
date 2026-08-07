import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LandingAudiences } from "./LandingAudiences";
import { LandingBanner } from "./LandingBanner";
import { LandingChannels } from "./LandingChannels";
import { LandingCoreFeatures } from "./LandingCoreFeatures";
import { LandingCta } from "./LandingCta";
import { LandingFooter } from "./LandingFooter";
import { LandingHero } from "./LandingHero";
import { LandingMoreFeatures } from "./LandingMoreFeatures";
import { LandingNav } from "./LandingNav";
import { LandingOpenCompany } from "./LandingOpenCompany";
import { LandingResources } from "./LandingResources";
import { LandingSocialProofLogos } from "./LandingSocialProofLogos";
import { LandingSupport } from "./LandingSupport";

/**
 * Marketing homepage — React + Tailwind sections (no external reference CSS).
 */
export function MarketingLanding() {
  const rootRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.("a,button");
      if (!el) return;

      const auth = el.getAttribute("data-smc-auth");
      const href = el.getAttribute("href") || "";
      const text = (el.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();

      if (auth === "login" || href === "/login" || text === "log in") {
        e.preventDefault();
        navigate("/login");
        return;
      }

      if (
        auth === "register" ||
        href === "/register" ||
        text.includes("get started") ||
        text.includes("sign up")
      ) {
        e.preventDefault();
        const form = el.closest("form");
        const input = form?.querySelector<HTMLInputElement>('input[type="email"]');
        const q = input?.value?.trim() ? `?email=${encodeURIComponent(input.value.trim())}` : "";
        navigate(`/register${q}`);
      }
    };

    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [navigate]);

  return (
    <div
      ref={rootRef}
      className="bg-white text-neutral-900 antialiased"
    >
      <LandingNav />
      <LandingBanner />
      <div className="home">
        <main className="overflow-x-clip bg-[#fefdfb]">
          <LandingHero />
          <LandingSocialProofLogos />
          <LandingCoreFeatures />
          <LandingMoreFeatures />
          <LandingChannels />
          <LandingAudiences />
          <LandingSupport />
          <LandingResources />
          <LandingOpenCompany />
          <LandingCta />
        </main>
      </div>
      {/* Outside overflow-x-clip ancestors so language dropdown isn’t clipped */}
      <div className="bg-[#fefdfb]">
        <LandingFooter />
      </div>
    </div>
  );
}
