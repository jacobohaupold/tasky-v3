import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { AuthLayout, InputField, AuthButton } from "./AuthLayout";

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const errs: typeof errors = {};
    if (!password) errs.password = "La contraseña es obligatoria";
    else if (password.length < 8) errs.password = "Mínimo 8 caracteres";
    if (password !== confirmPassword)
      errs.confirmPassword = "Las contraseñas no coinciden";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error(
        error.message.includes("same password")
          ? "La nueva contraseña debe ser diferente a la anterior"
          : error.message
      );
    } else {
      setDone(true);
      toast.success("Contraseña actualizada correctamente");
    }

    setIsLoading(false);
  };

  if (done) {
    return (
      <AuthLayout title="Contraseña actualizada" subtitle="Todo listo para iniciar sesión">
        <div className="text-center space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-sm text-gray-600">
            Tu contraseña se ha actualizado correctamente. Ya puedes iniciar
            sesión con tu nueva contraseña.
          </p>
          <AuthButton
            type="button"
            onClick={() => navigate("/login", { replace: true })}
          >
            Ir al inicio de sesión
          </AuthButton>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Nueva contraseña"
      subtitle="Elige una contraseña segura para tu cuenta"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <InputField
          label="Nueva contraseña"
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

        <InputField
          label="Confirmar nueva contraseña"
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

        <AuthButton type="submit" loading={isLoading}>
          Actualizar contraseña
        </AuthButton>
      </form>
    </AuthLayout>
  );
}
