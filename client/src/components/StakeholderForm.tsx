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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Stakeholder } from "@/lib/types";

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
    experiencia: z.string().optional(),
    formacion: z.string().optional(),
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
        experiencia: stakeholder?.datos_especificos_linkedin?.experiencia || '',
        formacion: stakeholder?.datos_especificos_linkedin?.formacion || '',
        otros_campos: stakeholder?.datos_especificos_linkedin?.otros_campos || '',
      },
    },
  });

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
                <TabsTrigger value="principal">Principal</TabsTrigger>
                <TabsTrigger value="contacto">Contacto</TabsTrigger>
                <TabsTrigger value="detalles">Detalles</TabsTrigger>
                <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
              </TabsList>

              <TabsContent value="principal">
                <Card>
                  <CardHeader>
                    <CardTitle>Información Principal</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                    <FormField
                      control={form.control}
                      name="nivel_influencia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nivel de Influencia</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar nivel de influencia" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Alto">Alto</SelectItem>
                              <SelectItem value="Medio">Medio</SelectItem>
                              <SelectItem value="Bajo">Bajo</SelectItem>
                            </SelectContent>
                          </Select>
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar nivel de interés" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Alto">Alto</SelectItem>
                              <SelectItem value="Medio">Medio</SelectItem>
                              <SelectItem value="Bajo">Bajo</SelectItem>
                            </SelectContent>
                          </Select>
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
                            <Textarea
                              {...field}
                              placeholder="Describir los objetivos principales del stakeholder..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="contacto">
                <Card>
                  <CardHeader>
                    <CardTitle>Datos de Contacto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="datos_contacto.linkedin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>LinkedIn URL</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="https://linkedin.com/in/..."
                              />
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
                              <Input
                                {...field}
                                placeholder="Nombre de la organización"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="datos_contacto.otras_organizaciones"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Otras organizaciones</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Otras organizaciones"
                              />
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
                              <Input
                                {...field}
                                placeholder="Nombre de la persona"
                              />
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
                              <Input
                                {...field}
                                type="email"
                                placeholder="correo@ejemplo.com"
                              />
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
                            <FormLabel>Website & Redes</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="https://ejemplo.com"
                              />
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
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="detalles">
                <Card>
                  <CardHeader>
                    <CardTitle>Información Detallada</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                   
                    
                    <FormField
                      control={form.control}
                      name="intereses_expectativas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Intereses y Expectativas</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Describir los intereses y expectativas específicas..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="recursos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recursos Disponibles</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Detallar los recursos que el stakeholder puede aportar..."
                            />
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
                            <Textarea
                              {...field}
                              placeholder="Describir preferencias de comunicación..."
                            />
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
                            <Textarea
                              {...field}
                              placeholder="Describir las relaciones con otros stakeholders..."
                            />
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
                            <Textarea
                              {...field}
                              placeholder="Identificar posibles riesgos o conflictos..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="linkedin">
                <Card>
                  <CardHeader>
                    <CardTitle>Datos Específicos de LinkedIn</CardTitle>
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
                    <FormField
                      control={form.control}
                      name="datos_especificos_linkedin.experiencia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experiencia</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Experiencia profesional..."
                            />
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
                            <Textarea
                              {...field}
                              placeholder="Formación académica..."
                            />
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
        <div className="sticky bottom-0 bg-background pt-4 border-t">
          <Button type="submit" className="w-full">
            {stakeholder ? "Actualizar" : "Crear"} Stakeholder
          </Button>
        </div>
      </form>
    </Form>
  );
}