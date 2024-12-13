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
      const response = await fetch(`/api/stakeholders/${stakeholderId}`);
      const currentStakeholder = await response.json();
      
      await updateStakeholder(stakeholderId, {
        ...currentStakeholder,
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
        <div className="space-y-6">
          {/* Orientación Principal */}
          {jsonContent.orientacion_principal && (
            <div className="bg-secondary/20 p-4 rounded-lg">
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                Orientación Principal
              </h4>
              <p className="text-lg">{jsonContent.orientacion_principal}</p>
            </div>
          )}

          {/* Fortalezas Clave */}
          {jsonContent.fortalezas_clave && (
            <div className="bg-secondary/20 p-4 rounded-lg">
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                Fortalezas Clave
              </h4>
              <div className="space-y-2">
                {Object.entries(jsonContent.fortalezas_clave).map(([atributo, descripcion]) => (
                  <div key={atributo} className="border-l-2 border-primary/50 pl-3">
                    <p className="font-medium">{atributo}</p>
                    <p className="text-muted-foreground">{descripcion as string}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rasgos de Personalidad */}
          {jsonContent.rasgos_de_personalidad && (
            <div className="bg-secondary/20 p-4 rounded-lg">
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                Rasgos de Personalidad
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(jsonContent.rasgos_de_personalidad).map(([rasgo, valor]) => (
                  <div key={rasgo} className="bg-background/50 p-2 rounded">
                    <p className="font-medium">{rasgo}</p>
                    <p className="text-muted-foreground">{valor as string}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Motivaciones */}
          {jsonContent.motivaciones && (
            <div className="bg-secondary/20 p-4 rounded-lg">
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                Motivaciones
              </h4>
              <div className="space-y-2">
                {Object.entries(jsonContent.motivaciones).map(([motivo, descripcion]) => (
                  <div key={motivo} className="border-l-2 border-primary/50 pl-3">
                    <p className="font-medium">{motivo}</p>
                    <p className="text-muted-foreground">{descripcion as string}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Posibles Áreas de Mejora */}
          {jsonContent.posibles_areas_de_mejora && (
            <div className="bg-secondary/20 p-4 rounded-lg">
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                Posibles Áreas de Mejora
              </h4>
              <div className="space-y-2">
                {Object.entries(jsonContent.posibles_areas_de_mejora).map(([area, descripcion]) => (
                  <div key={area} className="border-l-2 border-primary/50 pl-3">
                    <p className="font-medium">{area}</p>
                    <p className="text-muted-foreground">{descripcion as string}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preferencias Comunicativas */}
          {jsonContent.preferencias_comunicativas && (
            <div className="bg-secondary/20 p-4 rounded-lg">
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                Preferencias Comunicativas
              </h4>
              <div className="space-y-2">
                {Object.entries(jsonContent.preferencias_comunicativas).map(([preferencia, descripcion]) => (
                  <div key={preferencia} className="border-l-2 border-primary/50 pl-3">
                    <p className="font-medium">{preferencia}</p>
                    <p className="text-muted-foreground">{descripcion as string}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
