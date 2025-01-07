import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Stakeholder, ExperienciaFormacion } from "@/lib/types";
import { User, Phone, Book, Linkedin, Upload } from 'lucide-react'
import { useCallback } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";


const experienciaSchema = z.object({
  title: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  description: z.string().optional()
});

const formacionSchema = z.object({
  title: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  description: z.string().optional()
});

const stakeholderSchema = z.object({
  nombre: z.string().optional(),
  datos_contacto: z.object({
    linkedin: z.string().optional(),
    organizacion_principal: z.string().optional(),
    otras_organizaciones: z.string().optional(),
    persona_contacto: z.string().optional(),
    email: z.string().optional(),
    website: z.string().optional(),
    telefono: z.string().optional(),
  }).optional(),
  objetivos_generales: z.string().optional(),
  intereses_expectativas: z.string().optional(),
  nivel_influencia: z.string().optional(),
  nivel_interes: z.string().optional(),
  recursos: z.string().optional(),
  expectativas_comunicacion: z.string().optional(),
  relaciones: z.string().optional(),
  riesgos_conflictos: z.string().optional(),
  datos_especificos_linkedin: z.object({
    about_me: z.string().optional(),
    headline: z.string().optional(),
    experiencia: z.array(experienciaSchema).optional().default([]),
    formacion: z.array(formacionSchema).optional().default([]),
    otros_campos: z.string().optional(),
  }).optional(),
}).partial();

interface Props {
  provinciaId: number;
  stakeholder?: Stakeholder;
  onSubmit: (data: Omit<Stakeholder, "id">) => void;
}

export function StakeholderForm({ provinciaId, stakeholder, onSubmit }: Props) {
  const form = useForm<z.infer<typeof stakeholderSchema>>({
    resolver: zodResolver(stakeholderSchema),
    defaultValues: {
      nombre: stakeholder?.nombre || '',
      datos_contacto: {
        linkedin: stakeholder?.datos_contacto?.linkedin || '',
        organizacion_principal: stakeholder?.datos_contacto?.organizacion_principal || '',
        otras_organizaciones: stakeholder?.datos_contacto?.otras_organizaciones || '',
        persona_contacto: stakeholder?.datos_contacto?.persona_contacto || '',
        email: stakeholder?.datos_contacto?.email || '',
        website: stakeholder?.datos_contacto?.website || '',
        telefono: stakeholder?.datos_contacto?.telefono || '',
      },
      objetivos_generales: stakeholder?.objetivos_generales || '',
      intereses_expectativas: stakeholder?.intereses_expectativas || '',
      nivel_influencia: stakeholder?.nivel_influencia || '',
      nivel_interes: stakeholder?.nivel_interes || '',
      recursos: stakeholder?.recursos || '',
      expectativas_comunicacion: stakeholder?.expectativas_comunicacion || '',
      relaciones: stakeholder?.relaciones || '',
      riesgos_conflictos: stakeholder?.riesgos_conflictos || '',
      datos_especificos_linkedin: {
        about_me: stakeholder?.datos_especificos_linkedin?.about_me || '',
        headline: stakeholder?.datos_especificos_linkedin?.headline || '',
        experiencia: stakeholder?.datos_especificos_linkedin?.experiencia || [],
        formacion: stakeholder?.datos_especificos_linkedin?.formacion || [],
        otros_campos: stakeholder?.datos_especificos_linkedin?.otros_campos || '',
      },
    },
  });

  const agregarExperiencia = () => {
    const experienciaActual = form.getValues('datos_especificos_linkedin.experiencia') || [];
    form.setValue('datos_especificos_linkedin.experiencia', [
      ...experienciaActual,
      { title: '', company: '', location: '', start_date: '', end_date: '', description: '' }
    ]);
  };

  const eliminarExperiencia = (index: number) => {
    const experienciaActual = form.getValues('datos_especificos_linkedin.experiencia') || [];
    form.setValue(
      'datos_especificos_linkedin.experiencia',
      experienciaActual.filter((_, i) => i !== index)
    );
  };

  const agregarFormacion = () => {
    const formacionActual = form.getValues('datos_especificos_linkedin.formacion') || [];
    form.setValue('datos_especificos_linkedin.formacion', [
      ...formacionActual,
      { title: '', company: '', location: '', start_date: '', end_date: '', description: '' }
    ]);
  };

  const eliminarFormacion = (index: number) => {
    const formacionActual = form.getValues('datos_especificos_linkedin.formacion') || [];
    form.setValue(
      'datos_especificos_linkedin.formacion',
      formacionActual.filter((_, i) => i !== index)
    );
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        console.log('JSON importado:', jsonData);

        const experiencia = jsonData.experiencia?.map((exp: any) => ({
          title: exp.title || "",
          company: exp.company || "",
          location: exp.location || "",
          start_date: exp.start_date || "",
          end_date: exp.end_date || "",
          description: exp.description || ""
        })) || [];

        const formacion = jsonData.formacion?.map((form: any) => ({
          title: form.title || "",
          company: form.company || "",
          location: form.location || "",
          start_date: form.start_date || "",
          end_date: form.end_date || "",
          description: form.description || ""
        })) || [];

        form.setValue('datos_especificos_linkedin.experiencia', experiencia);
        form.setValue('datos_especificos_linkedin.formacion', formacion);

      } catch (error) {
        console.error('Error al parsear el archivo JSON:', error);
      }
    };
    reader.readAsText(file);
  }, [form]);

  const handleSubmit = (values: z.infer<typeof stakeholderSchema>) => {
    onSubmit({
      ...values,
      provincia_id: provinciaId,
    } as Omit<Stakeholder, "id">);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <ScrollArea className="h-[calc(90vh-200px)] pr-4">
          <div className="space-y-6 pb-8">
            <Tabs defaultValue="principal" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="principal" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  <User className="w-4 h-4" />
                  Principal
                </TabsTrigger>
                <TabsTrigger value="contacto" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  <Phone className="w-4 h-4" />
                  Contacto
                </TabsTrigger>
                <TabsTrigger value="detalles" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  <Book className="w-4 h-4"/>
                  Detalles
                </TabsTrigger>
                <TabsTrigger value="linkedin" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </TabsTrigger>
              </TabsList>

              <TabsContent value="principal">
                {/* ... Principal Tab Content ... */}
              </TabsContent>
              <TabsContent value="contacto">
                {/* ... Contact Tab Content ... */}
              </TabsContent>
              <TabsContent value="detalles">
                {/* ... Details Tab Content ... */}
              </TabsContent>
              <TabsContent value="linkedin">
                <Card>
                  <CardHeader>
                    <CardTitle>Datos Específicos de LinkedIn</CardTitle>
                    <div className="mt-4">
                      <Input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        id="json-upload"
                        className="hidden"
                      />
                      <label htmlFor="json-upload">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => document.getElementById('json-upload')?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Importar datos desde JSON
                        </Button>
                      </label>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="datos_especificos_linkedin.about_me"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>About Me</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Descripción del perfil de LinkedIn..."
                            />
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
                            <Input
                              {...field}
                              placeholder="Título profesional en LinkedIn"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <FormLabel>Experiencia</FormLabel>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={agregarExperiencia}
                        >
                          Agregar Experiencia
                        </Button>
                      </div>

                      {form.watch('datos_especificos_linkedin.experiencia')?.map((exp, index) => (
                        <Card key={index} className="p-4">
                          <div className="space-y-4">
                            <div className="flex justify-end">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => eliminarExperiencia(index)}
                              >
                                Eliminar
                              </Button>
                            </div>
                            <FormField
                              control={form.control}
                              name={`datos_especificos_linkedin.experiencia.${index}.title`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cargo</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Cargo o posición" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`datos_especificos_linkedin.experiencia.${index}.company`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Empresa</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Nombre de la empresa" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                              <FormField
                              control={form.control}
                              name={`datos_especificos_linkedin.experiencia.${index}.location`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Ubicación</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Ubicación" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`datos_especificos_linkedin.experiencia.${index}.start_date`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Fecha de Inicio</FormLabel>
                                    <FormControl>
                                      <Input {...field} type="date" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`datos_especificos_linkedin.experiencia.${index}.end_date`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Fecha de Fin</FormLabel>
                                    <FormControl>
                                      <Input {...field} type="date" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={form.control}
                              name={`datos_especificos_linkedin.experiencia.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Descripción</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} placeholder="Descripción del cargo" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </Card>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <FormLabel>Formación</FormLabel>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={agregarFormacion}
                        >
                          Agregar Formación
                        </Button>
                      </div>

                      {form.watch('datos_especificos_linkedin.formacion')?.map((form, index) => (
                        <Card key={index} className="p-4">
                          <div className="space-y-4">
                            <div className="flex justify-end">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => eliminarFormacion(index)}
                              >
                                Eliminar
                              </Button>
                            </div>
                            <FormField
                              control={form.control}
                              name={`datos_especificos_linkedin.formacion.${index}.title`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Titulación</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Nombre de la titulación" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`datos_especificos_linkedin.formacion.${index}.company`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Universidad</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Nombre de la universidad" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`datos_especificos_linkedin.formacion.${index}.location`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Ubicación</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Ubicación" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`datos_especificos_linkedin.formacion.${index}.start_date`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Fecha de Inicio</FormLabel>
                                    <FormControl>
                                      <Input {...field} type="date" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`datos_especificos_linkedin.formacion.${index}.end_date`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Fecha de Fin</FormLabel>
                                    <FormControl>
                                      <Input {...field} type="date" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={form.control}
                              name={`datos_especificos_linkedin.formacion.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Descripción</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} placeholder="Descripción de la formación" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </Card>
                      ))}
                    </div>

                    <FormField
                      control={form.control}
                      name="datos_especificos_linkedin.otros_campos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Otros Campos</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Información adicional..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
        <div className="flex justify-end">
          <Button type="submit">Guardar Stakeholder</Button>
        </div>
      </form>
    </Form>
  );
}