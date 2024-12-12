import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProvinceCard } from "@/components/ProvinceCard";
import { fetchProvincias, createProvincia } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function HomeView() {
  const [newProvincia, setNewProvincia] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: provincias = [], isLoading } = useQuery({
    queryKey: ["/provincias"],
    queryFn: fetchProvincias,
  });

  const createProvinciaMutation = useMutation({
    mutationFn: createProvincia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/provincias"] });
      setNewProvincia("");
      toast({
        title: "Provincia creada",
        description: "La provincia se ha creado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la provincia.",
        variant: "destructive",
      });
    },
  });

  const handleCreateProvincia = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProvincia.trim()) {
      createProvinciaMutation.mutate(newProvincia);
    }
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gradient-to-b from-background to-secondary/5">
      <div className="space-y-10">
        {/* Header y Resumen */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Gestión de Stakeholders por Provincia
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Sistema integral para la gestión y seguimiento de stakeholders, permitiendo un análisis detallado 
            por provincia y la exportación de datos en formato JSON.
          </p>
        </div>

        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-primary">
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {provincias.length}
              </p>
              <p className="text-sm font-medium">Provincias Registradas</p>
            </div>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-primary">
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {provincias.reduce((acc, p) => acc + (p.stakeholders?.length || 0), 0)}
              </p>
              <p className="text-sm font-medium">Total de Stakeholders</p>
            </div>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-primary">
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {Math.max(...provincias.map(p => p.stakeholders?.length || 0))}
              </p>
              <p className="text-sm font-medium">Máx. Stakeholders por Provincia</p>
            </div>
          </div>
        </div>

        {/* Formulario de Nueva Provincia */}
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Agregar Nueva Provincia</h2>
          <form onSubmit={handleCreateProvincia} className="flex gap-4">
            <Input
              value={newProvincia}
              onChange={(e) => setNewProvincia(e.target.value)}
              placeholder="Nombre de la nueva provincia"
              className="max-w-sm"
            />
            <Button type="submit">Agregar Provincia</Button>
          </form>
        </div>

        {/* Lista de Provincias */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Provincias Registradas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {provincias.map((provincia) => (
              <ProvinceCard
                key={provincia.id}
                provincia={provincia}
                onUpdate={() =>
                  queryClient.invalidateQueries({ queryKey: ["/provincias"] })
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
