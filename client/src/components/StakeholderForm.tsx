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
  nivel_influencia: z.number().min(0).max(10),
  nivel_interes: z.number().min(0).max(10),
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
      nivel_influencia: 5,
      nivel_interes: 5,
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
                <Input {...field} />
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
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="objetivos_generales"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objetivos Generales</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nivel_influencia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nivel de Influencia (0-10)</FormLabel>
              <FormControl>
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={[field.value]}
                  onValueChange={([value]) => field.onChange(value)}
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
              <FormLabel>Nivel de Interés (0-10)</FormLabel>
              <FormControl>
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={[field.value]}
                  onValueChange={([value]) => field.onChange(value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">
          {stakeholder ? "Actualizar" : "Crear"} Stakeholder
        </Button>
      </form>
    </Form>
  );
}
