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
import { StakeholderForm } from "./StakeholderForm.tsx";
import type { Provincia, Stakeholder } from "@/lib/types";
import {
  createStakeholder,
  updateStakeholder,
  deleteStakeholder,
  exportProvinciaData,
  deleteProvincia,
  exportStakeholderContactData,
} from "@/lib/api";

interface Props {
  provincia: Provincia;
  onUpdate: () => void;
}

export function ProvinceCard({ provincia, onUpdate }: Props) {
  const [selectedStakeholder, setSelectedStakeholder] = useState<
    Stakeholder | undefined
  >();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const handleCreateStakeholder = async (data: Omit<Stakeholder, "id">) => {
    await createStakeholder(data);
    setDialogOpen(false);
    onUpdate();
  };

  const handleUpdateStakeholder = async (data: Omit<Stakeholder, "id">) => {
    if (selectedStakeholder?.id) {
      try {
        const updatedData = {
          ...data,
          provincia_id: provincia.id,
        };
        await updateStakeholder(selectedStakeholder.id, updatedData);
        setSelectedStakeholder(undefined);
        setDialogOpen(false);
        onUpdate();
      } catch (error) {
        console.error("Error al actualizar stakeholder:", error);
      }
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
      <CardHeader className="relative">
        <div className="absolute right-4 top-4">
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              if (
                confirm(
                  "¿Estás seguro de que deseas eliminar esta provincia? Se eliminarán también todos los stakeholders asociados.",
                )
              ) {
                await deleteProvincia(provincia.id);
                onUpdate();
              }
            }}
          >
            Eliminar Provincia
          </Button>
        </div>
        <CardTitle>{provincia.nombre}</CardTitle>
        <CardDescription>
          {provincia.stakeholders?.length || 0} stakeholders registrados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setSelectedStakeholder(undefined)}
                size="lg"
                className="w-full md:w-auto"
              >
                Agregar Stakeholder
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] w-full max-h-[90vh] p-0 overflow-hidden">
              <DialogHeader className="p-6 pb-0">
                <DialogTitle>
                  {selectedStakeholder ? "Editar" : "Nuevo"} Stakeholder
                </DialogTitle>
                <DialogDescription>
                  Complete los siguientes campos para{" "}
                  {selectedStakeholder ? "actualizar" : "registrar"} un
                  stakeholder
                </DialogDescription>
              </DialogHeader>
              <div className="p-6 pt-0">
                <StakeholderForm
                  provinciaId={provincia.id}
                  stakeholder={selectedStakeholder}
                  onSubmit={
                    selectedStakeholder
                      ? handleUpdateStakeholder
                      : handleCreateStakeholder
                  }
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
            <Card
              key={stakeholder.id}
              className="p-4 hover:shadow-lg transition-shadow"
            >
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
                      onClick={() =>
                        stakeholder.id &&
                        handleDeleteStakeholder(stakeholder.id)
                      }
                      className="hover:bg-destructive/90"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary p-2 rounded-md">
                    <p className="text-sm font-medium">Nivel de Influencia</p>
                    <p className="text-sm mt-1 text-muted-foreground">
                      {stakeholder.nivel_influencia}
                    </p>
                  </div>

                  <div className="bg-secondary p-2 rounded-md">
                    <p className="text-sm font-medium">Nivel de Interés</p>
                    <p className="text-sm mt-1 text-muted-foreground">
                      {stakeholder.nivel_interes}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
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
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedStakeholder(stakeholder);
                        setViewDialogOpen(true);
                      }}
                    >
                      Ver Detalles
                    </Button>
                    {stakeholder.datos_contacto && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          exportStakeholderContactData(stakeholder)
                        }
                      >
                        Exportar Contacto
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Diálogo para ver detalles completos del stakeholder */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {selectedStakeholder?.nombre}
              </DialogTitle>
              <DialogDescription>
                Detalles completos del stakeholder
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Datos de Contacto */}
              <div className="bg-secondary/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  Datos de Contacto
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedStakeholder?.datos_contacto?.organizacion && (
                    <div>
                      <p className="font-medium">Organización</p>
                      <p className="text-muted-foreground">
                        {selectedStakeholder.datos_contacto.organizacion}
                      </p>
                    </div>
                  )}
                  {selectedStakeholder?.datos_contacto?.persona_contacto && (
                    <div>
                      <p className="font-medium">Persona de Contacto</p>
                      <p className="text-muted-foreground">
                        {selectedStakeholder.datos_contacto.persona_contacto}
                      </p>
                    </div>
                  )}
                  {selectedStakeholder?.datos_contacto?.email && (
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">
                        {selectedStakeholder.datos_contacto.email}
                      </p>
                    </div>
                  )}
                  {selectedStakeholder?.datos_contacto?.website && (
                    <div>
                      <p className="font-medium">Website</p>
                      <p className="text-muted-foreground">
                        {selectedStakeholder.datos_contacto.website}
                      </p>
                    </div>
                  )}
                  {selectedStakeholder?.datos_contacto?.telefono && (
                    <div>
                      <p className="font-medium">Teléfono</p>
                      <p className="text-muted-foreground">
                        {selectedStakeholder.datos_contacto.telefono}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Información Principal */}
              <div className="bg-secondary/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  Información Principal
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">Nivel de Influencia</p>
                    <p className="text-muted-foreground">
                      {selectedStakeholder?.nivel_influencia}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Nivel de Interés</p>
                    <p className="text-muted-foreground">
                      {selectedStakeholder?.nivel_interes}
                    </p>
                  </div>
                  {selectedStakeholder?.objetivos_generales && (
                    <div>
                      <p className="font-medium">Objetivos Generales</p>
                      <p className="text-muted-foreground">
                        {selectedStakeholder.objetivos_generales}
                      </p>
                    </div>
                  )}
                  {selectedStakeholder?.intereses_expectativas && (
                    <div>
                      <p className="font-medium">Intereses y Expectativas</p>
                      <p className="text-muted-foreground">
                        {selectedStakeholder.intereses_expectativas}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Información Adicional */}
              <div className="bg-secondary/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  Información Adicional
                </h3>
                <div className="space-y-4">
                  {selectedStakeholder?.recursos && (
                    <div>
                      <p className="font-medium">Recursos</p>
                      <p className="text-muted-foreground">
                        {selectedStakeholder.recursos}
                      </p>
                    </div>
                  )}
                  {selectedStakeholder?.expectativas_comunicacion && (
                    <div>
                      <p className="font-medium">
                        Expectativas de Comunicación
                      </p>
                      <p className="text-muted-foreground">
                        {selectedStakeholder.expectativas_comunicacion}
                      </p>
                    </div>
                  )}
                  {selectedStakeholder?.relaciones && (
                    <div>
                      <p className="font-medium">
                        Relaciones con Otros Actores
                      </p>
                      <p className="text-muted-foreground">
                        {selectedStakeholder.relaciones}
                      </p>
                    </div>
                  )}
                  {selectedStakeholder?.riesgos_conflictos && (
                    <div>
                      <p className="font-medium">
                        Riesgos y Conflictos Potenciales
                      </p>
                      <p className="text-muted-foreground">
                        {selectedStakeholder.riesgos_conflictos}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Datos de LinkedIn */}
              {(selectedStakeholder?.datos_especificos_linkedin?.about_me ||
                selectedStakeholder?.datos_especificos_linkedin?.headline ||
                selectedStakeholder?.datos_especificos_linkedin?.experiencia ||
                selectedStakeholder?.datos_especificos_linkedin?.formacion ||
                selectedStakeholder?.datos_especificos_linkedin
                  ?.otros_campos) && (
                <div className="bg-secondary/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    Datos de LinkedIn
                  </h3>
                  <div className="space-y-4">
                    {selectedStakeholder?.datos_especificos_linkedin?.about_me && (
                      <div>
                        <p className="font-medium">About Me</p>
                        <p className="text-muted-foreground">
                          {
                            selectedStakeholder.datos_especificos_linkedin
                              .about_me
                          }
                        </p>
                      </div>
                    )}
                    {selectedStakeholder?.datos_especificos_linkedin?.headline && (
                      <div>
                        <p className="font-medium">Headline</p>
                        <p className="text-muted-foreground">
                          {
                            selectedStakeholder.datos_especificos_linkedin
                              .headline
                          }
                        </p>
                      </div>
                    )}
                    {selectedStakeholder?.datos_especificos_linkedin?.experiencia && (
                      <div>
                        <p className="font-medium mb-3">Experiencia Profesional</p>
                        <div className="space-y-4">
                          {selectedStakeholder.datos_especificos_linkedin.experiencia.map(
                            (exp, index) => (
                              <div key={index} className="bg-secondary/10 p-4 rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-semibold text-primary">{exp.cargo}</p>
                                    <p className="text-sm text-muted-foreground mt-1">{exp.empresa}</p>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {exp.fecha_inicio} - {exp.fecha_fin || 'Presente'}
                                  </div>
                                </div>
                                {exp.descripcion && (
                                  <p className="text-sm mt-3 text-muted-foreground">{exp.descripcion}</p>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                    {selectedStakeholder?.datos_especificos_linkedin?.formacion && (
                      <div className="mt-6">
                        <p className="font-medium mb-3">Formación Académica</p>
                        <div className="space-y-4">
                          {selectedStakeholder.datos_especificos_linkedin.formacion.map(
                            (edu, index) => (
                              <div key={index} className="bg-secondary/10 p-4 rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-semibold text-primary">{edu.titulo}</p>
                                    <p className="text-sm text-muted-foreground mt-1">{edu.universidad}</p>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {edu.año_inicio} - {edu.año_fin || 'Presente'}
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                    {selectedStakeholder?.datos_especificos_linkedin?.otros_campos && (
                      <div>
                        <p className="font-medium">Otros Campos</p>
                        <p className="text-muted-foreground">
                          {
                            selectedStakeholder.datos_especificos_linkedin
                              .otros_campos
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}