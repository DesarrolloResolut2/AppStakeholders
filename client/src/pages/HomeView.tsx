// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { fetchProvincias, createProvincia, deleteProvincia } from "@/lib/api";
// import { useToast } from "@/hooks/use-toast";
// import { Link } from "wouter";

// export function HomeView() {
//   const [newProvincia, setNewProvincia] = useState("");
//   const { toast } = useToast();
//   const queryClient = useQueryClient();

//   const { data: provincias = [], isLoading } = useQuery({
//     queryKey: ["/provincias"],
//     queryFn: fetchProvincias,
//   });

//   const createProvinciaMutation = useMutation({
//     mutationFn: (nombre: string) => createProvincia(nombre),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["/provincias"] });
//       setNewProvincia("");
//       toast({
//         title: "Provincia creada",
//         description: "La provincia se ha creado exitosamente.",
//       });
//     },
//     onError: (error) => {
//       console.error("Error al crear provincia:", error);
//       toast({
//         title: "Error",
//         description: "No se pudo crear la provincia.",
//         variant: "destructive",
//       });
//     },
//   });

//   const handleCreateProvincia = async (e: React.FormEvent) => {
//     e.preventDefault();
//     e.stopPropagation();

//     const trimmedProvincia = newProvincia.trim();
//     if (!trimmedProvincia) {
//       toast({
//         title: "Error",
//         description: "El nombre de la provincia no puede estar vacío",
//         variant: "destructive",
//       });
//       return;
//     }

//     try {
//       await createProvinciaMutation.mutateAsync(trimmedProvincia);
//       toast({
//         title: "Éxito",
//         description: "Provincia creada correctamente",
//       });
//     } catch (error) {
//       console.error("Error en handleCreateProvincia:", error);
//       toast({
//         title: "Error",
//         description: "No se pudo crear la provincia. Por favor, intente nuevamente.",
//         variant: "destructive",
//       });
//     }
//   };

//   if (isLoading) {
//     return <div>Cargando...</div>;
//   }

//   return (
//     <div className="container mx-auto px-4 py-8 min-h-screen bg-gradient-to-b from-background to-secondary/5">
//       <div className="space-y-10">
//         {/* Header y Resumen */}
//         <div className="text-center space-y-4">
//           <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
//             Gestión de Stakeholders por Provincia
//           </h1>
//           <p className="text-muted-foreground max-w-2xl mx-auto">
//             Sistema integral para la gestión y seguimiento de stakeholders, permitiendo un análisis detallado
//             por provincia y la exportación de datos en formato JSON.
//           </p>
//         </div>

//         {/* Estadísticas Generales */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-primary">
//             <div className="text-center space-y-2">
//               <p className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
//                 {provincias.length}
//               </p>
//               <p className="text-sm font-medium">Provincias Registradas</p>
//             </div>
//           </div>
//           <div className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-primary">
//             <div className="text-center space-y-2">
//               <p className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
//                 {provincias.reduce((acc, p) => acc + (p.stakeholders?.length || 0), 0)}
//               </p>
//               <p className="text-sm font-medium">Total de Stakeholders</p>
//             </div>
//           </div>
//           <div className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-primary">
//             <div className="text-center space-y-2">
//               <p className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
//                 {Math.max(...provincias.map(p => p.stakeholders?.length || 0))}
//               </p>
//               <p className="text-sm font-medium">Máx. Stakeholders por Provincia</p>
//             </div>
//           </div>
//         </div>

//         {/* Formulario de Nueva Provincia */}
//         <div className="bg-card p-6 rounded-lg shadow-sm">
//           <h2 className="text-lg font-semibold mb-4">Agregar Nueva Provincia</h2>
//           <form
//             onSubmit={handleCreateProvincia}
//             className="flex gap-4"
//           >
//             <Input
//               value={newProvincia}
//               onChange={(e) => setNewProvincia(e.target.value)}
//               placeholder="Nombre de la nueva provincia"
//               className="max-w-sm"
//               required
//               type="text"
//             />
//             <Button
//               type="submit"
//               disabled={createProvinciaMutation.isPending}
//             >
//               {createProvinciaMutation.isPending ? "Creando..." : "Agregar Provincia"}
//             </Button>
//           </form>
//         </div>

//         {/* Lista de Provincias */}
//         <div>
//           <h2 className="text-2xl font-semibold mb-6">Provincias Registradas</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {provincias.map((provincia) => (
//               <Link key={provincia.id} href={`/provincia/${provincia.id}`}>
//                 <Card className="hover:shadow-lg transition-shadow cursor-pointer border-t-4 border-t-primary/20">
//                   <CardHeader className="relative">
//                     <div className="absolute right-4 top-4">
//                       <Button
//                         variant="destructive"
//                         size="sm"
//                         onClick={(e) => {
//                           e.preventDefault();
//                           if (confirm('¿Estás seguro de que deseas eliminar esta provincia? Se eliminarán también todos los stakeholders asociados.')) {
//                             deleteProvincia(provincia.id).then(() => {
//                               queryClient.invalidateQueries({ queryKey: ["/provincias"] });
//                             });
//                           }
//                         }}
//                       >
//                         Eliminar Provincia
//                       </Button>
//                     </div>
//                     <CardTitle>{provincia.nombre}</CardTitle>
//                     <p className="text-sm text-muted-foreground">
//                       {provincia.stakeholders?.length || 0} stakeholders registrados
//                     </p>
//                   </CardHeader>
//                   <CardContent>
//                     <p className="text-sm text-muted-foreground">
//                       Haz clic para ver detalles y gestionar stakeholders
//                     </p>
//                   </CardContent>
//                 </Card>
//               </Link>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchProvincias, createProvincia, deleteProvincia } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  PlusCircle,
  Trash2,
  ChevronRight,
  Loader2,
  Search,
  Users,
  MapPin,
  BarChart2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import lplataformaLogo from "./lplataforma.png";

function getBackgroundColor(stakeholderCount: number, maxStakeholders: number) {
  const ratio = stakeholderCount / maxStakeholders;
  if (ratio < 0.33) return "from-blue-300 to-blue-400";
  if (ratio < 0.66) return "from-blue-400 to-blue-500";
  return "from-blue-500 to-blue-600";
}

function getDistinctiveColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

export function HomeView() {
  const [newProvincia, setNewProvincia] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewProvinciaModal, setShowNewProvinciaModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: provincias = [], isLoading } = useQuery({
    queryKey: ["/provincias"],
    queryFn: fetchProvincias,
  });

  const createProvinciaMutation = useMutation({
    mutationFn: (nombre: string) => createProvincia(nombre),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/provincias"] });
      setNewProvincia("");
      toast({
        title: "Provincia creada",
        description: "La provincia se ha creado exitosamente.",
      });
      setShowNewProvinciaModal(false); // Close modal after successful creation
    },
    onError: (error) => {
      console.error("Error al crear provincia:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la provincia.",
        variant: "destructive",
      });
    },
  });

  const handleCreateProvincia = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedProvincia = newProvincia.trim();
    if (!trimmedProvincia) {
      toast({
        title: "Error",
        description: "El nombre de la provincia no puede estar vacío",
        variant: "destructive",
      });
      return;
    }
    try {
      await createProvinciaMutation.mutateAsync(trimmedProvincia);
    } catch (error) {
      console.error("Error en handleCreateProvincia:", error);
      toast({
        title: "Error",
        description:
          "No se pudo crear la provincia. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const filteredProvincias = useMemo(() => {
    return provincias.filter((provincia) =>
      provincia.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [provincias, searchTerm]);

  const totalStakeholders = useMemo(() => {
    return provincias.reduce(
      (acc, p) => acc + (p.stakeholders?.length || 0),
      0,
    );
  }, [provincias]);

  const maxStakeholders = useMemo(() => {
    return Math.max(...provincias.map((p) => p.stakeholders?.length || 0));
  }, [provincias]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-8 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <img
                src={lplataformaLogo}
                alt="La Plataforma Logo"
                className="w-20 h-20 object-contain bg-white rounded-full p-2"
              />
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">
                  Provincias
                </h1>
                <p className="text-blue-200">
                  Sistema de gestión de stakeholders
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Buscar provincias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-white text-gray-800 placeholder-gray-500"
                />
              </div>
              <Button
                onClick={() => setShowNewProvinciaModal(true)}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Nueva Provincia
              </Button>
            </div>
          </div>
        </div>
      </div>
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="provincias" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="provincias">Provincias</TabsTrigger>
            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
          </TabsList>
          <TabsContent value="provincias">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Provincias</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {filteredProvincias.map((provincia) => (
                        <ProvinciaCard
                          key={provincia.id}
                          provincia={provincia}
                          maxStakeholders={maxStakeholders}
                          onDelete={() =>
                            deleteProvincia(provincia.id).then(() => {
                              queryClient.invalidateQueries({
                                queryKey: ["/provincias"],
                              });
                            })
                          }
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="estadisticas">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Stakeholders</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {provincias.map((provincia) => (
                        <div
                          key={provincia.id}
                          className="flex justify-between items-center"
                        >
                          <span>{provincia.nombre}</span>
                          <span className="font-semibold">
                            {provincia.stakeholders?.length || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Resumen Estadístico</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StatItem
                    title="Total de Provincias"
                    value={provincias.length}
                    icon={<MapPin className="h-5 w-5 text-primary" />}
                  />
                  <StatItem
                    title="Total de Stakeholders"
                    value={totalStakeholders}
                    icon={<Users className="h-5 w-5 text-primary" />}
                  />
                  <StatItem
                    title="Promedio de Stakeholders por Provincia"
                    value={(totalStakeholders / provincias.length).toFixed(2)}
                    icon={<BarChart2 className="h-5 w-5 text-primary" />}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      {showNewProvinciaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Nueva Provincia</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProvincia} className="space-y-4">
                <Input
                  value={newProvincia}
                  onChange={(e) => setNewProvincia(e.target.value)}
                  placeholder="Nombre de la nueva provincia"
                  required
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewProvinciaModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createProvinciaMutation.isPending}
                  >
                    {createProvinciaMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <PlusCircle className="h-4 w-4 mr-2" />
                    )}
                    Crear
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function ProvinciaCard({ provincia, maxStakeholders, onDelete }) {
  const stakeholderCount = provincia.stakeholders?.length || 0;
  const bgColor = getBackgroundColor(stakeholderCount, maxStakeholders);
  const distinctiveColor = getDistinctiveColor(provincia.nombre);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/provincia/${provincia.id}`}>
              <Card
                className={`overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer h-48 group bg-gradient-to-br ${bgColor} relative`}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 opacity-50"
                  style={{ backgroundColor: distinctiveColor }}
                />
                <div className="relative h-full">
                  <div className="absolute inset-0 bg-black/10 z-10" />
                  <div className="absolute inset-0 flex flex-col justify-between p-4 pl-5 z-20">
                    <CardTitle className="text-2xl font-bold text-white">
                      {provincia.nombre}
                    </CardTitle>
                    <div className="space-y-2">
                      <p className="text-white flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {stakeholderCount} stakeholders
                      </p>
                      <div className="w-full bg-white/30 rounded-full h-2">
                        <div
                          className="bg-white rounded-full h-2 transition-all duration-500 ease-out"
                          style={{
                            width: `${(stakeholderCount / maxStakeholders) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Ver detalles
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:text-red-500"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (
                              confirm(
                                "¿Estás seguro de que deseas eliminar esta provincia? Se eliminarán también todos los stakeholders asociados.",
                              )
                            ) {
                              onDelete();
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Provincia: {provincia.nombre}</p>
            <p>Stakeholders: {stakeholderCount}</p>
            <p>
              Porcentaje:{" "}
              {((stakeholderCount / maxStakeholders) * 100).toFixed(2)}%
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
}

function StatItem({ title, value, icon }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {icon}
        <span>{title}</span>
      </div>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
