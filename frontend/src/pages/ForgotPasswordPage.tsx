import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { ImmersiveAuthCta, ImmersiveAuthShell } from "../components/auth/ImmersiveAuthShell";
import { AuthFieldInput } from "../components/auth/AuthFieldInput";
import { RecaptchaNotice, useRecaptcha } from "../hooks/useRecaptcha";
import { useUiLanguage } from "../i18n/UiLanguageProvider";
import { api } from "../lib/api";

const authLinkSx = {
  color: "primary.main",
  fontWeight: 600,
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
    <ImmersiveAuthShell
      title={t("auth.forgot.title")}
      subtitle={t("auth.forgot.subtitle")}
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
          <Typography variant="body2" sx={{ mb: 2.5, lineHeight: 1.6, color: "success.main" }}>
            {t("auth.forgot.success")}
          </Typography>
          <ImmersiveAuthCta
            type="button"
            onClick={() => navigate("/reset-password", { state: { email } })}
          >
            {t("auth.enterResetCode")}
          </ImmersiveAuthCta>
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
            <Typography variant="caption" sx={{ display: "block", mb: 1.5, color: "warning.main" }}>
              {t("auth.recaptcha.loadError")}
            </Typography>
          )}

          {error && (
            <Typography variant="body2" sx={{ mb: 1.5, color: "error.main" }}>
              {error}
            </Typography>
          )}

          <ImmersiveAuthCta loading={loading}>{t("auth.sendResetCode")}</ImmersiveAuthCta>

          <RecaptchaNotice enabled={recaptchaEnabled} />
        </Box>
      )}
    </ImmersiveAuthShell>
  );
}
