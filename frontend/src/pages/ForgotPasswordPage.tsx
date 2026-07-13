import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { AuthCtaButton, AuthSplitShell } from "../components/auth/AuthSplitShell";
import { AuthFieldInput } from "../components/auth/AuthFieldInput";
import { RecaptchaNotice, useRecaptcha } from "../hooks/useRecaptcha";
import { useUiLanguage } from "../i18n/UiLanguageProvider";
import { api } from "../lib/api";

const authLinkSx = {
  color: "#4B5FFF",
  fontWeight: 500,
  "&:hover": { textDecoration: "underline" },
} as const;

export function ForgotPasswordPage() {
  const { t } = useUiLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [recaptchaEnabled, setRecaptchaEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { loadError, execute } = useRecaptcha("forgot_password", recaptchaEnabled);

  useEffect(() => {
    api.getAuthConfig().then((config) => {
      setRecaptchaEnabled(config.recaptchaEnabled);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    setLoading(true);
    try {
      const recaptchaToken = recaptchaEnabled ? await execute() : undefined;
      await api.forgotPassword(email, recaptchaToken);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.error.requestFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthSplitShell
      title={t("auth.forgot.title")}
      subtitle={t("auth.forgot.subtitle")}
      footerDivider={false}
      footer={
        <Typography sx={{ textAlign: "center", fontSize: 14, color: "text.secondary" }}>
          <Link component={RouterLink} to="/login" underline="none" sx={authLinkSx}>
            {t("auth.backToLogin")}
          </Link>
        </Typography>
      }
    >
      {success ? (
        <Box>
          <Typography variant="body2" color="success.main" sx={{ mb: 2.5, lineHeight: 1.6 }}>
            {t("auth.forgot.success")}
          </Typography>
          <AuthCtaButton type="button" onClick={() => navigate("/reset-password", { state: { email } })}>
            {t("auth.enterResetCode")}
          </AuthCtaButton>
        </Box>
      ) : (
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

          {loadError && (
            <Typography variant="caption" color="warning.main" sx={{ display: "block", mb: 1.5 }}>
              {t("auth.recaptcha.loadError")}
            </Typography>
          )}

          {error && (
            <Typography variant="body2" color="error" sx={{ mb: 1.5 }}>
              {error}
            </Typography>
          )}

          <AuthCtaButton loading={loading}>{t("auth.sendResetCode")}</AuthCtaButton>

          <RecaptchaNotice enabled={recaptchaEnabled} />
        </Box>
      )}
    </AuthSplitShell>
  );
}
