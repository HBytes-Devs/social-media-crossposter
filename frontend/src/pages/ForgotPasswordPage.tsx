import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AuthShell } from "../components/ui/AuthShell";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { RecaptchaNotice, useRecaptcha } from "../hooks/useRecaptcha";
import { useUiLanguage } from "../i18n/UiLanguageProvider";
import { api } from "../lib/api";

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
    <AuthShell
      title={t("auth.forgot.title")}
      subtitle={t("auth.forgot.subtitle")}
      footer={
        <Typography variant="body2" color="text.secondary" textAlign="center">
          <Link component={RouterLink} to="/login" underline="hover">
            {t("auth.backToLogin")}
          </Link>
        </Typography>
      }
    >
      {success ? (
        <Stack spacing={2.5}>
          <Typography variant="body2" color="success.main">
            {t("auth.forgot.success")}
          </Typography>
          <Button
            className="w-full"
            onClick={() => navigate("/reset-password", { state: { email } })}
          >
            {t("auth.enterResetCode")}
          </Button>
        </Stack>
      ) : (
        <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
          <Input
            label={t("auth.email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          {loadError && (
            <Typography variant="caption" color="warning.main">
              {t("auth.recaptcha.loadError")}
            </Typography>
          )}

          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}

          <Button type="submit" className="w-full" loading={loading}>
            {t("auth.sendResetCode")}
          </Button>

          <RecaptchaNotice enabled={recaptchaEnabled} />
        </Stack>
      )}
    </AuthShell>
  );
}
