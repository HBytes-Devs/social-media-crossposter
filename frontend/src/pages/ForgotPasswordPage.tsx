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
  color: (theme: { palette: { mode: string } }) =>
    theme.palette.mode === "dark" ? "#5EEAD4" : "#0F766E",
  fontWeight: 600,
  textDecoration: "underline",
  "&:hover": { textDecoration: "none" },
} as const;

export function ForgotPasswordPage() {
  const { t } = useUiLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [recaptchaEnabled, setRecaptchaEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { loadError, execute, enabled: captchaActive } = useRecaptcha(
    "forgot_password",
    recaptchaEnabled,
  );

  useEffect(() => {
    let cancelled = false;
    api
      .getAuthConfig()
      .then((config) => {
        if (!cancelled) setRecaptchaEnabled(Boolean(config?.recaptchaEnabled));
      })
      .catch(() => {
        if (!cancelled) setRecaptchaEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    setLoading(true);
    try {
      const recaptchaToken = captchaActive ? await execute() : undefined;
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
      title={
        <>
          {t("auth.forgot.titlePrefix")}{" "}
          <Box
            component="span"
            sx={{ color: (theme) => (theme.palette.mode === "dark" ? "#5EEAD4" : "#0F766E") }}
          >
            {t("auth.forgot.titleAccent")}
          </Box>
        </>
      }
      subtitle={t("auth.forgot.subtitle")}
      footer={
        <Typography sx={{ textAlign: "center", fontSize: 14, color: "text.secondary" }}>
          <Link component={RouterLink} to="/login" sx={authLinkSx}>
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

          <RecaptchaNotice enabled={captchaActive} />
        </Box>
      )}
    </ImmersiveAuthShell>
  );
}
