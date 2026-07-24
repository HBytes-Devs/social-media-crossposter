import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { ImmersiveAuthCta, ImmersiveAuthShell } from "../components/auth/ImmersiveAuthShell";
import { AuthFieldInput } from "../components/auth/AuthFieldInput";
import { RecaptchaNotice, useRecaptcha } from "../hooks/useRecaptcha";
import { useUiLanguage } from "../i18n/UiLanguageProvider";
import { api } from "../lib/api";
import {
  clearRememberedLogin,
  loadRememberedLogin,
  saveRememberedLogin,
} from "../lib/rememberLogin";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loginUser, selectAuth } from "../store/slices/authSlice";

const authLinkSx = {
  color: "primary.main",
  fontWeight: 600,
  "&:hover": { textDecoration: "underline" },
} as const;

export function LoginPage() {
  const { t } = useUiLanguage();
  const dispatch = useAppDispatch();
  const { loading: authLoading } = useAppSelector(selectAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [recaptchaEnabled, setRecaptchaEnabled] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const { loadError, execute } = useRecaptcha("login", recaptchaEnabled);

  useEffect(() => {
    const saved = loadRememberedLogin();
    if (saved) {
      setEmail(saved.email);
      setPassword(saved.password);
      setRememberMe(true);
    }
  }, []);

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
        if (rememberMe) {
          saveRememberedLogin(email, password);
        } else {
          clearRememberedLogin();
        }
        const role = result.payload.user.role;
        navigate(role === "SUPER_ADMIN" ? "/ops" : "/");
      } else {
        setError((result.payload as string) ?? t("auth.error.loginFailed"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.error.loginFailed"));
    }
  }

  return (
    <ImmersiveAuthShell
      title={t("auth.login.title")}
      subtitle={
        <>
          {t("auth.login.subtitlePrefix")}{" "}
          <Box component="b" sx={{ fontWeight: 650, color: "text.primary" }}>
            SMC
          </Box>{" "}
          {t("auth.login.subtitleSuffix")}
        </>
      }
      footer={
        <Typography sx={{ textAlign: "center", fontSize: 14, color: "text.secondary" }}>
          {t("auth.noAccount")}{" "}
          <Link component={RouterLink} to="/register" underline="none" sx={authLinkSx}>
            {t("auth.createAccount")}
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
          label={t("auth.password")}
          variant="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("auth.passwordPlaceholder")}
          required
          autoComplete="current-password"
        />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
            mt: 0.75,
            mb: 3.25,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                slotProps={{ input: { "aria-label": t("auth.rememberMe") } }}
              />
            }
            label={
              <Typography sx={{ fontSize: 13.5, color: "text.secondary" }}>
                {t("auth.rememberMe")}
              </Typography>
            }
            sx={{ m: 0 }}
          />
          <Link
            component={RouterLink}
            to="/forgot-password"
            underline="none"
            sx={{ ...authLinkSx, fontSize: 13.5, fontWeight: 500 }}
          >
            {t("auth.forgotPassword")}
          </Link>
        </Box>

        {loadError && (
          <Typography variant="caption" sx={{ display: "block", mb: 1.5, color: "warning.main" }}>
            {t("auth.recaptcha.loadError")}
          </Typography>
        )}

        {info && (
          <Typography variant="body2" sx={{ mb: 1.5, color: "success.main" }}>
            {info}
          </Typography>
        )}
        {error && (
          <Typography variant="body2" sx={{ mb: 1.5, color: "error.main" }}>
            {error}
          </Typography>
        )}

        <ImmersiveAuthCta loading={authLoading}>{t("auth.login")}</ImmersiveAuthCta>

        <RecaptchaNotice enabled={recaptchaEnabled} />
      </Box>
    </ImmersiveAuthShell>
  );
}
