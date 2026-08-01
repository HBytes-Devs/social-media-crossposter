import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DummyMedia } from "./DummyMedia";
import { landing, wrap } from "./landingTheme";

/** Floating tiles around hero — Buffer-style platform/emoji placeholders. */
const FLOATS: { top: string; left?: string; right?: string; size: number; color: string; delay: string }[] = [
  { top: "10%", left: "6%", size: 56, color: "#E4405F", delay: "0s" },
  { top: "16%", right: "8%", size: 64, color: "#0A66C2", delay: "0.4s" },
  { top: "42%", left: "4%", size: 52, color: "#1877F2", delay: "0.2s" },
  { top: "50%", right: "5%", size: 58, color: "#111111", delay: "0.7s" },
  { top: "68%", left: "10%", size: 60, color: "#FF0000", delay: "0.3s" },
  { top: "72%", right: "12%", size: 52, color: "#E60023", delay: "0.9s" },
  { top: "8%", left: "20%", size: 48, color: "#000000", delay: "0.5s" },
  { top: "34%", right: "18%", size: 50, color: "#6364FF", delay: "1.1s" },
  { top: "78%", left: "22%", size: 46, color: "#0085FF", delay: "0.6s" },
  { top: "24%", left: "12%", size: 44, color: "#F59E0B", delay: "1s" },
];

export function LandingHero() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const go = () => {
    const q = email.trim() ? `?email=${encodeURIComponent(email.trim())}` : "";
    navigate(`/register${q}`);
  };

  return (
    <Box
      id="top"
      component="section"
      className="landing-hero-grid"
      sx={{ position: "relative", overflow: "hidden", minHeight: { xs: 480, md: 560 } }}
    >
      {FLOATS.map((f, i) => (
        <Box key={i} className="landing-float" sx={{ top: f.top, left: f.left, right: f.right, animationDelay: f.delay }}>
          <DummyMedia
            width={f.size}
            height={f.size}
            label=""
            bgcolor={f.color}
            radius={16}
            sx={{ border: 0, boxShadow: "0 12px 32px rgba(0,0,0,0.12)" }}
          />
        </Box>
      ))}

      <Box
        sx={{
          ...wrap,
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          pt: { xs: 7, md: 10 },
          pb: { xs: 6, md: 8 },
        }}
      >
        {/* Live buffer.com: h2.HeroSection_heading */}
        <Typography
          className="landing-rise"
          component="h2"
          sx={{
            fontWeight: 700,
            fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem" },
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            color: landing.ink,
            mb: 2,
            maxWidth: 900,
            mx: "auto",
          }}
        >
          Your social media workspace
        </Typography>

        {/* Live buffer.com: Connected to every platform and tool you use. */}
        <Typography
          className="landing-rise-d"
          sx={{
            fontSize: { xs: 18, md: 22 },
            fontWeight: 400,
            color: landing.muted,
            mb: 4,
            maxWidth: 560,
            mx: "auto",
            lineHeight: 1.45,
          }}
        >
          Connected to every platform and tool you use.
        </Typography>

        {/* EmailForm — Enter your email... + Get started for free */}
        <Box className="landing-rise-d" component="form" onSubmit={(e) => { e.preventDefault(); go(); }} sx={{ maxWidth: 520, mx: "auto" }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={0}
            sx={{
              bgcolor: "#fff",
              borderRadius: 3,
              boxShadow: "0 16px 48px rgba(0,0,0,0.12)",
              border: `1px solid ${landing.line}`,
              overflow: "hidden",
              alignItems: "stretch",
              minHeight: 60,
            }}
          >
            <TextField
              fullWidth
              type="email"
              name="email"
              placeholder="Enter your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="standard"
              slotProps={{ input: { disableUnderline: true } }}
              sx={{
                flex: 1,
                px: 2.5,
                "& .MuiInputBase-root": { height: 60, fontSize: 16 },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disableElevation
              sx={{
                textTransform: "none",
                fontWeight: 700,
                fontSize: 15,
                bgcolor: landing.green,
                borderRadius: 0,
                px: 3,
                height: { xs: 52, sm: 60 },
                whiteSpace: "nowrap",
                "&:hover": { bgcolor: landing.greenDark },
              }}
            >
              Get started for free
            </Button>
          </Stack>
          <Typography sx={{ mt: 1.75, fontSize: 13, color: landing.soft, textAlign: "center" }}>
            By entering your email, you agree to receive emails from SMC.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
