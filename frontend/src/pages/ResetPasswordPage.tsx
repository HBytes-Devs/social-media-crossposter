import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { AuthCtaButton, AuthSplitShell } from "../components/auth/AuthSplitShell";
import { AuthFieldInput } from "../components/auth/AuthFieldInput";
import { useUiLanguage } from "../i18n/UiLanguageProvider";
import { api } from "../lib/api";

const authLinkSx = {
  color: "#4B5FFF",
  fontWeight: 500,
  "&:hover": { textDecoration: "underline" },
} as const;

export function ResetPasswordPage() {
  const { t } = useUiLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = (location.state as { email?: string } | null)?.email ?? "";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("auth.error.passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword(email, code, password);
      navigate("/login", {
        state: { message: t("auth.success.passwordUpdated") },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.error.resetFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthSplitShell
      title={t("auth.reset.title")}
      subtitle={t("auth.reset.subtitle")}
      footerDivider={false}
      footer={
        <Typography sx={{ textAlign: "center", fontSize: 14, color: "text.secondary" }}>
          {t("auth.codeNotReceived")}{" "}
          <Link component={RouterLink} to="/forgot-password" underline="none" sx={authLinkSx}>
            {t("auth.resendCode")}
          </Link>
          {" · "}
          <Link component={RouterLink} to="/login" underline="none" sx={authLinkSx}>
            {t("auth.login")}
          </Link>
        </Typography>
      }
    >
      <Box component="form" onSubmit={handleSubmit}>
        <AuthFieldInput
          label={t("auth.email")}
          variant="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("auth.emailPlaceholder")}
          required
          autoComplete="email"
        />
        <AuthFieldInput
          label={t("auth.resetCode")}
          variant="code"
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder={t("auth.resetCodePlaceholder")}
          required
          autoComplete="one-time-code"
        />
        <AuthFieldInput
          label={t("auth.newPassword")}
          variant="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("auth.passwordPlaceholder")}
          required
          minLength={8}
          autoComplete="new-password"
        />
        <AuthFieldInput
          label={t("auth.confirmPassword")}
          variant="password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder={t("auth.passwordPlaceholder")}
          required
          minLength={8}
          autoComplete="new-password"
          id="auth-confirm-password"
        />

        {error && (
          <Typography variant="body2" color="error" sx={{ mb: 1.5 }}>
            {error}
          </Typography>
        )}

        <AuthCtaButton loading={loading}>{t("auth.updatePassword")}</AuthCtaButton>
      </Box>
    </AuthSplitShell>
  );
}
