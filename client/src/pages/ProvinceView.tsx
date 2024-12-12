import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { StakeholderForm } from "@/components/StakeholderForm";
import type { Stakeholder } from "@/lib/types";
import { 
  createStakeholder, 
  updateStakeholder, 
  deleteStakeholder, 
  exportProvinciaData, 
  exportStakeholderContactData,
  fetchProvincias 
} from "@/lib/api";

export function ProvinceView({ params }: { params: { id: string } }) {
  const provinciaId = parseInt(params.id);
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: provincias = [], isLoading } = useQuery({
    queryKey: ["/provincias"],
    queryFn: fetchProvincias,
  });

  const provincia = provincias.find(p => p.id === provinciaId);

  const handleCreateStakeholder = async (data: Omit<Stakeholder, "id">) => {
    await createStakeholder(data);
    setDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["/provincias"] });
  };

  const handleUpdateStakeholder = async (data: Omit<Stakeholder, "id">) => {
    if (selectedStakeholder?.id) {
      await updateStakeholder(selectedStakeholder.id, data);
      setSelectedStakeholder(undefined);
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/provincias"] });
    }
  };

  const handleDeleteStakeholder = async (id: number) => {
    await deleteStakeholder(id);
    queryClient.invalidateQueries({ queryKey: ["/provincias"] });
  };

  const handleExport = () => {
    if (provincia) {
      exportProvinciaData(provinciaId, provincia.nombre);
    }
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!provincia) {
    return <div>Provincia no encontrada</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gradient-to-b from-background to-secondary/5">
      <div className="space-y-8">
        {/* Cabecera */}
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  ← Volver al inicio
                </Button>
              </Link>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {provincia.nombre}
              </h1>
              <p className="text-muted-foreground mt-2">
                {provincia.stakeholders?.length || 0} stakeholders registrados
              </p>
            </div>
          </div>
          <div className="space-x-4">
            <Button variant="outline" onClick={handleExport}>
              Exportar Provincia JSON
            </Button>
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
                    provinciaId={provinciaId}
                    stakeholder={selectedStakeholder}
                    onSubmit={selectedStakeholder ? handleUpdateStakeholder : handleCreateStakeholder}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Lista de Stakeholders */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {provincia.stakeholders?.map((stakeholder) => (
            <Card key={stakeholder.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {stakeholder.nombre}
                </CardTitle>
                {stakeholder.datos_especificos_linkedin?.headline && (
                  <CardDescription>
                    {stakeholder.datos_especificos_linkedin.headline}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div className="flex justify-between items-center">
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
                      onClick={() => exportStakeholderContactData(stakeholder)}
                    >
                      Exportar Contacto
                    </Button>
                  )}
                </div>
              </CardContent>
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
                <h3 className="text-lg font-semibold mb-4">Datos de Contacto</h3>
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
                <h3 className="text-lg font-semibold mb-4">Información Principal</h3>
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
                <h3 className="text-lg font-semibold mb-4">Información Adicional</h3>
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
                      <p className="font-medium">Expectativas de Comunicación</p>
                      <p className="text-muted-foreground">
                        {selectedStakeholder.expectativas_comunicacion}
                      </p>
                    </div>
                  )}
                  {selectedStakeholder?.relaciones && (
                    <div>
                      <p className="font-medium">Relaciones con Otros Actores</p>
                      <p className="text-muted-foreground">
                        {selectedStakeholder.relaciones}
                      </p>
                    </div>
                  )}
                  {selectedStakeholder?.riesgos_conflictos && (
                    <div>
                      <p className="font-medium">Riesgos y Conflictos Potenciales</p>
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
                selectedStakeholder?.datos_especificos_linkedin?.otros_campos) && (
                <div className="bg-secondary/20 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Datos de LinkedIn</h3>
                  <div className="space-y-4">
                    {selectedStakeholder?.datos_especificos_linkedin?.about_me && (
                      <div>
                        <p className="font-medium">About Me</p>
                        <p className="text-muted-foreground">
                          {selectedStakeholder.datos_especificos_linkedin.about_me}
                        </p>
                      </div>
                    )}
                    {selectedStakeholder?.datos_especificos_linkedin?.headline && (
                      <div>
                        <p className="font-medium">Headline</p>
                        <p className="text-muted-foreground">
                          {selectedStakeholder.datos_especificos_linkedin.headline}
                        </p>
                      </div>
                    )}
                    {selectedStakeholder?.datos_especificos_linkedin?.experiencia && (
                      <div>
                        <p className="font-medium">Experiencia</p>
                        <p className="text-muted-foreground">
                          {selectedStakeholder.datos_especificos_linkedin.experiencia}
                        </p>
                      </div>
                    )}
                    {selectedStakeholder?.datos_especificos_linkedin?.formacion && (
                      <div>
                        <p className="font-medium">Formación</p>
                        <p className="text-muted-foreground">
                          {selectedStakeholder.datos_especificos_linkedin.formacion}
                        </p>
                      </div>
                    )}
                    {selectedStakeholder?.datos_especificos_linkedin?.otros_campos && (
                      <div>
                        <p className="font-medium">Otros Campos</p>
                        <p className="text-muted-foreground">
                          {selectedStakeholder.datos_especificos_linkedin.otros_campos}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
