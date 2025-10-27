// property.model.ts
// Modelo basado en tu estructura de base de datos de Supabase

// Interface para el objeto de imagen que viene en el array JSON
export interface PropertyImage {
  id: number;
  url: string;
  nombre_archivo: string;
  es_principal: boolean;
  orden: number;
}

export interface Property {
  [x: string]: any;
  
  // ID principal
  id?: number;
  
  // Información básica
  titulo: string | null;
  descripcion: string | null;
  
  // Precios
  precio: number | null;
  precio_alquiler: number | null;
  valor_administracion: number | null;
  
  // Características
  habitaciones: number;
  alcobas: number;
  banos: number;
  banos_medios: number;
  estacionamientos: number;
  anio_construccion: number | null;
  piso: string | null;
  
  // Medidas
  m2_terreno: number;
  m2_construccion: number;
  m2_privada: number;
  
  // Ubicación
  direccion: string | null;
  codigo_postal: string | null;
  lat: string | null;
  lng: string | null;
  
  // Documentación
  registro_publico: string | null;
  convenio_url: string | null;
  convenio_validado: boolean;
  
  // --- CAMPO DE IMAGEN CORREGIDO ---
  // Ya no es 'Imagen', ahora es un array 'imagenes'
  imagenes: PropertyImage[] | null;
  
  // Relaciones (IDs) - coinciden con los nombres de tu tabla
  tipo_negocio_id: number | string | null;
  tipo_propiedad_id: number | string | null;
  estado_publicacion_id: number | string | null;
  captado_por_agente_id: number | string | null;
  moneda_id: number | string | null;
  frecuencia_alquiler_id: number | string | null;
  estado_fisico_id: number | string | null;
  estado_id: number | string | null;
  ciudad_id: number | string | null;
  zona_id: number | string | null;
  agente_id: number | string | null;
  agente_externo_id: number | string | null;
  validado_por_usuario_id: number | string | null;
}
