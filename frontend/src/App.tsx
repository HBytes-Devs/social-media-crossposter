import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthBootstrap } from "./components/AuthBootstrap";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AccountsPage } from "./pages/AccountsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { CalendarPage } from "./pages/CalendarPage";
import { ComposePage } from "./pages/ComposePage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { PostsPage } from "./pages/PostsPage";
import { ComingSoonPage } from "./pages/ComingSoonPage";
import { WorkingOnItPage } from "./pages/WorkingOnItPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { useAppSelector } from "./store/hooks";
import { selectAuth } from "./store/slices/authSlice";

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAppSelector(selectAuth);

  if (loading) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (token) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthBootstrap>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicOnly>
                <LoginPage />
              </PublicOnly>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnly>
                <RegisterPage />
              </PublicOnly>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicOnly>
                <ForgotPasswordPage />
              </PublicOnly>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicOnly>
                <ResetPasswordPage />
              </PublicOnly>
            }
          />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="compose" element={<ComposePage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="posts" element={<PostsPage />} />
              <Route path="posts/:tab" element={<PostsPage />} />
              <Route path="coming-soon" element={<ComingSoonPage />} />
              <Route path="working-on-it" element={<WorkingOnItPage />} />
              <Route path="accounts" element={<AccountsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthBootstrap>
    </BrowserRouter>
  );
}
