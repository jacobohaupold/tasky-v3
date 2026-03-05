import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/AuthProvider";
import {
  AuthLayout,
  InputField,
  AuthButton,
  Divider,
} from "./AuthLayout";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const { signIn, signInWithGoogle, signInWithMagicLink, profile } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [magicLinkMode, setMagicLinkMode] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const redirectAfterAuth = () => {
    if (profile?.role === "admin" || profile?.role === "staff") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/app", { replace: true });
    }
  };

  const validate = () => {
    const errs: typeof errors = {};
    if (!email.trim()) errs.email = "El email es obligatorio";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Email no válido";
    if (!magicLinkMode && !password) errs.password = "La contraseña es obligatoria";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);

    if (magicLinkMode) {
      const { error } = await signInWithMagicLink(email);
      if (error) {
        toast.error(error.message);
      } else {
        setMagicLinkSent(true);
        toast.success("¡Revisa tu email! Te hemos enviado un enlace mágico.");
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Email o contraseña incorrectos");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Por favor verifica tu email primero");
          navigate("/verify-email", { state: { email } });
        } else {
          toast.error(error.message);
        }
      } else {
        redirectAfterAuth();
      }
    }

    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error("Error al conectar con Google: " + error.message);
      setIsGoogleLoading(false);
    }
    // On success, Google redirects — no need to reset loading
  };

  if (magicLinkSent) {
    return (
      <AuthLayout
        title="Revisa tu email"
        subtitle={`Hemos enviado un enlace de acceso a ${email}`}
      >
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <Mail className="h-8 w-8 text-brand-600" />
          </div>
          <p className="text-sm text-gray-600">
            Haz clic en el enlace del email para iniciar sesión. El enlace caduca
            en 24 horas.
          </p>
          <button
            onClick={() => setMagicLinkSent(false)}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            ← Volver
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Bienvenido de vuelta"
      subtitle="Inicia sesión en tu cuenta de Tasky"
    >
      {/* Google OAuth */}
      <AuthButton
        variant="outline"
        icon={<GoogleIcon />}
        onClick={handleGoogleLogin}
        loading={isGoogleLoading}
        type="button"
        className="mb-4"
      >
        Continuar con Google
      </AuthButton>

      <Divider />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <InputField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          icon={<Mail className="h-4 w-4" />}
        />

        {!magicLinkMode && (
          <InputField
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            icon={<Lock className="h-4 w-4" />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
          />
        )}

        {/* Forgot password / switch mode */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setMagicLinkMode(!magicLinkMode);
              setErrors({});
            }}
            className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700"
          >
            <Zap className="h-3.5 w-3.5" />
            {magicLinkMode ? "Usar contraseña" : "Enlace mágico"}
          </button>

          {!magicLinkMode && (
            <Link
              to="/forgot-password"
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          )}
        </div>

        <AuthButton type="submit" loading={isLoading}>
          {magicLinkMode ? "Enviar enlace mágico" : "Iniciar sesión"}
        </AuthButton>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-sm text-gray-500">
        ¿No tienes cuenta?{" "}
        <Link
          to="/register"
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          Regístrate gratis
        </Link>
      </p>
    </AuthLayout>
  );
}
