import { Navigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

/**
 * Prevents authenticated users from viewing auth pages.
 * Has session → redirect to /app.
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (user) return <Navigate to="/app" replace />;

  return <>{children}</>;
}
