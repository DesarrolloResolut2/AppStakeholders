import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { DndContext, DragOverlay, useDraggable, useDroppable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import * as XLSX from 'xlsx';
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
  fetchTags
} from "@/lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Plus,
  Download,
  Search,
  ChevronRight,
  X,
  Pencil,
  Trash,
  User,
  Phone,
  Briefcase,
  Linkedin,
  Mail,
  Globe,
  Building,
  Users,
  AlertTriangle,
  Target,
  MessageSquare,
  MoreVertical,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
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
import { TagManager } from "@/components/TagManager";
import { useToast } from "@/hooks/use-toast";

const generatePastelColor = (id: number) => {
  const hue = (id * 137.508) % 360;
  return `hsl(${hue}, 50%, 87%)`;
};

const getTextColor = (backgroundColor: string) => {
  return 'rgb(51, 51, 51)';
};

interface StakeholderCardProps {
  stakeholder: Stakeholder;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onExport: () => void;
  onView: () => void;
  onTagDrop: (tagId: number, stakeholderId: number) => void;
  onRemoveTag: (stakeholderId: number, tagId: number) => void;
}

function StakeholderCard({
  stakeholder,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onExport,
  onView,
  onTagDrop,
  onRemoveTag
}: StakeholderCardProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const tagId = e.dataTransfer.getData('text/plain');
    if (tagId && stakeholder.id) {
      onTagDrop(parseInt(tagId), stakeholder.id);
    }
  };

  return (
    <Card
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200 hover:shadow-md`}
    >
      <CardContent className="p-4">
        <div className="grid grid-cols-7 gap-4 items-center">
          <div className="flex items-center">
            <Checkbox
              id={`select-${stakeholder.id}`}
              checked={isSelected}
              onCheckedChange={onSelect}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${stakeholder.nombre}`} />
              <AvatarFallback>{stakeholder.nombre?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{stakeholder.nombre}</p>
              <p className="text-sm text-muted-foreground">
                {stakeholder.datos_contacto?.organizacion_principal || "No especificada"}
              </p>
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
          <div className="flex flex-wrap gap-1">
            {stakeholder.tags && stakeholder.tags.length > 0 ? (
              stakeholder.tags.map(({ tag }) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-xs group relative"
                  style={{
                    backgroundColor: generatePastelColor(tag.id),
                    color: getTextColor(generatePastelColor(tag.id)),
                    border: 'none'
                  }}
                >
                  {tag.name}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (stakeholder.id) onRemoveTag(stakeholder.id, tag.id);
                    }}
                    className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" style={{ color: getTextColor(generatePastelColor(tag.id)) }} />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">Sin etiquetas</span>
            )}
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
                    onClick={onView}
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
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete}>
                  <Trash className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProvinceView({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const provinciaId = parseInt(params.id);
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterInfluence, setFilterInfluence] = useState("all");
  const [sortField, setSortField] = useState<keyof Stakeholder>("nombre");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedStakeholders, setSelectedStakeholders] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();
  const [searchType, setSearchType] = useState<"organization" | "tags">("organization");

  const { data: provincias = [], isLoading } = useQuery({
    queryKey: ["/provincias"],
    queryFn: fetchProvincias,
  });

  const provincia = provincias.find((p) => p.id === provinciaId);

  const { data: tags = [], isLoading: tagsLoading } = useQuery({
    queryKey: ["/tags"],
    queryFn: fetchTags,
  });

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
      const searchTermLower = searchTerm.toLowerCase();

      if (searchType === "organization") {
        const organizacionPrincipal = stakeholder.datos_contacto?.organizacion_principal?.toLowerCase() || '';
        const otrasOrganizaciones = stakeholder.datos_contacto?.otras_organizaciones?.toLowerCase() || '';

        const matchesSearch =
          organizacionPrincipal.includes(searchTermLower) ||
          otrasOrganizaciones.includes(searchTermLower);

        const matchesInfluence =
          filterInfluence === "all" ||
          stakeholder.nivel_influencia === filterInfluence;

        return matchesSearch && matchesInfluence;
      } else {
        // Búsqueda por etiquetas
        const hasMatchingTag = stakeholder.tags?.some(
          ({ tag }) => tag.name.toLowerCase().includes(searchTermLower)
        );

        const matchesInfluence =
          filterInfluence === "all" ||
          stakeholder.nivel_influencia === filterInfluence;

        return hasMatchingTag && matchesInfluence;
      }
    },
  );

  const sortedStakeholders = filteredStakeholders?.sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
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

  const handleSelectStakeholder = (id: number) => {
    setSelectedStakeholders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (sortedStakeholders) {
      if (selectedStakeholders.size === sortedStakeholders.length) {
        setSelectedStakeholders(new Set());
      } else {
        setSelectedStakeholders(new Set(sortedStakeholders.map(s => s.id!)));
      }
    }
  };

  const exportToExcel = () => {
    if (!sortedStakeholders || !provincia) return;

    const selectedData = sortedStakeholders
      .filter(s => selectedStakeholders.has(s.id!))
      .map(s => ({
        'Nombre': s.nombre || '',
        'Organización Principal': s.datos_contacto?.organizacion_principal || '',
        'Otras Organizaciones': s.datos_contacto?.otras_organizaciones || '',
        'Nivel de Influencia': s.nivel_influencia || '',
        'Nivel de Interés': s.nivel_interes || '',
        'Email': s.datos_contacto?.email || '',
        'Teléfono': s.datos_contacto?.telefono || '',
        'Persona de Contacto': s.datos_contacto?.persona_contacto || '',
        'Website': s.datos_contacto?.website || '',
        'LinkedIn': s.datos_contacto?.linkedin || '',
        'Recursos': s.recursos || '',
        'Relaciones': s.relaciones || '',
        'Riesgos y Conflictos': s.riesgos_conflictos || '',
        'Objetivos Generales': s.objetivos_generales || '',
        'Intereses y Expectativas': s.intereses_expectativas || '',
        'Expectativas de Comunicación': s.expectativas_comunicacion || ''
      }));

    const ws = XLSX.utils.json_to_sheet(selectedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stakeholders");
    XLSX.writeFile(wb, `stakeholders_${provincia.nombre}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleTagDrop = async (tagId: number, stakeholderId: number) => {
    try {
      console.log('Intentando asignar tag:', { tagId, stakeholderId });

      const response = await fetch(`/api/stakeholders/${stakeholderId}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tagId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al asignar etiqueta');
      }

      queryClient.invalidateQueries({ queryKey: ["/provincias"] });
      toast({
        title: "Éxito",
        description: "Etiqueta asignada correctamente",
      });
    } catch (error) {
      console.error('Error detallado al asignar etiqueta:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo asignar la etiqueta",
        variant: "destructive",
      });
    }
  };

  const handleRemoveTag = async (stakeholderId: number, tagId: number) => {
    try {
      console.log('Intentando eliminar tag:', { stakeholderId, tagId });

      const response = await fetch(`/api/stakeholders/${stakeholderId}/tags/${tagId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar la etiqueta');
      }

      queryClient.invalidateQueries({ queryKey: ["/provincias"] });
      toast({
        title: "Éxito",
        description: "Etiqueta eliminada correctamente",
      });
    } catch (error) {
      console.error('Error detallado al eliminar etiqueta:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar la etiqueta",
        variant: "destructive",
      });
    }
  };

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (over) {
      const stakeholderId = over.id.replace('droppable-', '');
      const tagId = Number(active.id);

      if (stakeholderId && tagId) {
        handleTagDrop(tagId, parseInt(stakeholderId));
      }
    }
  }

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

  if (isLoading || tagsLoading) {
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
    <DndContext onDragEnd={handleDragEnd}>
      <div className="container mx-auto px-4 py-8 min-h-screen bg-gradient-to-b from-background to-secondary/5">
        <div className="space-y-8">
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
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="mr-2"
                >
                  <Download className="mr-2 h-4 w-4" /> Exportar JSON
                </Button>
                <Button
                  variant="outline"
                  onClick={exportToExcel}
                  disabled={selectedStakeholders.size === 0}
                  className="mr-2"
                >
                  <Download className="mr-2 h-4 w-4" /> Exportar Seleccionados a Excel
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

          <TagManager
            tags={tags}
            onTagsChange={() => queryClient.invalidateQueries({ queryKey: ["/tags"] })}
            onDragEnd={handleDragEnd}
          />

          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow relative flex gap-2">
                  <Select
                    value={searchType}
                    onValueChange={(value: "organization" | "tags") => setSearchType(value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tipo de búsqueda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="organization">Organizaciones</SelectItem>
                      <SelectItem value="tags">Etiquetas</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex-grow relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      placeholder={`Buscar por ${searchType === "organization" ? "organización" : "etiquetas"}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>
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

          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 font-semibold">
              <div className="flex items-center">
                <Checkbox
                  id="select-all"
                  checked={sortedStakeholders?.length === selectedStakeholders.size}
                  onCheckedChange={handleSelectAll}
                />
              </div>
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
              <div>Etiquetas</div>
              <div>Contacto</div>
              <div>Acciones</div>
            </div>
            {sortedStakeholders?.map((stakeholder) => (
              <StakeholderCard
                key={stakeholder.id}
                stakeholder={stakeholder}
                isSelected={selectedStakeholders.has(stakeholder.id!)}
                onSelect={() => handleSelectStakeholder(stakeholder.id!)}
                onEdit={() => {
                  setSelectedStakeholder(stakeholder);
                  setDialogOpen(true);
                }}
                onDelete={() => stakeholder.id && handleDeleteStakeholder(stakeholder.id)}
                onExport={() => handleExportStakeholder(stakeholder)}
                onView={() => openStakeholderDrawer(stakeholder)}
                onTagDrop={handleTagDrop}
                onRemoveTag={handleRemoveTag}
              />
            ))}
          </div>

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
                      <AvatarFallback>{selectedStakeholder?.nombre?.charAt(0)}</AvatarFallback>
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
                            <Target className="h-5 w-5" />
                            Etiquetas
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {selectedStakeholder?.tags && selectedStakeholder.tags.length > 0 ? (
                              selectedStakeholder.tags.map(({ tag }) => (
                                <Badge
                                  key={tag.id}
                                  variant="outline"
                                  className="group relative"
                                  style={{
                                    backgroundColor: generatePastelColor(tag.id),
                                    color: getTextColor(generatePastelColor(tag.id)),
                                    border: 'none'
                                  }}
                                >
                                  {tag.name}
                                  <button
                                    onClick={() => handleRemoveTag(selectedStakeholder.id!, tag.id)}
                                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-3 w-3" style={{ color: getTextColor(generatePastelColor(tag.id)) }} />
                                  </button>
                                </Badge>
                              ))
                            ) : (
                              <p className="text-muted-foreground">Sin etiquetas</p>
                            )}
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
                      <Card className="md:col-span-2">                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            Enlaces y Sitios Web
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {selectedStakeholder?.datos_contacto?.website && (
                              <a
                                href={selectedStakeholder.datos_contacto.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-primary hover:underline"
                              >
                                <Globe className="h-4 w-4" />
                                {selectedStakeholder.datos_contacto.website}
                              </a>
                            )}
                            {selectedStakeholder?.datos_contacto?.linkedin && (
                              <a
                                href={selectedStakeholder.datos_contacto.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-primary hover:underline"
                              >
                                <Linkedin className="h-4 w-4" />
                                {selectedStakeholder.datos_contacto.linkedin}
                              </a>
                            )}
                          </div>
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
      </div>
      <DragOverlay />
    </DndContext>
  );
}