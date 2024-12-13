import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Stakeholder } from "@/lib/types";

const stakeholderSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  datos_contacto: z.object({
    linkedin: z.string().url("URL de LinkedIn inválida").optional(),
    organizacion_principal: z.string().optional(),
    persona_contacto: z.string().optional(),
    email: z.string().email("Email inválido").optional(),
    website: z.string().url("URL inválida").optional(),
    telefono: z.string().optional(),
  }).optional(),
  objetivos_generales: z.string().optional(),
  intereses_expectativas: z.string().optional(),
  nivel_influencia: z.string().min(1, "El nivel de influencia es requerido"),
  nivel_interes: z.string().min(1, "El nivel de interés es requerido"),
  recursos: z.string().optional(),
  expectativas_comunicacion: z.string().optional(),
  relaciones: z.string().optional(),
  riesgos_conflictos: z.string().optional(),
  datos_especificos_linkedin: z.object({
    about_me: z.string().optional(),
    headline: z.string().optional(),
    experiencia: z.string().optional(),
    formacion: z.string().optional(),
    otros_campos: z.string().optional(),
  }).optional(),
});

interface Props {
  provinciaId: number;
  stakeholder?: Stakeholder;
  onSubmit: (data: Omit<Stakeholder, "id">) => void;
}

export function StakeholderForm({ provinciaId, stakeholder, onSubmit }: Props) {
  const form = useForm<z.infer<typeof stakeholderSchema>>({
    resolver: zodResolver(stakeholderSchema),
    defaultValues: stakeholder || {
      nombre: "",
      nivel_influencia: "",
      nivel_interes: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof stakeholderSchema>) => {
    onSubmit({
      ...values,
      provincia_id: provinciaId,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="space-y-6">
          {/* Información Principal */}
          <div className="bg-secondary/20 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Información Principal</h3>
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Stakeholder</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nombre completo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Datos de Contacto */}
          <div className="bg-secondary/20 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Datos de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="datos_contacto.linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://linkedin.com/in/..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="datos_contacto.organizacion_principal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organización principal</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nombre de la organización" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="datos_contacto.persona_contacto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Persona de Contacto</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nombre de la persona" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="datos_contacto.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="correo@ejemplo.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="datos_contacto.website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://ejemplo.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="datos_contacto.telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+34 XXX XXX XXX" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Información Detallada */}
          <div className="bg-secondary/20 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Información Detallada</h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="objetivos_generales"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objetivos Generales</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Describir los objetivos principales del stakeholder..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="intereses_expectativas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intereses y Expectativas</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Describir los intereses y expectativas específicas..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="nivel_influencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nivel de Influencia</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Describir el nivel de influencia del stakeholder..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nivel_interes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nivel de Interés</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Describir el nivel de interés del stakeholder..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="recursos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recursos Disponibles</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Detallar los recursos que el stakeholder puede aportar..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectativas_comunicacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expectativas de Comunicación</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Describir preferencias de comunicación..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="relaciones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relaciones con Otros Actores</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Describir las relaciones con otros stakeholders..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="riesgos_conflictos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Riesgos y Conflictos Potenciales</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Identificar posibles riesgos o conflictos..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Datos de LinkedIn */}
          <div className="bg-secondary/20 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Datos Específicos de LinkedIn</h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="datos_especificos_linkedin.about_me"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About Me</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Descripción del perfil de LinkedIn..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="datos_especificos_linkedin.headline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headline</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Título profesional en LinkedIn" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="datos_especificos_linkedin.experiencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experiencia</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Experiencia profesional..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="datos_especificos_linkedin.formacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Formación</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Formación académica..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="datos_especificos_linkedin.otros_campos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Otros Campos</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Información adicional..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="w-full md:w-auto">
            {stakeholder ? "Actualizar" : "Crear"} Stakeholder
          </Button>
        </div>
      </form>
    </Form>
  );
}
