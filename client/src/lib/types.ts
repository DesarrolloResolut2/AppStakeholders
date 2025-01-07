export interface Provincia {
  id: number;
  nombre: string;
  stakeholders?: Stakeholder[];
}

export interface ExperienciaFormacion {
  title?: string;
  company?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

export interface Stakeholder {
  id?: number;
  provincia_id: number;
  nombre?: string;
  datos_contacto?: {
    linkedin?: string;
    organizacion_principal?: string;
    otras_organizaciones?: string;
    persona_contacto?: string;
    email?: string;
    website?: string;
    telefono?: string;
  };
  objetivos_generales?: string;
  intereses_expectativas?: string;
  nivel_influencia?: string;
  nivel_interes?: string;
  recursos?: string;
  expectativas_comunicacion?: string;
  relaciones?: string;
  riesgos_conflictos?: string;
  datos_especificos_linkedin?: {
    about_me?: string;
    headline?: string;
    experiencia?: ExperienciaFormacion[];
    formacion?: ExperienciaFormacion[];
    otros_campos?: string;
  };
}