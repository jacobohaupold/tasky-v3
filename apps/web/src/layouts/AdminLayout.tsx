import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Users, BarChart2, Settings, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/cn";
import toast from "react-hot-toast";

const navItems = [
  { to: "/admin", icon: BarChart2, label: "Dashboard", end: true },
  { to: "/admin/users", icon: Users, label: "Usuarios" },
  { to: "/admin/settings", icon: Settings, label: "Configuración" },
];

export default function AdminLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Sesión cerrada");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen bg-surface-base overflow-hidden">
      {/* Admin Sidebar */}
      <aside className="flex w-60 flex-col border-r border-gray-200/60 bg-gray-900">
        <div className="flex h-14 items-center gap-2.5 px-4 border-b border-gray-700/60">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-sm">Tasky Admin</span>
          </div>
        </div>

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
                    ? "bg-gray-700 text-white font-medium"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )
              }
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-700/60 p-3 space-y-1">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white text-sm font-semibold flex-shrink-0">
              {profile?.display_name?.charAt(0).toUpperCase() ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profile?.display_name ?? "Admin"}
              </p>
              <p className="text-xs text-gray-400 truncate capitalize">
                {profile?.role}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-red-900/40 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

// ── Placeholder page ─────────────────────────────────────────────────────────
export function AdminHomePage() {
  const { profile } = useAuth();
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="text-gray-500 mt-1">
          Bienvenido, {profile?.display_name}. Rol: {profile?.role}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {["Usuarios", "Workspaces", "Templates"].map((label) => (
          <div
            key={label}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">—</p>
            <p className="text-xs text-gray-400 mt-1">Módulo en desarrollo</p>
          </div>
        ))}
      </div>
    </div>
  );
}
