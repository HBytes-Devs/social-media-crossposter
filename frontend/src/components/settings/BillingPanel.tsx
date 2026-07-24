import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../lib/api";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { initializeAuth, selectAuth, selectToken } from "../../store/slices/authSlice";
import type { PlanDefinition, SubscriptionTier } from "../../types";
import { SettingsPanel } from "./SettingsPanel";
import { useSettingsTheme } from "./settingsTheme";

const TIER_ORDER: SubscriptionTier[] = ["FREE", "MEDIUM", "PREMIUM"];

function tierRank(tier: SubscriptionTier): number {
  return TIER_ORDER.indexOf(tier);
}

export function BillingPanel() {
  const { colors, fonts } = useSettingsTheme();
  const token = useAppSelector(selectToken);
  const { user } = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const [plans, setPlans] = useState<PlanDefinition[]>([]);
  const [billingConfigured, setBillingConfigured] = useState(false);
  const [usage, setUsage] = useState<{ accountsConnected: number; postsThisMonth: number } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [actionTier, setActionTier] = useState<SubscriptionTier | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [inviteToken, setInviteToken] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  const currentTier = user?.subscription.tier ?? "FREE";

  const loadBilling = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const [plansRes, statusRes] = await Promise.all([
        api.getBillingPlans(),
        api.getBillingStatus(token),
      ]);
      setPlans(plansRes.plans);
      setBillingConfigured(plansRes.billingConfigured);
      setUsage(statusRes.usage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load billing");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadBilling();
  }, [loadBilling]);

  useEffect(() => {
    const billingResult = searchParams.get("billing");
    if (billingResult === "success") {
      setNotice("Payment successful! Your plan will update shortly.");
      void dispatch(initializeAuth());
      void loadBilling();
      searchParams.delete("billing");
      setSearchParams(searchParams, { replace: true });
    } else if (billingResult === "canceled") {
      setNotice("Checkout canceled — no charges were made.");
      searchParams.delete("billing");
      setSearchParams(searchParams, { replace: true });
    }
  }, [dispatch, loadBilling, searchParams, setSearchParams]);

  async function handleUpgrade(tier: "MEDIUM" | "PREMIUM") {
    if (!token) return;

    setActionTier(tier);
    setError(null);

    try {
      const { url } = await api.createCheckoutSession(token, tier);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setActionTier(null);
    }
  }

  async function handleManageBilling() {
    if (!token) return;

    setActionTier("portal");
    setError(null);

    try {
      const { url } = await api.createBillingPortalSession(token);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open billing portal");
      setActionTier(null);
    }
  }

  if (loading) {
    return (
      <SettingsPanel title="Plans & Billing" subtitle="Subscription plans aur usage">
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} sx={{ color: colors.accent }} />
        </Box>
      </SettingsPanel>
    );
  }

  return (
    <SettingsPanel
      title="Plans & Billing"
      subtitle="Basic free hai — Medium ya Premium se zyada platforms aur posts unlock karo"
    >
      {notice && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {usage && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            mb: 2.5,
          }}
        >
          <Chip
            label={`Plan: ${user?.subscription.premierMember ? "Premier member" : (user?.subscription.plan.name ?? "Basic")}`}
            sx={{
              bgcolor: colors.accentSoft,
              color: colors.accentText,
              fontFamily: fonts.body,
              fontWeight: 600,
            }}
          />
          <Chip
            label={`Accounts: ${usage.accountsConnected}${user?.subscription.plan.name === "Premium" ? "" : ` / ${plans.find((p) => p.id === currentTier)?.limits.maxAccounts ?? "—"}`}`}
            variant="outlined"
            sx={{ borderColor: colors.line, fontFamily: fonts.body }}
          />
          <Chip
            label={`Posts this month: ${usage.postsThisMonth}${plans.find((p) => p.id === currentTier)?.limits.maxPostsPerMonth ? ` / ${plans.find((p) => p.id === currentTier)?.limits.maxPostsPerMonth}` : ""}`}
            variant="outlined"
            sx={{ borderColor: colors.line, fontFamily: fonts.body }}
          />
        </Box>
      )}

      {user?.subscription.source === "organization" && user.organization && (
        <Alert severity="info" sx={{ mb: 2.5 }}>
          Your access comes from company <strong>{user.organization.name}</strong> (
          {user.organization.seatUsed}/{user.organization.seatLimit} seats). Individual Stripe
          upgrades do not replace the company plan while you remain a member.
        </Alert>
      )}

      {!billingConfigured && (
        <Alert severity="info" sx={{ mb: 2.5 }}>
          Stripe abhi configure nahi hai. Paid plans ke liye backend `.env` mein Stripe keys add karo.
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        {plans.map((plan) => {
          const isCurrent = plan.id === currentTier;
          const isPopular = plan.id === "MEDIUM";
          const canUpgrade =
            billingConfigured &&
            user?.subscription.source !== "organization" &&
            tierRank(plan.id) > tierRank(currentTier) &&
            plan.id !== "FREE";
          const isPaidCurrent = isCurrent && plan.id !== "FREE";

          return (
            <Box
              key={plan.id}
              sx={{
                position: "relative",
                border: "1px solid",
                borderColor: isCurrent ? colors.accent : colors.line,
                borderRadius: "14px",
                p: 2.5,
                bgcolor: isCurrent ? colors.accentSoft : colors.inputBg,
                display: "flex",
                flexDirection: "column",
                minHeight: 360,
              }}
            >
              {isPopular && !isCurrent && (
                <Chip
                  icon={<StarBorderIcon sx={{ fontSize: 14 }} />}
                  label="Popular"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    bgcolor: colors.goldSoft,
                    color: colors.gold,
                    fontWeight: 600,
                    fontSize: 11,
                  }}
                />
              )}

              {isCurrent && (
                <Chip
                  label="Current plan"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    bgcolor: colors.accent,
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 11,
                  }}
                />
              )}

              <Typography
                sx={{
                  fontFamily: fonts.heading,
                  fontWeight: 700,
                  fontSize: 18,
                  color: colors.text,
                  mb: 0.5,
                }}
              >
                {plan.name}
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: colors.muted, mb: 2, minHeight: 36 }}>
                {plan.description}
              </Typography>

              <Typography
                sx={{
                  fontFamily: fonts.heading,
                  fontWeight: 800,
                  fontSize: 28,
                  color: colors.text,
                  mb: 2,
                }}
              >
                {plan.priceLabel}
              </Typography>

              <Box sx={{ flex: 1, mb: 2 }}>
                {plan.features.map((feature) => (
                  <Box
                    key={feature}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                      mb: 1,
                      fontSize: 12.5,
                      color: colors.textSoft,
                      fontFamily: fonts.body,
                    }}
                  >
                    <CheckCircleOutlinedIcon
                      sx={{ fontSize: 16, color: colors.success, mt: "2px", flexShrink: 0 }}
                    />
                    {feature}
                  </Box>
                ))}
              </Box>

              {canUpgrade && (
                <Button
                  fullWidth
                  disabled={actionTier !== null}
                  onClick={() => void handleUpgrade(plan.id as "MEDIUM" | "PREMIUM")}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    fontFamily: fonts.body,
                    py: "10px",
                    borderRadius: "10px",
                    color: "#fff",
                    background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`,
                    "&:hover": {
                      background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`,
                      boxShadow: "0 10px 24px -10px rgba(91,95,239,0.55)",
                    },
                  }}
                >
                  {actionTier === plan.id ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </Button>
              )}

              {isPaidCurrent && billingConfigured && (
                <Button
                  fullWidth
                  variant="outlined"
                  disabled={actionTier !== null}
                  onClick={() => void handleManageBilling()}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    fontFamily: fonts.body,
                    py: "10px",
                    borderRadius: "10px",
                    borderColor: colors.line,
                    color: colors.text,
                  }}
                >
                  {actionTier === "portal" ? (
                    <CircularProgress size={18} />
                  ) : (
                    "Manage subscription"
                  )}
                </Button>
              )}

              {isCurrent && plan.id === "FREE" && (
                <Typography
                  sx={{
                    textAlign: "center",
                    fontSize: 12,
                    color: colors.muted,
                    fontFamily: fonts.body,
                    mt: 1,
                  }}
                >
                  Aapka default plan
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>

      <Box sx={{ mt: 3, pt: 2.5, borderTop: "1px solid", borderColor: colors.line }}>
        <Typography sx={{ fontWeight: 600, mb: 1, fontFamily: fonts.body }}>
          Company invite
        </Typography>
        <Typography sx={{ fontSize: 13, color: colors.muted, mb: 1.5, fontFamily: fonts.body }}>
          Agar admin ne invite token diya hai, yahan paste karke company plan join karo.
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <TextField
            size="small"
            label="Invite token"
            value={inviteToken}
            onChange={(e) => setInviteToken(e.target.value)}
            sx={{ flex: 1, minWidth: 220 }}
          />
          <Button
            variant="outlined"
            disabled={!token || !inviteToken.trim() || inviteLoading}
            onClick={() => {
              if (!token) return;
              setInviteLoading(true);
              setError(null);
              void api
                .acceptOrganizationInvite(token, inviteToken.trim())
                .then(async () => {
                  setNotice("Company invite accepted");
                  setInviteToken("");
                  await dispatch(initializeAuth());
                  await loadBilling();
                })
                .catch((err: unknown) => {
                  setError(err instanceof Error ? err.message : "Invite accept failed");
                })
                .finally(() => setInviteLoading(false));
            }}
            sx={{ textTransform: "none", fontFamily: fonts.body }}
          >
            {inviteLoading ? <CircularProgress size={18} /> : "Accept invite"}
          </Button>
        </Box>
      </Box>
    </SettingsPanel>
  );
}
