import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { BrandMark } from "./BrandMark";
import { landing, wrap } from "./landingTheme";

const NAV_ITEMS = [
  { label: "Features", href: "#features" },
  { label: "Integrations", href: "#platforms" },
  { label: "Made for", href: "#audiences" },
  { label: "Resources", href: "#resources" },
] as const;

export { BrandMark };

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 60,
        bgcolor: "#fff",
        borderBottom: scrolled ? `1px solid ${landing.line}` : "1px solid transparent",
        width: "100%",
        maxWidth: "100%",
        overflowX: "clip",
      }}
    >
      <Box
        sx={{
          ...wrap,
          maxWidth: 1200,
          minHeight: { xs: 80, md: 96 },
          py: { xs: 1.5, md: 2 },
          minWidth: 0,
          display: "grid",
          gridTemplateColumns: { xs: "1fr auto", md: "1fr auto 1fr" },
          alignItems: "center",
          columnGap: 2,
        }}
      >
        <Box sx={{ justifySelf: "start", display: "flex", alignItems: "center" }}>
          <Link href="#top" underline="none" sx={{ display: "inline-flex", alignItems: "center" }}>
            <BrandMark />
          </Link>
        </Box>

        <Stack
          direction="row"
          spacing={0.75}
          alignItems="center"
          justifyContent="center"
          sx={{
            display: { xs: "none", md: "flex" },
            justifySelf: "center",
          }}
        >
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.label}
              href={item.href}
              endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 20, ml: -0.5 }} />}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                fontSize: 16,
                color: landing.ink,
                px: 2,
                height: 48,
                borderRadius: 2,
                "&:hover": { bgcolor: "rgba(15, 118, 110, 0.06)" },
                "& .MuiButton-endIcon": { ml: 0.35 },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Stack>

        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
          justifyContent="flex-end"
          sx={{ justifySelf: "end", flexShrink: 0 }}
        >
          <Button
            component={RouterLink}
            to="/login"
            sx={{
              display: { xs: "none", sm: "inline-flex" },
              textTransform: "none",
              fontWeight: 600,
              fontSize: 16,
              color: landing.ink,
              height: 48,
              px: 2,
              borderRadius: 2,
              "&:hover": { bgcolor: "rgba(15, 118, 110, 0.06)" },
            }}
          >
            Log in
          </Button>
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            disableElevation
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: { xs: 13, sm: 15 },
              bgcolor: landing.green,
              color: "#fff",
              borderRadius: 2,
              height: 48,
              px: { xs: 2, sm: 2.5 },
              whiteSpace: "nowrap",
              "&:hover": { bgcolor: landing.greenDark },
            }}
          >
            Get started for free
          </Button>
          <IconButton
            sx={{ display: { md: "none" }, color: landing.ink, width: 48, height: 48 }}
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </Stack>
      </Box>

      {open ? (
        <Stack
          spacing={0.5}
          alignItems="stretch"
          sx={{
            display: { md: "none" },
            px: 2.5,
            pb: 2.5,
            borderTop: `1px solid ${landing.line}`,
          }}
        >
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              sx={{
                justifyContent: "center",
                textTransform: "none",
                fontWeight: 600,
                fontSize: 16,
                color: landing.ink,
                height: 48,
              }}
            >
              {item.label}
            </Button>
          ))}
          <Button
            component={RouterLink}
            to="/login"
            onClick={() => setOpen(false)}
            sx={{
              justifyContent: "center",
              textTransform: "none",
              fontWeight: 600,
              fontSize: 16,
              height: 48,
            }}
          >
            Log in
          </Button>
        </Stack>
      ) : null}
    </Box>
  );
}
