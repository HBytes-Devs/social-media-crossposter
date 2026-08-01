import Box from "@mui/material/Box";
import { useEffect } from "react";
import { LandingAbout, LandingFinalCta, LandingFooter } from "../components/landing/LandingFinalCta";
import { LandingAudiences, LandingPricing } from "../components/landing/LandingAudiences";
import { LandingFeatures } from "../components/landing/LandingFeatures";
import { LandingHero } from "../components/landing/LandingHero";
import { LandingMore } from "../components/landing/LandingMore";
import { LandingNav } from "../components/landing/LandingNav";
import { LandingPlatforms } from "../components/landing/LandingPlatforms";
import { LandingResources } from "../components/landing/LandingResources";
import { LandingSocialProof } from "../components/landing/LandingSocialProof";
import { LandingSupport } from "../components/landing/LandingSupport";
import { landing } from "../components/landing/landingTheme";
import "../components/landing/landing.css";

export function LandingPage() {
  useEffect(() => {
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = prev;
    };
  }, []);

  return (
    <Box className="landing-root" component="main" sx={{ minHeight: "100vh", colorScheme: "light", bgcolor: landing.bgOff, width: "100%", maxWidth: "100%", overflowX: "clip" }}>
      <LandingNav />
      <LandingHero />
      <LandingSocialProof />
      <LandingFeatures />
      <LandingMore />
      <LandingPlatforms />
      <LandingAudiences />
      <LandingPricing />
      <LandingSupport />
      <Box id="resources" component="div">
        <LandingResources />
      </Box>
      <LandingAbout />
      <LandingFinalCta />
      <LandingFooter />
    </Box>
  );
}
