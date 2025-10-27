// src/app/components/models/property.model.ts
export interface Property {
  id: number;
  titulo: string;
  descripcion?: string;
  precio?: number;
  precio_alquiler?: number;
  valor_administracion?: number;
  habitaciones?: number;
  alcobas?: number;
  banos?: number;
  banos_medios?: number;
  estacionamientos?: number;
  anio_construccion?: number;
  piso?: string;
  m2_terreno?: number;
  m2_construccion?: number;
  m2_privada?: number;
  direccion?: string;
  codigo_postal?: string;
  lat?: string;
  lng?: string;
  visitas?: number;
  registro_publico?: string;
  convenio_url?: string;
  convenio_validado?: boolean;
  fecha_validacion?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  tipo_negocio_id?: number | string;
  tipo_propiedad_id?: number;
  estado_publicacion_id?: number;
  captado_por_agente_id?: number;
  moneda_id?: number;
  frecuencia_alquiler_id?: number;
  estado_fisico_id?: number;
  estado_id?: number;
  ciudad_id?: number;
  zona_id?: number;
  agente_id?: number;
  agente_externo_id?: number;
  validado_por_usuario_id?: number;
  
  // Relaciones
  imagenes?: PropertyImage[];
  
  // Campo legacy (para compatibilidad con datos antiguos)
  Imagen?: string;
  
  // Campos adicionales opcionales
  [key: string]: any;
}

export interface PropertyImage {
  id: number;
  propiedad_id: number;
  url: string;
  nombre_archivo: string;
  es_principal: boolean;
  orden: number;
  created_at?: string;
}