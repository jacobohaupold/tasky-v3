import { useState } from "react";
import { Settings, User, Bell, Shield, Palette } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { cn } from "@/lib/cn";
import { useAuth } from "@/providers/AuthProvider";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { Avatar } from "@/components/ui/Avatar";
import { useDarkMode } from "@/hooks/useDarkMode";
import { toast } from "@/components/ui/Toast";

const sections = [
  { to: "/app/settings", label: "Perfil", icon: User, end: true },
  { to: "/app/settings/notifications", label: "Notificaciones", icon: Bell },
  { to: "/app/settings/security", label: "Seguridad", icon: Shield },
  { to: "/app/settings/appearance", label: "Apariencia", icon: Palette },
];

function SettingsNav() {
  return (
    <nav className="flex flex-col gap-0.5 w-48 flex-shrink-0">
      <p className="text-xs font-semibold text-muted uppercase tracking-wider px-3 mb-2">
        Ajustes
      </p>
      {sections.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-accent/10 text-accent font-medium"
                : "text-muted hover:bg-surface-2 hover:text-text"
            )
          }
        >
          <Icon className="h-4 w-4 stroke-[1.5]" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

// ── Profile settings ──────────────────────────────────────────────────────────
function ProfileSettings() {
  const { profile, updateProfile } = useAuth();
  const [name, setName] = useState(profile?.display_name ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile({ display_name: name });
    setSaving(false);
    if (error) toast.error("Error al guardar");
    else toast.success("Perfil actualizado");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text font-[var(--font-heading)] mb-4">
          Mi perfil
        </h2>
        <div className="flex items-center gap-4 mb-6">
          <Avatar
            name={profile?.display_name ?? profile?.email ?? "?"}
            src={profile?.avatar_url ?? undefined}
            size="lg"
          />
          <div>
            <p className="text-sm font-medium text-text">{profile?.display_name}</p>
            <p className="text-xs text-muted">{profile?.email}</p>
          </div>
        </div>
        <div className="max-w-sm space-y-4">
          <Input
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Email"
            value={profile?.email ?? ""}
            disabled
            type="email"
          />
          <Button onClick={() => void handleSave()} loading={saving}>
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Appearance settings ───────────────────────────────────────────────────────
function AppearanceSettings() {
  const { isDark, toggle } = useDarkMode();

  return (
    <div>
      <h2 className="text-xl font-semibold text-text font-[var(--font-heading)] mb-4">
        Apariencia
      </h2>
      <div className="space-y-4 max-w-sm">
        <Toggle
          checked={isDark}
          onChange={toggle}
          label="Modo oscuro"
          description="Activa el tema oscuro en la aplicación"
        />
      </div>
    </div>
  );
}

// ── Notifications settings ────────────────────────────────────────────────────
function NotificationsSettings() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [mentions, setMentions] = useState(true);

  return (
    <div>
      <h2 className="text-xl font-semibold text-text font-[var(--font-heading)] mb-4">
        Notificaciones
      </h2>
      <div className="space-y-4 max-w-sm">
        <Toggle
          checked={emailNotifs}
          onChange={setEmailNotifs}
          label="Notificaciones por email"
          description="Recibe resúmenes por correo electrónico"
        />
        <Toggle
          checked={mentions}
          onChange={setMentions}
          label="Menciones"
          description="Notificaciones cuando te mencionan"
        />
      </div>
    </div>
  );
}

// ── Security settings ─────────────────────────────────────────────────────────
function SecuritySettings() {
  const navigate = useNavigate();
  return (
    <div>
      <h2 className="text-xl font-semibold text-text font-[var(--font-heading)] mb-4">
        Seguridad
      </h2>
      <div className="space-y-3 max-w-sm">
        <Button
          variant="secondary"
          onClick={() => navigate("/forgot-password")}
        >
          Cambiar contraseña
        </Button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="h-6 w-6 text-muted" />
        <h1 className="text-2xl font-bold text-text font-[var(--font-heading)]">Ajustes</h1>
      </div>

      <div className="flex gap-10">
        <SettingsNav />
        <div className="flex-1 min-w-0">
          <Outlet context={{ ProfileSettings, AppearanceSettings, NotificationsSettings, SecuritySettings }} />
        </div>
      </div>
    </div>
  );
}

// Sub-pages
export { ProfileSettings, AppearanceSettings, NotificationsSettings, SecuritySettings };
