import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card, CardHeader, CardBody, CardFooter, CardTitle } from "@/components/ui/Card";
import { Chip, StatusChip } from "@/components/ui/Chip";
import { Toggle } from "@/components/ui/Toggle";
import { Avatar, AvatarGroup } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/Dropdown";
import { Tooltip } from "@/components/ui/Tooltip";
import { SimpleSelect } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { CommandPalette, useCommandPalette } from "@/components/ui/CommandPalette";
import { toast } from "@/components/ui/Toast";
import {
  Plus, Trash2, Settings, Download, Copy, Star,
  FileText, Inbox, Search, Bell,
} from "lucide-react";

// ── Section wrapper ────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="mb-6 text-lg font-semibold text-text font-[var(--font-heading)] border-b border-border pb-3">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {label && <span className="text-xs text-muted w-28 flex-shrink-0">{label}</span>}
      {children}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [toggle1, setToggle1] = useState(false);
  const [toggle2, setToggle2] = useState(true);
  const [selectVal, setSelectVal] = useState("");
  const cmd = useCommandPalette();

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-surface-1/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text font-[var(--font-heading)]">
              Tasky Design System
            </h1>
            <p className="text-sm text-muted mt-0.5">Component showcase · v1.0</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={<Search className="h-4 w-4" />}
            onClick={cmd.setOpen.bind(null, true)}
          >
            Cmd+K
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* ── Colors ─────────────────────────────────────────────────────── */}
        <Section title="Colors">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: "bg",        var: "--color-bg" },
              { name: "surface-1", var: "--color-surface-1" },
              { name: "surface-2", var: "--color-surface-2" },
              { name: "border",    var: "--color-border" },
              { name: "text",      var: "--color-text" },
              { name: "muted",     var: "--color-muted" },
              { name: "accent",    var: "--color-accent" },
              { name: "accent-lime",var: "--color-accent-lime" },
            ].map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <span
                  className="h-8 w-8 rounded-[var(--radius-sm)] border border-border flex-shrink-0"
                  style={{ background: `var(${c.var})` }}
                />
                <span className="text-xs text-muted font-mono">{c.name}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Typography ─────────────────────────────────────────────────── */}
        <Section title="Typography">
          <p className="text-3xl font-bold font-[var(--font-heading)] text-text">Space Grotesk — Heading</p>
          <p className="text-base font-[var(--font-body)] text-text">Inter — Body text, regular weight, 16px</p>
          <p className="text-sm text-muted">Muted text — descriptions, labels, hints</p>
          <code className="text-sm font-[var(--font-mono)] bg-surface-2 px-2 py-1 rounded text-accent">
            JetBrains Mono — code
          </code>
        </Section>

        {/* ── Buttons ────────────────────────────────────────────────────── */}
        <Section title="Button">
          <Row label="Variants">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="icon" icon={<Plus className="h-4 w-4" />} aria-label="Add" />
          </Row>
          <Row label="Sizes">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </Row>
          <Row label="States">
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
            <Button icon={<Plus className="h-4 w-4" />}>With icon</Button>
            <Button icon={<Download className="h-4 w-4" />} iconPosition="right">Icon right</Button>
          </Row>
        </Section>

        {/* ── Input ──────────────────────────────────────────────────────── */}
        <Section title="Input & Textarea">
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
            <Input placeholder="Default input" />
            <Input placeholder="With label" label="Email" type="email" />
            <Input placeholder="Search…" type="search" />
            <Input placeholder="Password" type="password" label="Password" />
            <Input placeholder="Error state" error="Campo requerido" />
            <Input placeholder="Disabled" disabled />
          </div>
          <div className="max-w-lg">
            <Textarea placeholder="Textarea…" label="Descripción" rows={3} />
          </div>
        </Section>

        {/* ── Card ───────────────────────────────────────────────────────── */}
        <Section title="Card">
          <div className="grid sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader><CardTitle>Default card</CardTitle></CardHeader>
              <CardBody><p className="text-sm text-muted">Content goes here.</p></CardBody>
              <CardFooter><Button size="sm">Action</Button></CardFooter>
            </Card>
            <Card variant="tinted">
              <CardHeader><CardTitle>Tinted</CardTitle></CardHeader>
              <CardBody><p className="text-sm text-muted">Surface-2 background.</p></CardBody>
            </Card>
            <Card variant="interactive">
              <CardHeader><CardTitle>Interactive</CardTitle></CardHeader>
              <CardBody><p className="text-sm text-muted">Hover to see effect.</p></CardBody>
            </Card>
          </div>
        </Section>

        {/* ── Chip ───────────────────────────────────────────────────────── */}
        <Section title="Chip">
          <Row label="Variants">
            <Chip>Default</Chip>
            <Chip variant="active">Active</Chip>
            <Chip variant="success">Success</Chip>
            <Chip variant="warning">Warning</Chip>
            <Chip variant="error">Error</Chip>
            <Chip variant="info">Info</Chip>
          </Row>
          <Row label="Status">
            <StatusChip status="todo" />
            <StatusChip status="progress" />
            <StatusChip status="review" />
            <StatusChip status="done" />
            <StatusChip status="cancelled" />
          </Row>
          <Row label="Removable">
            <Chip onRemove={() => {}}>Removable</Chip>
            <Chip variant="info" icon={<Star className="h-3 w-3" />} onRemove={() => {}}>
              With icon
            </Chip>
          </Row>
        </Section>

        {/* ── Toggle ─────────────────────────────────────────────────────── */}
        <Section title="Toggle">
          <Toggle
            checked={toggle1}
            onChange={setToggle1}
            label="Notificaciones"
            description="Recibe alertas por email"
          />
          <Toggle
            checked={toggle2}
            onChange={setToggle2}
            label="Modo oscuro"
          />
          <Toggle checked={false} onChange={() => {}} label="Desactivado" disabled />
        </Section>

        {/* ── Avatar ─────────────────────────────────────────────────────── */}
        <Section title="Avatar">
          <Row label="Sizes">
            <Avatar name="Ana García" size="xs" />
            <Avatar name="Carlos López" size="sm" />
            <Avatar name="María Rodríguez" size="md" />
            <Avatar name="Pedro Sánchez" size="lg" />
          </Row>
          <Row label="With presence">
            <Avatar name="Online User" presence="online" />
            <Avatar name="Away User" presence="away" />
            <Avatar name="Busy User" presence="busy" />
            <Avatar name="Offline User" presence="offline" />
          </Row>
          <Row label="Group">
            <AvatarGroup
              avatars={[
                { name: "Ana García" },
                { name: "Carlos López" },
                { name: "María Rodríguez" },
                { name: "Pedro Sánchez" },
                { name: "Laura Martínez" },
              ]}
              max={4}
            />
          </Row>
        </Section>

        {/* ── Skeleton ───────────────────────────────────────────────────── */}
        <Section title="Skeleton">
          <Row label="Variants">
            <Skeleton variant="text" width={200} />
            <Skeleton variant="circle" width={40} height={40} />
            <Skeleton variant="rect" width={100} height={60} />
          </Row>
          <Skeleton variant="card" width="100%" height={120} className="max-w-sm" />
        </Section>

        {/* ── Modal ──────────────────────────────────────────────────────── */}
        <Section title="Modal">
          <Row>
            <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          </Row>
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Ejemplo de modal"
            description="Este es un modal del design system de Tasky."
            footer={
              <>
                <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
                <Button onClick={() => setModalOpen(false)}>Confirmar</Button>
              </>
            }
          >
            <p className="text-sm text-muted leading-relaxed">
              Los modales soportan variantes <strong>modal</strong> y <strong>sheet</strong>,
              distintos tamaños (sm/md/lg/xl/full), footer personalizado, y se cierran
              con Escape o click en el backdrop.
            </p>
          </Modal>
        </Section>

        {/* ── Dropdown ───────────────────────────────────────────────────── */}
        <Section title="Dropdown">
          <Row>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" icon={<Settings className="h-4 w-4" />}>
                  Opciones
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem icon={<Copy className="h-4 w-4" />} shortcut="⌘C">
                  Copiar
                </DropdownMenuItem>
                <DropdownMenuItem icon={<Download className="h-4 w-4" />}>
                  Descargar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem icon={<Trash2 className="h-4 w-4" />} destructive>
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Row>
        </Section>

        {/* ── Tooltip ────────────────────────────────────────────────────── */}
        <Section title="Tooltip">
          <Row>
            <Tooltip content="Tooltip por defecto">
              <Button variant="secondary">Hover me</Button>
            </Tooltip>
            <Tooltip content="Con atajo de teclado" shortcut="⌘K">
              <Button variant="ghost" icon={<Bell className="h-4 w-4" />}>
                Con shortcut
              </Button>
            </Tooltip>
          </Row>
        </Section>

        {/* ── Select ─────────────────────────────────────────────────────── */}
        <Section title="Select">
          <div className="max-w-xs">
            <SimpleSelect
              value={selectVal}
              onValueChange={setSelectVal}
              label="Rol del usuario"
              placeholder="Selecciona un rol…"
              options={[
                { value: "admin",  label: "Admin",  description: "Acceso completo" },
                { value: "staff",  label: "Staff",  description: "Acceso limitado" },
                { value: "viewer", label: "Viewer", description: "Solo lectura", disabled: true },
              ]}
            />
          </div>
        </Section>

        {/* ── Empty State ────────────────────────────────────────────────── */}
        <Section title="Empty State">
          <EmptyState
            icon={<Inbox className="h-10 w-10" />}
            title="No hay elementos"
            description="Crea tu primer elemento para empezar a trabajar."
            action={{ label: "Crear elemento", onClick: () => {} }}
            secondaryAction={{ label: "Ver tutorial", onClick: () => {} }}
          />
        </Section>

        {/* ── Toast ──────────────────────────────────────────────────────── */}
        <Section title="Toast">
          <Row>
            <Button
              variant="secondary"
              onClick={() => toast.success("Operación completada con éxito")}
            >
              Success
            </Button>
            <Button
              variant="danger"
              onClick={() => toast.error("Ha ocurrido un error inesperado")}
            >
              Error
            </Button>
            <Button
              variant="ghost"
              onClick={() => toast.info("Nueva actualización disponible")}
            >
              Info
            </Button>
            <Button
              variant="ghost"
              onClick={() => toast.warning("Acción irreversible, procede con cuidado")}
            >
              Warning
            </Button>
          </Row>
        </Section>

        {/* ── Command Palette ────────────────────────────────────────────── */}
        <Section title="Command Palette">
          <Row>
            <Button
              variant="secondary"
              icon={<Search className="h-4 w-4" />}
              onClick={() => cmd.setOpen(true)}
            >
              Abrir paleta (Cmd+K)
            </Button>
          </Row>
          <CommandPalette
            open={cmd.open}
            onClose={cmd.close}
            items={[
              {
                id: "ds-home",
                label: "Design System",
                description: "Ver todos los componentes",
                group: "pages",
                icon: <FileText className="h-4 w-4" />,
                onSelect: () => {},
              },
              {
                id: "ds-toast",
                label: "Mostrar toast",
                description: "Dispara una notificación",
                group: "actions",
                icon: <Bell className="h-4 w-4" />,
                shortcut: "T",
                onSelect: () => toast.info("Toast desde Command Palette"),
              },
            ]}
          />
        </Section>

      </main>
    </div>
  );
}
