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
  DialogDescription,
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
    <Card className="w-full max-w-lg hover:shadow-lg transition-shadow border-t-4 border-t-primary/20">
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
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedStakeholder ? "Editar" : "Nuevo"} Stakeholder
                </DialogTitle>
                <DialogDescription>
                  Complete los siguientes campos para {selectedStakeholder ? "actualizar" : "registrar"} un stakeholder
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <StakeholderForm
                  provinciaId={provincia.id}
                  stakeholder={selectedStakeholder}
                  onSubmit={selectedStakeholder ? handleUpdateStakeholder : handleCreateStakeholder}
                />
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleExport}>
            Exportar JSON
          </Button>
        </div>

        <div className="space-y-2">
          {provincia.stakeholders?.map((stakeholder) => (
            <Card key={stakeholder.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      {stakeholder.nombre}
                    </h3>
                    {stakeholder.datos_especificos_linkedin?.headline && (
                      <p className="text-sm text-muted-foreground">
                        {stakeholder.datos_especificos_linkedin.headline}
                      </p>
                    )}
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedStakeholder(stakeholder);
                        setDialogOpen(true);
                      }}
                      className="hover:bg-primary/10"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => stakeholder.id && handleDeleteStakeholder(stakeholder.id)}
                      className="hover:bg-destructive/90"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary p-2 rounded-md">
                    <p className="text-sm font-medium">Nivel de Influencia</p>
                    <p className="text-sm mt-1 text-muted-foreground">{stakeholder.nivel_influencia}</p>
                  </div>
                  
                  <div className="bg-secondary p-2 rounded-md">
                    <p className="text-sm font-medium">Nivel de Interés</p>
                    <p className="text-sm mt-1 text-muted-foreground">{stakeholder.nivel_interes}</p>
                  </div>
                </div>

                {stakeholder.objetivos_generales && (
                  <div className="text-sm">
                    <p className="font-medium">Objetivos Generales:</p>
                    <p className="text-muted-foreground">{stakeholder.objetivos_generales}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {stakeholder.datos_contacto?.linkedin && (
                    <a
                      href={stakeholder.datos_contacto.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      LinkedIn
                    </a>
                  )}
                  {stakeholder.datos_contacto?.email && (
                    <a
                      href={`mailto:${stakeholder.datos_contacto.email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Email
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
