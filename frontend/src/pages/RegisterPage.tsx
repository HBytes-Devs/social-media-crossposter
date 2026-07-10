import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AuthShell } from "../components/ui/AuthShell";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useUiLanguage } from "../i18n/UiLanguageProvider";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { registerUser, selectAuth } from "../store/slices/authSlice";

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
    <AuthShell
      title={t("auth.register.title")}
      subtitle={t("auth.register.subtitle")}
      footer={
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {t("auth.haveAccount")}{" "}
          <Link component={RouterLink} to="/login" underline="hover">
            {t("auth.login")}
          </Link>
        </Typography>
      }
    >
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
        <Input
          label={t("auth.nameOptional")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
        <Input
          label={t("auth.email")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          label={t("auth.password")}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />

        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}

        <Button type="submit" className="w-full" loading={authLoading}>
          {t("auth.register")}
        </Button>
      </Stack>
    </AuthShell>
  );
}
