import { Navigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

/**
 * Requires admin or staff role.
 * No session → /login. Regular user → /app.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isStaff, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin && !isStaff) return <Navigate to="/app" replace />;

  return <>{children}</>;
}
