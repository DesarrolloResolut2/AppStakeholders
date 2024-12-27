import { useForm, useFieldArray } from "react-hook-form";
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
import type { Stakeholder } from "@/lib/types";
import { User, Phone, Book, Linkedin, Plus, Trash2 } from 'lucide-react';

// Schemas de validación
const experienciaSchema = z.object({
  nombre_empresa: z.string().min(1, "El nombre de la empresa es requerido"),
  cargo: z.string().min(1, "El cargo es requerido"),
  anio_inicio: z.string().min(1, "El año de inicio es requerido"),
  anio_fin: z.string().optional(),
  descripcion: z.string().optional(),
  ubicacion: z.string().optional(),
});

const formacionSchema = z.object({
  nombre_institucion: z.string().min(1, "El nombre de la institución es requerido"),
  titulo: z.string().min(1, "El título es requerido"),
  anio_inicio: z.string().min(1, "El año de inicio es requerido"),
  anio_fin: z.string().optional(),
  descripcion: z.string().optional(),
  tipo: z.string().optional(),
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
    experiencia: z.array(experienciaSchema).optional(),
    formacion: z.array(formacionSchema).optional(),
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

  const { fields: experienciaFields, append: appendExperiencia, remove: removeExperiencia } =
    useFieldArray({
      control: form.control,
      name: "datos_especificos_linkedin.experiencia",
    });

  const { fields: formacionFields, append: appendFormacion, remove: removeFormacion } =
    useFieldArray({
      control: form.control,
      name: "datos_especificos_linkedin.formacion",
    });

  // Normalizar datos antes de enviar
  const normalizeData = (data: any[]) =>
    data.map((item) => ({
      ...item,
      anio_inicio: item.anio_inicio || 'N/A',
      anio_fin: item.anio_fin || 'Presente',
      ubicacion: item.ubicacion || '',
      descripcion: item.descripcion || '',
      tipo: item.tipo || '',
    }));

  const handleSubmit = (values: z.infer<typeof stakeholderSchema>) => {
    const experienciaNormalizada = values.datos_especificos_linkedin?.experiencia ?
      normalizeData(values.datos_especificos_linkedin.experiencia) : [];
    const formacionNormalizada = values.datos_especificos_linkedin?.formacion ?
      normalizeData(values.datos_especificos_linkedin.formacion) : [];

    const datosNormalizados = {
      ...values,
      datos_especificos_linkedin: {
        ...values.datos_especificos_linkedin,
        experiencia: experienciaNormalizada,
        formacion: formacionNormalizada,
      },
      provincia_id: provinciaId,
    };

    onSubmit(datosNormalizados as Omit<Stakeholder, "id">);
  };

  const handleAddExperiencia = () => {
    appendExperiencia({
      nombre_empresa: '',
      cargo: '',
      anio_inicio: '',
      anio_fin: '',
      descripcion: '',
      ubicacion: '',
    });
  };

  const handleAddFormacion = () => {
    appendFormacion({
      nombre_institucion: '',
      titulo: '',
      anio_inicio: '',
      anio_fin: '',
      descripcion: '',
      tipo: '',
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <ScrollArea className="h-[calc(90vh-200px)] pr-4">
          <div className="space-y-6 pb-8">
            <Tabs defaultValue="principal" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="principal" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Principal
                </TabsTrigger>
                <TabsTrigger value="contacto" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contacto
                </TabsTrigger>
                <TabsTrigger value="detalles" className="flex items-center gap-2">
                  <Book className="w-4 h-4" />
                  Detalles
                </TabsTrigger>
                <TabsTrigger value="linkedin" className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </TabsTrigger>
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
                <Card className="p-4">
                  <div className="space-y-4">
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

                    {/* Sección de Experiencia */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Experiencia</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddExperiencia}
                          className="flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Añadir Experiencia
                        </Button>
                      </div>

                      {experienciaFields.map((field, index) => (
                        <Card key={field.id} className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-sm font-medium">
                              Experiencia {index + 1}
                            </h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExperiencia(index)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`datos_especificos_linkedin.experiencia.${index}.nombre_empresa`}
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
                              name={`datos_especificos_linkedin.experiencia.${index}.cargo`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cargo</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Cargo o puesto" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`datos_especificos_linkedin.experiencia.${index}.anio_inicio`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Año de inicio</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="YYYY" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`datos_especificos_linkedin.experiencia.${index}.anio_fin`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Año de fin</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="YYYY (o dejar vacío si es actual)" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`datos_especificos_linkedin.experiencia.${index}.ubicacion`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Ubicación</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Ciudad, País" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name={`datos_especificos_linkedin.experiencia.${index}.descripcion`}
                            render={({ field }) => (
                              <FormItem className="mt-4">
                                <FormLabel>Descripción</FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    placeholder="Describe tus responsabilidades y logros..."
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </Card>
                      ))}

                      {/* Sección de Formación */}
                      <div className="flex justify-between items-center mt-8">
                        <h3 className="text-lg font-semibold">Formación</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddFormacion}
                          className="flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Añadir Formación
                        </Button>
                      </div>

                      {formacionFields.map((field, index) => (
                        <Card key={field.id} className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-sm font-medium">
                              Formación {index + 1}
                            </h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFormacion(index)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`datos_especificos_linkedin.formacion.${index}.nombre_institucion`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Institución</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Nombre de la institución" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`datos_especificos_linkedin.formacion.${index}.titulo`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Título</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Título obtenido" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`datos_especificos_linkedin.formacion.${index}.anio_inicio`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Año de inicio</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="YYYY" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`datos_especificos_linkedin.formacion.${index}.anio_fin`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Año de fin</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="YYYY (o dejar vacío si es actual)" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`datos_especificos_linkedin.formacion.${index}.tipo`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tipo de formación</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecciona el tipo" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="grado">Grado</SelectItem>
                                      <SelectItem value="master">Máster</SelectItem>
                                      <SelectItem value="doctorado">Doctorado</SelectItem>
                                      <SelectItem value="curso">Curso</SelectItem>
                                      <SelectItem value="certificacion">
                                        Certificación
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name={`datos_especificos_linkedin.formacion.${index}.descripcion`}
                            render={({ field }) => (
                              <FormItem className="mt-4">
                                <FormLabel>Descripción</FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    placeholder="Describe los detalles de tu formación..."
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
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
                  </div>
                </Card>
              </TabsContent>
              </Tabs>
          </div>
        </ScrollArea>
        <div className="sticky bottom-0 bg-background pt-4 border-t">
          <Button type="submit" className="w-full">
            Guardar
          </Button>
        </div>
      </form>
    </Form>
  );
}