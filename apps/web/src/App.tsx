import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { AdminGuard } from "@/components/guards/AdminGuard";
import { GuestGuard } from "@/components/guards/GuestGuard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Auth pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";
import AuthCallbackPage from "@/pages/auth/AuthCallbackPage";
import DesignSystemPage from "@/pages/DesignSystemPage";

// Layouts
import AppLayout from "@/layouts/AppLayout";
import AdminLayout, { AdminHomePage } from "@/layouts/AdminLayout";

// App pages
import HomePage from "@/pages/app/HomePage";
import PageEditorPage from "@/pages/app/PageEditorPage";
import CalendarPage from "@/pages/app/CalendarPage";
import TrashPage from "@/pages/app/TrashPage";
import NotificationsPage from "@/pages/app/NotificationsPage";
import SettingsPage, {
  ProfileSettings,
  AppearanceSettings,
  NotificationsSettings,
  SecuritySettings,
} from "@/pages/app/SettingsPage";
import SearchPage from "@/pages/app/SearchPage";
import TemplatesPage from "@/pages/app/TemplatesPage";

// ── Root redirect: role-aware ────────────────────────────────────────────────
function RootRedirect() {
  const { user, profile, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.role === "admin" || profile?.role === "staff") {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/app" replace />;
}

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      {/* Root — smart redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* ── Auth routes (guests only) ── */}
      <Route path="/login" element={<GuestGuard><LoginPage /></GuestGuard>} />
      <Route path="/register" element={<GuestGuard><RegisterPage /></GuestGuard>} />
      <Route path="/forgot-password" element={<GuestGuard><ForgotPasswordPage /></GuestGuard>} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* ── App routes (auth required) ── */}
      <Route
        path="/app"
        element={<AuthGuard><AppLayout /></AuthGuard>}
      >
        <Route index element={<HomePage />} />
        <Route path="page/:id" element={<PageEditorPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="trash" element={<TrashPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="settings" element={<SettingsPage />}>
          <Route index element={<ProfileSettings />} />
          <Route path="profile" element={<ProfileSettings />} />
          <Route path="appearance" element={<AppearanceSettings />} />
          <Route path="notifications" element={<NotificationsSettings />} />
          <Route path="security" element={<SecuritySettings />} />
        </Route>
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Route>

      {/* ── Admin routes (admin/staff required) ── */}
      <Route
        path="/admin"
        element={<AdminGuard><AdminLayout /></AdminGuard>}
      >
        <Route index element={<AdminHomePage />} />
        <Route path="*" element={<AdminHomePage />} />
      </Route>

      {/* Design system showcase */}
      <Route path="/design-system" element={<DesignSystemPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
