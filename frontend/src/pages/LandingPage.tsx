import { useEffect } from "react";
import { MarketingLanding } from "../components/landing/MarketingLanding";

/** Guest marketing home — high-fidelity React landing (SMC-owned file names). */
export function LandingPage() {
  useEffect(() => {
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "smooth";
    const prevTitle = document.title;
    document.title = "SMC — Social Media Crossposter";
    return () => {
      document.documentElement.style.scrollBehavior = prev;
      document.title = prevTitle;
    };
  }, []);

  return (
    /* Avoid overflow-x-clip here — it forces overflow-y to auto and traps
       scroll + clips the footer language menu. Clip lives on MarketingLanding main. */
    <div className="min-h-screen w-full max-w-full bg-white">
      <MarketingLanding />
    </div>
  );
}
