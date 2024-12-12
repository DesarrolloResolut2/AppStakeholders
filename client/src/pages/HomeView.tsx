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
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Gestión de Stakeholders por Provincia</h1>

      <form onSubmit={handleCreateProvincia} className="flex gap-4 mb-8">
        <Input
          value={newProvincia}
          onChange={(e) => setNewProvincia(e.target.value)}
          placeholder="Nombre de la nueva provincia"
          className="max-w-sm"
        />
        <Button type="submit">Agregar Provincia</Button>
      </form>

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
  );
}
