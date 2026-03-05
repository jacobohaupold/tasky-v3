import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/cn";
import {
  AuthLayout,
  InputField,
  AuthButton,
  Divider,
} from "./AuthLayout";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

// ── Password strength ──────────────────────────────────────────────────────
function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "", color: "bg-gray-200" },
    { label: "Muy débil", color: "bg-red-500" },
    { label: "Débil", color: "bg-orange-500" },
    { label: "Regular", color: "bg-yellow-500" },
    { label: "Fuerte", color: "bg-green-500" },
    { label: "Muy fuerte", color: "bg-emerald-500" },
  ];

  return { score, ...levels[score] };
}

function PasswordStrengthMeter({ password }: { password: string }) {
  const { score, label, color } = getPasswordStrength(password);
  if (!password) return null;

  return (
    <div className="space-y-1.5 mt-1">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              i < score ? color : "bg-gray-200"
            )}
          />
        ))}
      </div>
      {label && (
        <p className="text-xs text-gray-500">
          Fortaleza: <span className="font-medium">{label}</span>
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "El nombre es obligatorio";
    if (!email.trim()) errs.email = "El email es obligatorio";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Email no válido";
    if (!password) errs.password = "La contraseña es obligatoria";
    else if (password.length < 8) errs.password = "Mínimo 8 caracteres";
    else if (getPasswordStrength(password).score < 2)
      errs.password = "La contraseña es demasiado débil";
    if (password !== confirmPassword)
      errs.confirmPassword = "Las contraseñas no coinciden";
    if (!acceptTerms)
      errs.terms = "Debes aceptar los términos y condiciones";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);

    const { error } = await signUp(email, password, name);
    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("Este email ya está registrado. ¿Quieres iniciar sesión?");
      } else {
        toast.error(error.message);
      }
    } else {
      navigate("/verify-email", { state: { email } });
      toast.success("¡Cuenta creada! Revisa tu email para verificarla.");
    }

    setIsLoading(false);
  };

  const handleGoogleSignup = async () => {
    if (!acceptTerms) {
      toast.error("Debes aceptar los términos y condiciones para continuar");
      return;
    }
    setIsGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error("Error al conectar con Google: " + error.message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Empieza a organizar tu vida con Tasky"
    >
      {/* Google */}
      <AuthButton
        variant="outline"
        icon={<GoogleIcon />}
        onClick={handleGoogleSignup}
        loading={isGoogleLoading}
        type="button"
        className="mb-4"
      >
        Registrarse con Google
      </AuthButton>

      <Divider />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <InputField
          label="Nombre completo"
          type="text"
          autoComplete="name"
          placeholder="Ana García"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          icon={<User className="h-4 w-4" />}
        />

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

        {/* Password with strength meter */}
        <div className="space-y-1.5">
          <InputField
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
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
          <PasswordStrengthMeter password={password} />
        </div>

        <InputField
          label="Confirmar contraseña"
          type={showConfirm ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Repite tu contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          icon={<Lock className="h-4 w-4" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showConfirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
        />

        {/* Terms */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-600">
              Acepto los{" "}
              <a
                href="#"
                className="text-brand-600 hover:text-brand-700 font-medium"
              >
                Términos de Servicio
              </a>{" "}
              y la{" "}
              <a
                href="#"
                className="text-brand-600 hover:text-brand-700 font-medium"
              >
                Política de Privacidad
              </a>
            </span>
          </label>
          {errors.terms && (
            <p className="mt-1 text-xs text-red-500">{errors.terms}</p>
          )}
        </div>

        <AuthButton type="submit" loading={isLoading}>
          Crear cuenta
        </AuthButton>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        ¿Ya tienes cuenta?{" "}
        <Link
          to="/login"
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
