import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthBootstrap } from "./components/AuthBootstrap";
import { ImmersiveAuthLayout } from "./components/auth/ImmersiveAuthLayout";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AccountsPage } from "./pages/AccountsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { CalendarPage } from "./pages/CalendarPage";
import { ComposePage } from "./pages/ComposePage";
import { DashboardPage } from "./pages/DashboardPage";
import { GoogleAdsPage } from "./pages/GoogleAdsPage";
import { LinkedInAdsPage } from "./pages/LinkedInAdsPage";
import { MetaAdsPage } from "./pages/MetaAdsPage";
import { LinkedInMarketingPage } from "./pages/LinkedInMarketingPage";
import { InstagramAnalyticsPage } from "./pages/InstagramAnalyticsPage";
import { LoginPage } from "./pages/LoginPage";
import { PostsPage } from "./pages/PostsPage";
import { ComingSoonPage } from "./pages/ComingSoonPage";
import { WorkingOnItPage } from "./pages/WorkingOnItPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { useAppSelector } from "./store/hooks";
import { selectAuth } from "./store/slices/authSlice";

function PublicOnly() {
  const { token, loading } = useAppSelector(selectAuth);

  if (loading) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (token) return <Navigate to="/" replace />;
  return <Outlet />;
}

function routerBasename(): string | undefined {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return base === "" || base === "/" ? undefined : base;
}

export default function App() {
  return (
    <BrowserRouter basename={routerBasename()}>
      <AuthBootstrap>
        <Routes>
          <Route element={<PublicOnly />}>
            <Route element={<ImmersiveAuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>
          </Route>

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
              <Route path="google-ads" element={<GoogleAdsPage />} />
              <Route path="linkedin-ads" element={<LinkedInAdsPage />} />
              <Route path="meta-ads" element={<MetaAdsPage />} />
              <Route path="linkedin-marketing" element={<LinkedInMarketingPage />} />
              <Route path="instagram" element={<InstagramAnalyticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthBootstrap>
    </BrowserRouter>
  );
}
