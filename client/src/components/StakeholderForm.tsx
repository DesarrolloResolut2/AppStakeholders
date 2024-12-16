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
  nombre: z.string().optional().or(z.literal("")),
  datos_contacto: z
    .object({
      linkedin: z.string().url("URL de LinkedIn inválida").optional().or(z.literal("")),
      organizacion_principal: z.string().optional().or(z.literal("")),
      otras_organizaciones: z.string().optional().or(z.literal("")),
      persona_contacto: z.string().optional().or(z.literal("")),
      email: z.string().email("Email inválido").optional().or(z.literal("")),
      website: z.string().url("URL inválida").optional().or(z.literal("")),
      telefono: z.string().optional().or(z.literal("")),
    })
    .optional()
    .or(z.literal({}))
    .or(z.undefined()),
  objetivos_generales: z.string().optional().or(z.literal("")),
  intereses_expectativas: z.string().optional().or(z.literal("")),
  nivel_influencia: z.string().optional().or(z.literal("")),
  nivel_interes: z.string().optional().or(z.literal("")),
  recursos: z.string().optional().or(z.literal("")),
  expectativas_comunicacion: z.string().optional().or(z.literal("")),
  relaciones: z.string().optional().or(z.literal("")),
  riesgos_conflictos: z.string().optional().or(z.literal("")),
  datos_especificos_linkedin: z
    .object({
      about_me: z.string().optional().or(z.literal("")),
      headline: z.string().optional().or(z.literal("")),
      experiencia: z.string().optional().or(z.literal("")),
      formacion: z.string().optional().or(z.literal("")),
      otros_campos: z.string().optional().or(z.literal("")),
    })
    .optional()
    .or(z.literal({}))
    .or(z.undefined()),
});

interface Props {
  provinciaId: number;
  stakeholder?: Stakeholder;
  onSubmit: (data: Omit<Stakeholder, "id">) => void;
}

export function StakeholderForm({ provinciaId, stakeholder, onSubmit }: Props) {
  const form = useForm<z.infer<typeof stakeholderSchema>>({
    resolver: zodResolver(stakeholderSchema),
    defaultValues: stakeholder || {},
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
                            <FormLabel>Website</FormLabel>
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