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
import { Slider } from "@/components/ui/slider";
import type { Stakeholder } from "@/lib/types";

const stakeholderSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  datos_contacto: z.object({
    linkedin: z.string().url("URL de LinkedIn inválida").optional(),
    email: z.string().email("Email inválido").optional(),
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
    cargo: z.string().optional(),
    empresa: z.string().optional(),
    industria: z.string().optional(),
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
            name="datos_especificos_linkedin.cargo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo Actual</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ej: Director General" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="datos_especificos_linkedin.empresa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Empresa</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ej: Empresa S.A." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="datos_especificos_linkedin.industria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industria</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ej: Tecnología" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        <div className="flex justify-end">
          <Button type="submit" className="w-full md:w-auto">
            {stakeholder ? "Actualizar" : "Crear"} Stakeholder
          </Button>
        </div>
      </form>
    </Form>
  );
}
