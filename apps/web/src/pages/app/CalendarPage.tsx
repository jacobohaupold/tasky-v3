import { Calendar } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CalendarPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Calendar className="h-6 w-6 text-muted" />
        <h1 className="text-2xl font-bold text-text font-[var(--font-heading)]">
          Calendario
        </h1>
      </div>
      <EmptyState
        icon={<Calendar className="h-10 w-10" />}
        title="Vista de calendario"
        description="El calendario completo llegará en un próximo prompt con soporte para eventos, RRULE y arrastrar y soltar."
      />
    </div>
  );
}
