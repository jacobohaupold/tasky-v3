import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

/**
 * Handles all OAuth + magic link + password-recovery callbacks.
 *
 * With flowType: 'pkce', supabase-js detects the `code` param in the URL
 * and exchanges it for a session automatically on page load.
 * We listen to onAuthStateChange to know when it's done and where to redirect.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const handled = useRef(false);

  useEffect(() => {
    // Guard against React 19 StrictMode double-invocation
    if (handled.current) return;
    handled.current = true;

    const next = searchParams.get("next") ?? "/app";
    const errorDescription = searchParams.get("error_description");

    // OAuth provider error (e.g., user denied Google access)
    if (errorDescription) {
      toast.error(decodeURIComponent(errorDescription));
      navigate("/login", { replace: true });
      return;
    }

    // Listen for auth state — supabase-js auto-exchanges the PKCE code
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Fetch profile to determine role-based redirect
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profile?.role === "admin" || profile?.role === "staff") {
          navigate("/admin", { replace: true });
        } else {
          navigate(next, { replace: true });
        }
        return;
      }

      if (event === "PASSWORD_RECOVERY") {
        // Redirect to reset-password form (user has a temporary session)
        navigate("/reset-password", { replace: true });
        return;
      }

      if (event === "USER_UPDATED") {
        navigate("/app", { replace: true });
        return;
      }
    });

    // Fallback: if no event fires in 10 s, redirect to login
    const timeout = setTimeout(() => {
      navigate("/login?error=timeout", { replace: true });
    }, 10_000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-base">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-gray-500">Completando el inicio de sesión…</p>
    </div>
  );
}
