import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { AuthLayout, InputField, AuthButton } from "./AuthLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("El email es obligatorio");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Introduce un email válido");
      return;
    }

    setError("");
    setIsLoading(true);

    const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        // After exchange in auth/callback, redirect to reset form
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      }
    );

    if (supabaseError) {
      toast.error(supabaseError.message);
    } else {
      setSent(true);
    }

    setIsLoading(false);
  };

  if (sent) {
    return (
      <AuthLayout
        title="Revisa tu email"
        subtitle={`Hemos enviado las instrucciones a ${email}`}
      >
        <div className="text-center space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Si existe una cuenta con ese email, recibirás un enlace para
              restablecer tu contraseña. Revisa también la carpeta de spam.
            </p>
            <p className="text-xs text-gray-400">El enlace caduca en 1 hora.</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              Reenviar email
            </button>

            <div>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="¿Olvidaste tu contraseña?"
      subtitle="Introduce tu email y te enviaremos las instrucciones para restablecerla"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <InputField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
          error={error}
          icon={<Mail className="h-4 w-4" />}
        />

        <AuthButton type="submit" loading={isLoading}>
          Enviar instrucciones
        </AuthButton>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio de sesión
        </Link>
      </div>
    </AuthLayout>
  );
}
