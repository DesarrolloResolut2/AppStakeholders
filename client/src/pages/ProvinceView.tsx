import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { StakeholderForm } from "@/components/StakeholderForm";
import type { Stakeholder } from "@/lib/types";
import {
  createStakeholder,
  updateStakeholder,
  deleteStakeholder,
  exportProvinciaData,
  fetchProvincias,
  exportStakeholderContactData, // Added import
} from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProvinceView({ params }: { params: { id: string } }) {
  const provinciaId = parseInt(params.id);
  const [selectedStakeholder, setSelectedStakeholder] = useState<
    Stakeholder | undefined
  >();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterInfluence, setFilterInfluence] = useState("all");
  const queryClient = useQueryClient();

  const { data: provincias = [], isLoading } = useQuery({
    queryKey: ["/provincias"],
    queryFn: fetchProvincias,
  });

  const provincia = provincias.find((p) => p.id === provinciaId);

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
    if (provincia && provincia.nombre) {
      exportProvinciaData(provincia.id, provincia.nombre);
    }
  };

  const toggleRowExpansion = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const filteredStakeholders = provincia?.stakeholders?.filter(
    (stakeholder) => {
      const matchesSearch = stakeholder.nombre
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesInfluence =
        filterInfluence === "all" ||
        stakeholder.nivel_influencia === filterInfluence;
      return matchesSearch && matchesInfluence;
    },
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Cargando...
      </div>
    );
  }

  if (!provincia) {
    return (
      <div className="flex items-center justify-center h-screen">
        Provincia no encontrada
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gradient-to-b from-background to-secondary/5">
      <div className="space-y-8">
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver al inicio
              </Button>
            </Link>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {provincia.nombre}
            </h1>
            <p className="text-muted-foreground">
              {provincia.stakeholders?.length || 0} stakeholders registrados
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Exportar JSON
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedStakeholder(undefined)}>
                  <Plus className="mr-2 h-4 w-4" /> Agregar Stakeholder
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedStakeholder ? "Editar" : "Nuevo"} Stakeholder
                  </DialogTitle>
                  <DialogDescription>
                    Complete los siguientes campos para{" "}
                    {selectedStakeholder ? "actualizar" : "registrar"} un
                    stakeholder
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <StakeholderForm
                    provinciaId={provinciaId}
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
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <Input
              placeholder="Buscar stakeholder..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              icon={<Search className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
          <Select value={filterInfluence} onValueChange={setFilterInfluence}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Nivel de influencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Alto">Alto</SelectItem>
              <SelectItem value="Medio">Medio</SelectItem>
              <SelectItem value="Bajo">Bajo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabla de Stakeholders */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px]">Nombre</TableHead>
                <TableHead>Nivel de Influencia</TableHead>
                <TableHead>Nivel de Interés</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStakeholders?.map((stakeholder) => (
                <>
                  <TableRow
                    key={stakeholder.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{stakeholder.nombre}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        variant={
                          stakeholder.nivel_influencia === "Alto"
                            ? "default"
                            : stakeholder.nivel_influencia === "Medio"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {stakeholder.nivel_influencia}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        variant={
                          stakeholder.nivel_interes === "Alto"
                            ? "default"
                            : stakeholder.nivel_interes === "Medio"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {stakeholder.nivel_interes}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="mr-2"
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
                        onClick={() =>
                          stakeholder.id &&
                          handleDeleteStakeholder(stakeholder.id)
                        }
                        className="mr-2"
                      >
                        Eliminar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportStakeholderContactData(stakeholder)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                        onClick={() => toggleRowExpansion(stakeholder.id!)}
                      >
                        {expandedRow === stakeholder.id! ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedRow === stakeholder.id! && (
                    <TableRow>
                      <TableCell colSpan={4} className="p-0">
                        <Card className="m-2 border-none shadow-none">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-2xl font-bold">
                              {stakeholder.nombre}
                            </CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedRow(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </CardHeader>
                          <CardContent>
                            <Tabs defaultValue="general" className="w-full">
                              <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="general">
                                  General
                                </TabsTrigger>
                                <TabsTrigger value="contacto">
                                  Contacto
                                </TabsTrigger>
                                <TabsTrigger value="objetivos">
                                  Objetivos
                                </TabsTrigger>
                                <TabsTrigger value="linkedin">
                                  LinkedIn
                                </TabsTrigger>
                                <TabsTrigger value="Personalidad">
                                  Personalidad
                                </TabsTrigger>
                              </TabsList>
                              <TabsContent value="general">
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                                        Nivel de Influencia
                                      </h4>
                                      <p className="text-lg">
                                        {stakeholder.nivel_influencia}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                                        Nivel de Interés
                                      </h4>
                                      <p className="text-lg">
                                        {stakeholder.nivel_interes}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                                      Recursos
                                    </h4>
                                    <p className="text-lg">
                                      {stakeholder.recursos ||
                                        "No especificados"}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                                      Relaciones
                                    </h4>
                                    <p className="text-lg">
                                      {stakeholder.relaciones ||
                                        "No especificadas"}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                                      Riesgos y Conflictos
                                    </h4>
                                    <p className="text-lg">
                                      {stakeholder.riesgos_conflictos ||
                                        "No especificados"}
                                    </p>
                                  </div>
                                </div>
                              </TabsContent>
                              <TabsContent value="contacto">
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                                      Organización principal
                                    </h4>
                                    <p className="text-lg">
                                      {stakeholder.datos_contacto
                                        ?.organizacion_principal || "No especificada"}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                                      Persona de Contacto
                                    </h4>
                                    <p className="text-lg">
                                      {stakeholder.datos_contacto
                                        ?.persona_contacto || "No especificada"}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                                      Email
                                    </h4>
                                    <p className="text-lg">
                                      {stakeholder.datos_contacto?.email ||
                                        "No especificado"}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                                      Teléfono
                                    </h4>
                                    <p className="text-lg">
                                      {stakeholder.datos_contacto?.telefono ||
                                        "No especificado"}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                                      Website
                                    </h4>
                                    <p className="text-lg">
                                      {stakeholder.datos_contacto?.website ||
                                        "No especificado"}
                                    </p>
                                  </div>
                                </div>
                              </TabsContent>
                              <TabsContent value="objetivos">
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                                      Objetivos Generales
                                    </h4>
                                    <p className="text-lg">
                                      {stakeholder.objetivos_generales ||
                                        "No especificados"}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                                      Intereses y Expectativas
                                    </h4>
                                    <p className="text-lg">
                                      {stakeholder.intereses_expectativas ||
                                        "No especificados"}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                                      Expectativas de Comunicación
                                    </h4>
                                    <p className="text-lg">
                                      {stakeholder.expectativas_comunicacion ||
                                        "No especificadas"}
                                    </p>
                                  </div>
                                </div>
                              </TabsContent>
                              <TabsContent value="linkedin">
                                {stakeholder.datos_especificos_linkedin ? (
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                                        About Me
                                      </h4>
                                      <p className="text-lg">
                                        {stakeholder.datos_especificos_linkedin
                                          .about_me || "No especificado"}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                                        Headline
                                      </h4>
                                      <p className="text-lg">
                                        {stakeholder.datos_especificos_linkedin
                                          .headline || "No especificado"}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                                        Experiencia
                                      </h4>
                                      <p className="text-lg">
                                        {stakeholder.datos_especificos_linkedin
                                          .experiencia || "No especificada"}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                                        Formación
                                      </h4>
                                      <p className="text-lg">
                                        {stakeholder.datos_especificos_linkedin
                                          .formacion || "No especificada"}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                                        Otros Campos
                                      </h4>
                                      <p className="text-lg">
                                        {stakeholder.datos_especificos_linkedin
                                          .otros_campos || "No especificados"}
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-lg">
                                    No hay datos de LinkedIn disponibles para
                                    este stakeholder.
                                  </p>
                                )}
                              </TabsContent>
                              <TabsContent value="Personalidad">HOLA</TabsContent>
                              
                            </Tabs>
                          </CardContent>
                        </Card>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}