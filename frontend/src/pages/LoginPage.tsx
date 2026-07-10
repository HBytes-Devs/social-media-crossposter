import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { AuthShell } from "../components/ui/AuthShell";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { RecaptchaNotice, useRecaptcha } from "../hooks/useRecaptcha";
import { useUiLanguage } from "../i18n/UiLanguageProvider";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loginUser, selectAuth } from "../store/slices/authSlice";
import { api } from "../lib/api";

export function LoginPage() {
  const { t } = useUiLanguage();
  const dispatch = useAppDispatch();
  const { loading: authLoading } = useAppSelector(selectAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recaptchaEnabled, setRecaptchaEnabled] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const { loadError, execute } = useRecaptcha("login", recaptchaEnabled);

  useEffect(() => {
    const message = (location.state as { message?: string } | null)?.message;
    if (message) {
      setInfo(message);
    }
  }, [location.state]);

  useEffect(() => {
    api.getAuthConfig().then((config) => {
      setRecaptchaEnabled(config.recaptchaEnabled);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");

    try {
      const recaptchaToken = recaptchaEnabled ? await execute() : undefined;

      const result = await dispatch(
        loginUser({ email, password, recaptchaToken }),
      );
      if (loginUser.fulfilled.match(result)) {
        navigate("/");
      } else {
        setError((result.payload as string) ?? t("auth.error.loginFailed"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.error.loginFailed"));
    }
  }

  return (
    <AuthShell
      title={t("auth.login.title")}
      subtitle={t("auth.login.subtitle")}
      footer={
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {t("auth.noAccount")}{" "}
          <Link component={RouterLink} to="/register" underline="hover">
            {t("auth.register")}
          </Link>
        </Typography>
      }
    >
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
        <Input
          label={t("auth.email")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <Stack spacing={1}>
          <Input
            label={t("auth.password")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Typography variant="body2" textAlign="right">
            <Link
              component={RouterLink}
              to="/forgot-password"
              underline="hover"
              variant="body2"
            >
              {t("auth.forgotPassword")}
            </Link>
          </Typography>
        </Stack>

        {loadError && (
          <Typography variant="caption" color="warning.main">
            {t("auth.recaptcha.loadError")}
          </Typography>
        )}

        {info && (
          <Typography variant="body2" color="success.main">
            {info}
          </Typography>
        )}
        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}

        <Button type="submit" className="w-full" loading={authLoading}>
          {t("auth.login")}
        </Button>

        <RecaptchaNotice enabled={recaptchaEnabled} />
      </Stack>
    </AuthShell>
  );
}
