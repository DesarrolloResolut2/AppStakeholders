import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { updateStakeholder } from "@/lib/api";
import { Button } from "@/components/ui/button";
import type { Stakeholder } from "@/lib/types";

interface PersonalidadTabProps {
  stakeholderId: number;
  stakeholder: Stakeholder;
  personalidad: any;
}

export function PersonalidadTab({ stakeholderId, stakeholder, personalidad }: PersonalidadTabProps) {
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

  const validateJsonStructure = (jsonData: any) => {
    const requiredFields = {
      orientacion_principal: 'string',
      fortalezas_clave: 'object',
      rasgos_de_personalidad: 'object',
      motivaciones: 'object',
      posibles_areas_de_mejora: 'object',
      preferencias_comunicativas: 'object'
    };

    const errors = [];
    
    for (const [field, expectedType] of Object.entries(requiredFields)) {
      if (!jsonData[field]) {
        errors.push(`Falta el campo '${field}'`);
      } else if (typeof jsonData[field] !== expectedType) {
        errors.push(`El campo '${field}' debe ser de tipo ${expectedType}`);
      } else if (expectedType === 'object' && Object.keys(jsonData[field]).length === 0) {
        errors.push(`El campo '${field}' no puede estar vacío`);
      }
    }

    return errors;
  };

  const saveJsonToDatabase = async (jsonData: any) => {
    try {
      const validationErrors = validateJsonStructure(jsonData);
      
      if (validationErrors.length > 0) {
        throw new Error(`JSON inválido:\n${validationErrors.join('\n')}`);
      }

      // Actualizar solo el campo de personalidad
      await updateStakeholder(stakeholderId, {
        provincia_id: stakeholder.provincia_id,
        nombre: stakeholder.nombre,
        nivel_influencia: stakeholder.nivel_influencia,
        nivel_interes: stakeholder.nivel_interes,
        datos_contacto: stakeholder.datos_contacto,
        datos_especificos_linkedin: stakeholder.datos_especificos_linkedin,
        objetivos_generales: stakeholder.objetivos_generales,
        intereses_expectativas: stakeholder.intereses_expectativas,
        recursos: stakeholder.recursos,
        expectativas_comunicacion: stakeholder.expectativas_comunicacion,
        relaciones: stakeholder.relaciones,
        riesgos_conflictos: stakeholder.riesgos_conflictos,
        personalidad: jsonData
      });
      
      queryClient.invalidateQueries({ queryKey: ["/provincias"] });
      alert("Archivo JSON guardado correctamente");
    } catch (error) {
      console.error("Error al guardar JSON:", error);
      alert(error instanceof Error ? error.message : "Hubo un problema al guardar el archivo JSON");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Personalidad</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const exampleJson = {
                  orientacion_principal: "Descripción de la orientación principal",
                  fortalezas_clave: {
                    "fortaleza1": "Descripción de la fortaleza 1",
                    "fortaleza2": "Descripción de la fortaleza 2"
                  },
                  rasgos_de_personalidad: {
                    "proactividad": "Alto",
                    "empatía": "Medio",
                    "organización": "Alto"
                  },
                  motivaciones: {
                    "motivacion1": "Descripción de la motivación 1",
                    "motivacion2": "Descripción de la motivación 2"
                  },
                  posibles_areas_de_mejora: {
                    "area1": "Descripción del área de mejora 1",
                    "area2": "Descripción del área de mejora 2"
                  },
                  preferencias_comunicativas: {
                    "estilo1": "Descripción del estilo de comunicación 1",
                    "estilo2": "Descripción del estilo de comunicación 2"
                  }
                };
                const blob = new Blob([JSON.stringify(exampleJson, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'ejemplo_personalidad.json';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
              }}
            >
              Descargar Ejemplo JSON
            </Button>
            <Button
              variant="outline"
              onClick={() => document.getElementById("jsonFileInput")?.click()}
              className="w-fit"
            >
              Subir archivo JSON
            </Button>
          </div>
          <input
            id="jsonFileInput"
            type="file"
            accept="application/json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          El archivo JSON debe contener los siguientes campos: orientación principal, fortalezas clave, 
          rasgos de personalidad, motivaciones, áreas de mejora y preferencias comunicativas.
        </p>
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
