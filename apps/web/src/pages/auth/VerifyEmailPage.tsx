import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { AuthLayout, AuthButton } from "./AuthLayout";

export default function VerifyEmailPage() {
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? "";
  const [isResending, setIsResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);

  const handleResend = async () => {
    if (!email) {
      toast.error("No se encontró el email. Por favor regístrate de nuevo.");
      return;
    }
    if (resendCount >= 3) {
      toast.error("Has alcanzado el límite de reenvíos. Espera un momento.");
      return;
    }

    setIsResending(true);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      setResendCount((c) => c + 1);
      toast.success("Email de verificación reenviado");
    }

    setIsResending(false);
  };

  return (
    <AuthLayout
      title="Verifica tu email"
      subtitle={
        email
          ? `Hemos enviado un email de verificación a ${email}`
          : "Revisa tu email para verificar tu cuenta"
      }
    >
      <div className="text-center space-y-6">
        {/* Animated icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 border-4 border-brand-100">
          <Mail className="h-10 w-10 text-brand-600" />
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Haz clic en el enlace de verificación que te hemos enviado para
            activar tu cuenta. Si no lo ves,{" "}
            <strong>revisa la carpeta de spam</strong>.
          </p>

          <div className="rounded-lg bg-surface-sunken border border-gray-100 p-4 text-left space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Pasos a seguir
            </p>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Abre tu bandeja de entrada</li>
              <li>Busca un email de Tasky</li>
              <li>Haz clic en "Verificar email"</li>
              <li>Serás redirigido automáticamente</li>
            </ol>
          </div>
        </div>

        {/* Resend */}
        <div className="space-y-3">
          <AuthButton
            variant="outline"
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={handleResend}
            loading={isResending}
            type="button"
          >
            {isResending ? "Reenviando..." : "Reenviar email de verificación"}
          </AuthButton>

          {resendCount > 0 && (
            <p className="text-xs text-gray-400">
              Email reenviado {resendCount} {resendCount === 1 ? "vez" : "veces"}
            </p>
          )}
        </div>

        <Link
          to="/login"
          className="inline-block text-sm text-gray-500 hover:text-gray-700"
        >
          ← Volver al inicio de sesión
        </Link>
      </div>
    </AuthLayout>
  );
}
