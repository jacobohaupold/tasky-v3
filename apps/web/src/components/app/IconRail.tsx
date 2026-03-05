import { NavLink, useNavigate } from "react-router-dom";
import {
  House, Search, Bell, LayoutTemplate, Calendar, Settings,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Tooltip } from "@/components/ui/Tooltip";
import { Avatar } from "@/components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/Dropdown";
import { useAuth } from "@/providers/AuthProvider";
import { useDarkMode } from "@/hooks/useDarkMode";
import { toast } from "@/components/ui/Toast";

interface IconRailProps {
  onSearchOpen: () => void;
  unreadCount?: number;
}

interface RailItemProps {
  to?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  end?: boolean;
}

function RailItem({ to, onClick, icon, label, badge, end }: RailItemProps) {
  const base =
    "relative flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50";

  const content = (
    <>
      {icon}
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </>
  );

  if (to) {
    return (
      <Tooltip content={label} side="right">
        <NavLink
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(base, isActive ? "bg-accent text-white" : "text-muted hover:bg-surface-2 hover:text-text")
          }
        >
          {content}
        </NavLink>
      </Tooltip>
    );
  }

  return (
    <Tooltip content={label} side="right">
      <button
        onClick={onClick}
        className={cn(base, "text-muted hover:bg-surface-2 hover:text-text")}
      >
        {content}
      </button>
    </Tooltip>
  );
}

export function IconRail({ onSearchOpen, unreadCount = 0 }: IconRailProps) {
  const { profile, isAdmin, signOut } = useAuth();
  const { toggle: toggleDark } = useDarkMode();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Sesión cerrada");
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className="flex h-full w-[60px] flex-shrink-0 flex-col items-center border-r border-border bg-surface-1 py-3 gap-1"
      aria-label="Rail de navegación"
    >
      {/* Logo */}
      <NavLink
        to="/app"
        className="mb-2 flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-accent text-white hover:bg-accent-hover transition-colors"
        aria-label="Inicio"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 11.5L11 13.5L15 9.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="3" y="3" width="18" height="18" rx="4"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </NavLink>

      {/* Main nav */}
      <RailItem to="/app" end icon={<House className="h-5 w-5 stroke-[1.5]" />} label="Inicio" />
      <RailItem
        onClick={onSearchOpen}
        icon={<Search className="h-5 w-5 stroke-[1.5]" />}
        label="Buscar (Cmd+K)"
      />
      <RailItem
        to="/app/notifications"
        icon={<Bell className="h-5 w-5 stroke-[1.5]" />}
        label="Notificaciones"
        badge={unreadCount}
      />
      <RailItem
        to="/app/templates"
        icon={<LayoutTemplate className="h-5 w-5 stroke-[1.5]" />}
        label="Templates"
      />
      <RailItem
        to="/app/calendar"
        icon={<Calendar className="h-5 w-5 stroke-[1.5]" />}
        label="Calendario"
      />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Separator */}
      <div className="h-px w-8 bg-border my-1" />

      <RailItem
        to="/app/settings"
        icon={<Settings className="h-5 w-5 stroke-[1.5]" />}
        label="Ajustes"
      />

      {/* User avatar dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
            <Avatar
              name={profile?.display_name ?? profile?.email ?? "?"}
              src={profile?.avatar_url ?? undefined}
              size="sm"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="end" className="w-52">
          <DropdownMenuLabel>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-text">
                {profile?.display_name ?? "Usuario"}
              </span>
              <span className="text-xs text-muted font-normal">{profile?.email}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/app/settings/profile")}>
            Mi perfil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/app/settings")}>
            Ajustes
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleDark}>
            Cambiar tema
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem onClick={() => navigate("/admin")}>
              Panel de admin
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onClick={() => void handleSignOut()}>
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </aside>
  );
}
