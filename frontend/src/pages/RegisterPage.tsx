import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { ImmersiveAuthCta, ImmersiveAuthShell } from "../components/auth/ImmersiveAuthShell";
import { AuthFieldInput } from "../components/auth/AuthFieldInput";
import { useUiLanguage } from "../i18n/UiLanguageProvider";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { registerUser, selectAuth } from "../store/slices/authSlice";

const authLinkSx = {
  color: "primary.main",
  fontWeight: 600,
  "&:hover": { textDecoration: "underline" },
} as const;

export function RegisterPage() {
  const { t } = useUiLanguage();
  const dispatch = useAppDispatch();
  const { loading: authLoading } = useAppSelector(selectAuth);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("auth.error.passwordMismatch"));
      return;
    }

    if (!acceptTerms) {
      setError(t("auth.error.termsRequired"));
      return;
    }

    const result = await dispatch(registerUser({ email, password, name: name || undefined }));
    if (registerUser.fulfilled.match(result)) {
      navigate("/");
    } else {
      setError((result.payload as string) ?? t("auth.error.registerFailed"));
    }
  }

  return (
    <ImmersiveAuthShell
      title={t("auth.register.title")}
      subtitle={
        <>
          {t("auth.register.subtitlePrefix")}{" "}
          <Box component="b" sx={{ fontWeight: 650, color: "text.primary" }}>
            SMC
          </Box>
        </>
      }
      footer={
        <Typography sx={{ textAlign: "center", fontSize: 14, color: "text.secondary" }}>
          {t("auth.haveAccount")}{" "}
          <Link component={RouterLink} to="/login" underline="none" sx={authLinkSx}>
            {t("auth.login")}
          </Link>
        </Typography>
      }
    >
      <Box component="form" onSubmit={handleSubmit}>
        <AuthFieldInput
          label={t("auth.nameOptional")}
          variant="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("auth.namePlaceholder")}
          requiredMark={false}
          autoComplete="name"
        />
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
          id="auth-register-confirm-password"
        />

        <Typography sx={{ mt: -1, mb: 2, fontSize: 12.5, color: "text.disabled" }}>
          {t("auth.passwordHint")}
        </Typography>

        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              required
            />
          }
          label={
            <Typography sx={{ fontSize: 13.5, color: "text.secondary", lineHeight: 1.45 }}>
              {t("auth.termsPrefix")}{" "}
              <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
                {t("auth.termsLabel")}
              </Box>
            </Typography>
          }
          sx={{ alignItems: "flex-start", m: 0, mb: 2.5 }}
        />

        {error && (
          <Typography variant="body2" sx={{ mb: 1.5, color: "error.main" }}>
            {error}
          </Typography>
        )}

        <ImmersiveAuthCta loading={authLoading}>{t("auth.register")}</ImmersiveAuthCta>
      </Box>
    </ImmersiveAuthShell>
  );
}
