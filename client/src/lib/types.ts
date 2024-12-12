export interface Provincia {
  id: number;
  nombre: string;
  stakeholders?: Stakeholder[];
}

export interface Stakeholder {
  id?: number;
  provincia_id: number;
  nombre: string;
  datos_contacto?: {
    linkedin?: string;
    email?: string;
  };
  objetivos_generales?: string;
  intereses_expectativas?: string;
  nivel_influencia: number;
  nivel_interes: number;
  recursos?: string;
  expectativas_comunicacion?: string;
  relaciones?: string;
  riesgos_conflictos?: string;
  datos_especificos_linkedin?: {
    cargo?: string;
    empresa?: string;
    industria?: string;
  };
}
