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
import { useUser } from "@/hooks/use-user";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

async function changePassword(currentPassword: string, newPassword: string) {
  const response = await fetch("/api/user/password", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al cambiar la contraseña");
  }

  return response.json();
}

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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, logout } = useUser();

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
      setShowNewProvinciaModal(false);
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
      provincia.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [provincias, searchTerm]);

  const totalStakeholders = useMemo(() => {
    return provincias.reduce((acc, p) => acc + (p.stakeholders?.length || 0), 0);
  }, [provincias]);

  const maxStakeholders = useMemo(() => {
    return Math.max(...provincias.map((p) => p.stakeholders?.length || 0));
  }, [provincias]);

  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido actualizada exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas nuevas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

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
              {user?.role === "admin" && (
                <Link href="/users">
                  <Button variant="outline" className="bg-white text-blue-600 hover:bg-blue-50">
                    <Users className="h-4 w-4 mr-2" />
                    Gestionar Usuarios
                  </Button>
                </Link>
              )}
              <Button
                onClick={() => setShowNewProvinciaModal(true)}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Nueva Provincia
              </Button>
              <Button
                variant="outline"
                className="bg-white text-blue-600 hover:bg-blue-50"
                onClick={() => setShowPasswordModal(true)}
              >
                Cambiar Contraseña
              </Button>
              <Button
                variant="outline"
                className="bg-white text-blue-600 hover:bg-blue-50"
                onClick={() => logout()}
              >
                Cerrar Sesión
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
                    value={(totalStakeholders / provincias.length || 0).toFixed(2)}
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
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Contraseña actual"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Nueva contraseña"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Confirmar nueva contraseña"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                Cambiar Contraseña
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ProvinciaCardProps {
  provincia: {
    id: number;
    nombre: string;
    stakeholders?: any[];
  };
  maxStakeholders: number;
  onDelete: () => void;
}

function ProvinciaCard({ provincia, maxStakeholders, onDelete }: ProvinciaCardProps) {
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
                                "¿Estás seguro de que deseas eliminar esta provincia? Se eliminarán también todos los stakeholders asociados."
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

interface StatItemProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}

function StatItem({ title, value, icon }: StatItemProps) {
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