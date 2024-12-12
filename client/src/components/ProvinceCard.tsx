import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StakeholderForm } from "./StakeholderForm";
import type { Provincia, Stakeholder } from "@/lib/types";
import { createStakeholder, updateStakeholder, deleteStakeholder, exportProvinciaData } from "@/lib/api";

interface Props {
  provincia: Provincia;
  onUpdate: () => void;
}

export function ProvinceCard({ provincia, onUpdate }: Props) {
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateStakeholder = async (data: Omit<Stakeholder, "id">) => {
    await createStakeholder(data);
    setDialogOpen(false);
    onUpdate();
  };

  const handleUpdateStakeholder = async (data: Omit<Stakeholder, "id">) => {
    if (selectedStakeholder?.id) {
      await updateStakeholder(selectedStakeholder.id, data);
      setSelectedStakeholder(undefined);
      setDialogOpen(false);
      onUpdate();
    }
  };

  const handleDeleteStakeholder = async (id: number) => {
    await deleteStakeholder(id);
    onUpdate();
  };

  const handleExport = () => {
    exportProvinciaData(provincia.id);
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>{provincia.nombre}</CardTitle>
        <CardDescription>
          {provincia.stakeholders?.length || 0} stakeholders registrados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedStakeholder(undefined)}>
                Agregar Stakeholder
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {selectedStakeholder ? "Editar" : "Nuevo"} Stakeholder
                </DialogTitle>
              </DialogHeader>
              <StakeholderForm
                provinciaId={provincia.id}
                stakeholder={selectedStakeholder}
                onSubmit={selectedStakeholder ? handleUpdateStakeholder : handleCreateStakeholder}
              />
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleExport}>
            Exportar JSON
          </Button>
        </div>

        <div className="space-y-2">
          {provincia.stakeholders?.map((stakeholder) => (
            <Card key={stakeholder.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{stakeholder.nombre}</h3>
                  <p className="text-sm text-muted-foreground">
                    Influencia: {stakeholder.nivel_influencia} | Interés:{" "}
                    {stakeholder.nivel_interes}
                  </p>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedStakeholder(stakeholder);
                      setDialogOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => stakeholder.id && handleDeleteStakeholder(stakeholder.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
