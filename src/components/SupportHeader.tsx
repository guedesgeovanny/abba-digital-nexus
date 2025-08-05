import { Button } from "@/components/ui/button";
import { Headphones, Plus, Filter } from "lucide-react";

export const SupportHeader = () => {
  return (
    <div className="border-b border-border bg-background">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Headphones className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Atendimento</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie tickets e atendimento humanizado
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Ticket
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};