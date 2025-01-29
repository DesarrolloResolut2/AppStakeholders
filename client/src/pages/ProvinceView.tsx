import { useState, useEffect } from "react";
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
  exportStakeholderContactData,
} from "@/lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Download, Search, ChevronRight, X, Pencil, Trash, User, Phone, Briefcase, Linkedin, Mail, Globe, Building, Users, AlertTriangle, Target, MessageSquare, ExternalLink, MoreVertical, ChevronUp, ChevronDown } from 'lucide-react';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProvinceView({ params }: { params: { id: string } }) {
  const provinciaId = parseInt(params.id);
  const [selectedStakeholder, setSelectedStakeholder] = useState<
    Stakeholder | undefined
  >();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterInfluence, setFilterInfluence] = useState("all");
  const [sortField, setSortField] = useState<keyof Stakeholder>("nombre");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
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

  const handleExportStakeholder = (stakeholder: Stakeholder) => {
    exportStakeholderContactData(stakeholder);
  };

  const openStakeholderDrawer = (stakeholder: Stakeholder) => {
    setSelectedStakeholder(stakeholder);
    setDrawerOpen(true);
  };

  const filteredStakeholders = provincia?.stakeholders?.filter(
    (stakeholder) => {
      const organizacionPrincipal = stakeholder.datos_contacto?.organizacion_principal?.toLowerCase() || '';
      const otrasOrganizaciones = stakeholder.datos_contacto?.otras_organizaciones?.toLowerCase() || '';
      const searchTermLower = searchTerm.toLowerCase();

      const matchesSearch = 
        organizacionPrincipal.includes(searchTermLower) ||
        otrasOrganizaciones.includes(searchTermLower);

      const matchesInfluence =
        filterInfluence === "all" ||
        stakeholder.nivel_influencia === filterInfluence;

      return matchesSearch && matchesInfluence;
    },
  );

  const sortedStakeholders = filteredStakeholders?.sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection === "asc" ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const toggleSort = (field: keyof Stakeholder) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDrawerOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

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
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-primary to-primary-foreground p-8 rounded-lg shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col gap-2">
              <Link href="/">
                <Button variant="secondary" size="sm" className="mb-2">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Volver al inicio
                </Button>
              </Link>
              <h1 className="text-4xl font-bold text-white">
                {provincia.nombre}
              </h1>
              <p className="text-white/80">
                {provincia.stakeholders?.length || 0} stakeholders registrados
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" /> Exportar JSON
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedStakeholder(undefined)}
                    size="lg"
                    className="w-full md:w-auto"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Agregar Stakeholder
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
        </div>

        {/* Filters and search */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <Input
                  placeholder="Buscar por organización..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                  icon={<Search className="h-4 w-4 text-muted-foreground" />}
                />
              </div>
              <Select
                value={filterInfluence}
                onValueChange={setFilterInfluence}
              >
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
          </CardContent>
        </Card>

        {/* Stakeholders List */}
        <div className="space-y-2">
          {/* Table Header */}
          <div className="grid grid-cols-5 gap-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 font-semibold">
            <div className="flex items-center cursor-pointer" onClick={() => toggleSort("nombre")}>
              Nombre
              {sortField === "nombre" && (sortDirection === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
            </div>
            <div className="flex items-center cursor-pointer" onClick={() => toggleSort("nivel_influencia")}>
              Influencia
              {sortField === "nivel_influencia" && (sortDirection === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
            </div>
            <div className="flex items-center cursor-pointer" onClick={() => toggleSort("nivel_interes")}>
              Interés
              {sortField === "nivel_interes" && (sortDirection === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
            </div>
            <div>Contacto</div>
            <div>Acciones</div>
          </div>
          {sortedStakeholders?.map((stakeholder) => (
            <Card key={stakeholder.id} className="hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200 hover:shadow-md">
              <CardContent className="p-4">
                <div className="grid grid-cols-5 gap-4 items-center">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${stakeholder.nombre}`} />
                      <AvatarFallback>{stakeholder.nombre.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{stakeholder.nombre}</p>
                      <p className="text-sm text-muted-foreground">{stakeholder.datos_contacto?.organizacion_principal || "No especificada"}</p>
                    </div>
                  </div>
                  <div>
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
                  </div>
                  <div>
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
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">{stakeholder.datos_contacto?.email || "No especificado"}</span>
                    <span className="text-sm">{stakeholder.datos_contacto?.telefono || "No especificado"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => openStakeholderDrawer(stakeholder)}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            Ver Más
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ver detalles</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedStakeholder(stakeholder);
                          setDialogOpen(true);
                        }}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportStakeholder(stakeholder)}>
                          <Download className="mr-2 h-4 w-4" />
                          Exportar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => stakeholder.id && handleDeleteStakeholder(stakeholder.id)}>
                          <Trash className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stakeholder Details Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="right"
          className="w-[80%] sm:max-w-[100%] p-0 bg-background"
        >
          <SheetHeader className="p-6 bg-gradient-to-r from-primary to-primary-foreground sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${selectedStakeholder?.nombre}`} />
                  <AvatarFallback>{selectedStakeholder?.nombre.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle className="text-3xl font-bold text-white">
                    {selectedStakeholder?.nombre}
                  </SheetTitle>
                  <p className="text-primary-foreground/80">
                    {selectedStakeholder?.datos_contacto?.organizacion_principal || "Organización no especificada"}
                  </p>
                </div>
              </div>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="text-primary-foreground">
                  <X className="h-6 w-6" />
                </Button>
              </SheetClose>
            </div>
            <div className="flex space-x-2 mt-4">
              <Badge variant="secondary" className="text-lg py-1 px-3">
                Influencia: {selectedStakeholder?.nivel_influencia}
              </Badge>
              <Badge variant="secondary" className="text-lg py-1 px-3">
                Interés: {selectedStakeholder?.nivel_interes}
              </Badge>
            </div>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-12rem)] px-6 py-4">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <User size={18} />
                  General
                </TabsTrigger>
                <TabsTrigger value="contacto" className="flex items-center gap-2">
                  <Phone size={18} />
                  Contacto
                </TabsTrigger>
                <TabsTrigger value="objetivos" className="flex items-center gap-2">
                  <Target size={18} />
                  Objetivos
                </TabsTrigger>
                <TabsTrigger value="linkedin" className="flex items-center gap-2">
                  <Linkedin size={18} />
                  LinkedIn
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Recursos y Relaciones
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Recursos:</h4>
                          <p>{selectedStakeholder?.recursos || "No especificados"}</p>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-2">Relaciones:</h4>
                          <p>{selectedStakeholder?.relaciones || "No especificadas"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Riesgos y Conflictos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{selectedStakeholder?.riesgos_conflictos || "No especificados"}</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="contacto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Organizaciones
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Principal:</h4>
                          <p>{selectedStakeholder?.datos_contacto?.organizacion_principal || "No especificada"}</p>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-2">Otras:</h4>
                          <p>{selectedStakeholder?.datos_contacto?.otras_organizaciones || "No especificadas"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Persona de Contacto
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{selectedStakeholder?.datos_contacto?.persona_contacto || "No especificada"}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Email
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{selectedStakeholder?.datos_contacto?.email || "No especificado"}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        Teléfono
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{selectedStakeholder?.datos_contacto?.telefono || "No especificado"}</p>
                    </CardContent>
                  </Card>
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Website
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{selectedStakeholder?.datos_contacto?.website || "No especificado"}</p>
                    </CardContent>
                  </Card>
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Linkedin
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{selectedStakeholder?.datos_contacto?.linkedin || "No especificado"}</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              

              <TabsContent value="objetivos">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Objetivos Generales
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{selectedStakeholder?.objetivos_generales || "No especificados"}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Intereses y Expectativas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{selectedStakeholder?.intereses_expectativas || "No especificados"}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Expectativas de Comunicación
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{selectedStakeholder?.expectativas_comunicacion || "No especificadas"}</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="linkedin">
                {selectedStakeholder?.datos_especificos_linkedin ? (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          About Me
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{selectedStakeholder.datos_especificos_linkedin.about_me || "No especificado"}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5" />
                          Headline
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{selectedStakeholder.datos_especificos_linkedin.headline || "No especificado"}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5" />
                          Experiencia
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{selectedStakeholder.datos_especificos_linkedin.experiencia || "No especificada"}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5" />
                          Formación
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{selectedStakeholder.datos_especificos_linkedin.formacion || "No especificada"}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5" />
                          Otros Campos
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{selectedStakeholder.datos_especificos_linkedin.otros_campos || "No especificados"}</p>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent>
                      <p className="text-center py-4">No hay datos de LinkedIn disponibles para este stakeholder.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}