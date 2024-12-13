import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { updateStakeholder } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface PersonalidadTabProps {
  stakeholderId: number;
  personalidad: any;
}

export function PersonalidadTab({ stakeholderId, personalidad }: PersonalidadTabProps) {
  const [jsonContent, setJsonContent] = useState(personalidad);
  const queryClient = useQueryClient();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsedJson = JSON.parse((e.target?.result as string) || "{}");
          setJsonContent(parsedJson);
          saveJsonToDatabase(parsedJson);
        } catch (error) {
          console.error("Error al parsear JSON:", error);
          alert("El archivo no es un JSON válido");
        }
      };
      reader.readAsText(file);
    }
  };

  const saveJsonToDatabase = async (jsonData: any) => {
    try {
      await updateStakeholder(stakeholderId, {
        provincia_id: stakeholderId,
        nombre: "temp",
        nivel_influencia: "Alto",
        nivel_interes: "Alto",
        personalidad: jsonData
      });
      queryClient.invalidateQueries({ queryKey: ["/provincias"] });
      alert("Archivo JSON guardado correctamente");
    } catch (error) {
      console.error("Error al guardar JSON:", error);
      alert("Hubo un problema al guardar el archivo JSON");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Personalidad</h2>
          <Button
            variant="outline"
            onClick={() => document.getElementById("jsonFileInput")?.click()}
            className="w-fit"
          >
            Subir archivo JSON
          </Button>
          <input
            id="jsonFileInput"
            type="file"
            accept="application/json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {jsonContent && (
        <div className="space-y-4">
          {Object.entries(jsonContent).map(([key, value]) => (
            <div key={key} className="bg-secondary/20 p-4 rounded-lg">
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
              </h4>
              <p className="text-lg">
                {typeof value === 'object' 
                  ? JSON.stringify(value, null, 2)
                  : String(value)
                }
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
