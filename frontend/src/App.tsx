import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthBootstrap } from "./components/AuthBootstrap";
import { ProfessionalAuthLayout } from "./components/auth/ProfessionalAuthLayout";
import { Layout } from "./components/Layout";
import { OpsLayout } from "./components/OpsLayout";
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
import { AdminPage } from "./pages/AdminPage";
import { LoginPage } from "./pages/LoginPage";
import { PostsPage } from "./pages/PostsPage";
import { ComingSoonPage } from "./pages/ComingSoonPage";
import { WorkingOnItPage } from "./pages/WorkingOnItPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { OpsOverviewPage } from "./pages/ops/OpsOverviewPage";
import { OpsUsersPage } from "./pages/ops/OpsUsersPage";
import { OpsSubscriptionsPage } from "./pages/ops/OpsSubscriptionsPage";
import { OpsEarningsPage } from "./pages/ops/OpsEarningsPage";
import { OpsUsagePage } from "./pages/ops/OpsUsagePage";
import { OpsPostsPage } from "./pages/ops/OpsPostsPage";
import { OpsErrorsPage } from "./pages/ops/OpsErrorsPage";
import { OpsIssuesPage } from "./pages/ops/OpsIssuesPage";
import { OpsAccessPage } from "./pages/ops/OpsAccessPage";
import { useAppSelector } from "./store/hooks";
import { selectAuth } from "./store/slices/authSlice";

function PublicOnly() {
  const { token, loading, user } = useAppSelector(selectAuth);

  if (loading) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (token) {
    if (user?.role === "SUPER_ADMIN") {
      return <Navigate to="/ops" replace />;
    }
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

function ProductShell() {
  const { user, loading } = useAppSelector(selectAuth);

  if (loading) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (user?.role === "SUPER_ADMIN") {
    return <Navigate to="/ops" replace />;
  }

  return <Layout />;
}

function HomePage() {
  const { user } = useAppSelector(selectAuth);
  if (user?.role === "SUPER_ADMIN") {
    return <Navigate to="/ops" replace />;
  }
  return <DashboardPage />;
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
            <Route element={<ProfessionalAuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/ops" element={<OpsLayout />}>
              <Route index element={<OpsOverviewPage />} />
              <Route path="users" element={<OpsUsersPage />} />
              <Route path="subscriptions" element={<OpsSubscriptionsPage />} />
              <Route path="earnings" element={<OpsEarningsPage />} />
              <Route path="usage" element={<OpsUsagePage />} />
              <Route path="posts" element={<OpsPostsPage />} />
              <Route path="errors" element={<OpsErrorsPage />} />
              <Route path="issues" element={<OpsIssuesPage />} />
              <Route path="access" element={<OpsAccessPage />} />
            </Route>

            <Route element={<ProductShell />}>
              <Route index element={<HomePage />} />
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
              <Route path="admin" element={<AdminPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthBootstrap>
    </BrowserRouter>
  );
}
