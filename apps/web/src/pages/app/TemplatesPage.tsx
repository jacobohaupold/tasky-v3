import { LayoutTemplate } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export default function TemplatesPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <LayoutTemplate className="h-6 w-6 text-muted" />
        <h1 className="text-2xl font-bold text-text font-[var(--font-heading)]">Templates</h1>
      </div>
      <EmptyState
        icon={<LayoutTemplate className="h-10 w-10" />}
        title="Galería de templates"
        description="Los templates de la comunidad y del marketplace llegarán en un próximo prompt."
      />
    </div>
  );
}
