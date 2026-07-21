import Box from "@mui/material/Box";
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
  color: "#9fd4cf !important",
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
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

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
          <Box component="b" sx={{ fontWeight: 600, color: "rgba(245,246,248,0.95)" }}>
            SMC
          </Box>
        </>
      }
      footer={
        <Typography sx={{ textAlign: "center", fontSize: 14, color: "rgba(200,210,215,0.7)" }}>
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

        {error && (
          <Typography variant="body2" sx={{ mb: 1.5, color: "#f0a0a0" }}>
            {error}
          </Typography>
        )}

        <ImmersiveAuthCta loading={authLoading}>{t("auth.register")}</ImmersiveAuthCta>
      </Box>
    </ImmersiveAuthShell>
  );
}
