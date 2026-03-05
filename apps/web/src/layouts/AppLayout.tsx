import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Database,
  Settings,
  LogOut,
  Bell,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/cn";
import toast from "react-hot-toast";

const navItems = [
  { to: "/app", icon: LayoutDashboard, label: "Inicio", end: true },
  { to: "/app/pages", icon: FileText, label: "Páginas" },
  { to: "/app/calendar", icon: Calendar, label: "Calendario" },
  { to: "/app/databases", icon: Database, label: "Bases de datos" },
  { to: "/app/settings", icon: Settings, label: "Ajustes" },
];

export default function AppLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Sesión cerrada");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen bg-surface-base overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-gray-200/60 bg-surface-raised">
        {/* Logo */}
        <div className="flex h-14 items-center gap-2.5 px-4 border-b border-gray-200/60">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 11.5L11 13.5L15 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="3" y="3" width="18" height="18" rx="4" stroke="white" strokeWidth="2" />
            </svg>
          </div>
          <span className="font-bold text-brand-600">Tasky</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-gray-200/60 p-3 space-y-1">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-sm font-semibold flex-shrink-0">
              {profile?.display_name?.charAt(0).toUpperCase() ??
                profile?.email?.charAt(0).toUpperCase() ??
                "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.display_name ?? "Usuario"}
              </p>
              <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600 p-1">
              <Bell className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

// ── Placeholder page ─────────────────────────────────────────────────────────
export function AppHomePage() {
  const { profile } = useAuth();
  return (
    <div className="flex h-full items-center justify-center text-center p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          ¡Hola, {profile?.display_name?.split(" ")[0] ?? "amigo"}! 👋
        </h1>
        <p className="text-gray-500">
          Tu workspace personal está listo. Las páginas llegarán en el siguiente
          prompt.
        </p>
      </div>
    </div>
  );
}
