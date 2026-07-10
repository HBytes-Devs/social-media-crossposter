import { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AuthShell } from "../components/ui/AuthShell";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useUiLanguage } from "../i18n/UiLanguageProvider";
import { api } from "../lib/api";

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
    <AuthShell
      title={t("auth.reset.title")}
      subtitle={t("auth.reset.subtitle")}
      footer={
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {t("auth.codeNotReceived")}{" "}
          <Link component={RouterLink} to="/forgot-password" underline="hover">
            {t("auth.resendCode")}
          </Link>
          {" · "}
          <Link component={RouterLink} to="/login" underline="hover">
            {t("auth.login")}
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
        <Input
          label={t("auth.resetCode")}
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          required
          autoComplete="one-time-code"
          placeholder="123456"
        />
        <Input
          label={t("auth.newPassword")}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
        <Input
          label={t("auth.confirmPassword")}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />

        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}

        <Button type="submit" className="w-full" loading={loading}>
          {t("auth.updatePassword")}
        </Button>
      </Stack>
    </AuthShell>
  );
}
