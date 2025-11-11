import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';
import { Property } from '../components/models/property.model';

export interface SearchParams {
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  tipo_propiedad_id?: number;  // ID de la tabla tipos_propiedad
  estado_id?: number;           // ID de la tabla estados
  ciudad_id?: number;           // ID de la tabla ciudades
  habitaciones?: number;
  banos?: number;
  estacionamientos?: number;
}

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private http = inject(HttpClient);
  // Asegúrate que esta URL apunte a tu backend de casita-azul-app
  private base = 'https://casita-azul-app.onrender.com/api/propiedades';

  // IDs de tipos de negocio
  private ID_TIPO_VENTA = '1';
  private ID_TIPO_RENTA = '2';
  private ID_TIPO_TRASPASO = '3';

  // Estados a excluir: En Borrador (2), Vendida (3), Rentada (4)
  private ESTADOS_EXCLUIDOS = '2,3,4';

  private mapProperty(item: any): Property {
    return {
      ...item,
    };
  }

  // Función genérica para obtener propiedades filtradas
  private listFiltered(params: HttpParams): Observable<Property[]> {
    return this.http.get<any>(this.base, { params }).pipe(
      map(response => {
        if (response && response.properties && Array.isArray(response.properties)) {
          return response.properties.map((item: any) => this.mapProperty(item));
        }
        return [];
      }),
      catchError(err => {
        console.error('Error al conectar con el backend', err);
        return of([]);
      })
    );
  }

  // Lista propiedades para VENTA
  list(): Observable<Property[]> {
    const params = new HttpParams()
      .set('tipo_negocio_id', this.ID_TIPO_VENTA)
      .set('estado_publicacion_id__not_in', this.ESTADOS_EXCLUIDOS);

    return this.listFiltered(params);
  }

  // Obtiene una propiedad específica por ID
  get(id: number): Observable<Property | null> {
    return this.http.get<Property>(`${this.base}/${id}`).pipe(
      map(response => {
        if (response) {
          return this.mapProperty(response);
        }
        return null;
      }),
      catchError(err => {
        console.error(`Error al obtener propiedad ${id}`, err);
        return of(null);
      })
    );
  }

  // Incrementa las vistas de una propiedad
  incrementViews(id: number): Observable<any> {
    return this.http.post(`${this.base}/${id}/view`, {}).pipe(
      catchError(err => {
        console.warn(`Error al incrementar vistas`, err);
        return of(null);
      })
    );
  }

  // BÚSQUEDA COMPLETA con filtros del backend Y frontend
  // Esta es la función corregida
  search(params: SearchParams, tipo_negocio_id: string): Observable<Property[]> {
    
    // 1. Construir parámetros para el backend (SOLO los que sí entiende)
    let httpParams = new HttpParams()
      .set('tipo_negocio_id', tipo_negocio_id)
      .set('estado_publicacion_id__not_in', this.ESTADOS_EXCLUIDOS);
    return this.listFiltered(httpParams).pipe(
      map(properties => {
        
        // 3. Aplicar TODOS los filtros adicionales en el FRONTEND
        return properties.filter(p => {

          // Filtro de texto
          if (params.q) {
            const query = params.q.toLowerCase();
            const inTitulo = p.titulo && p.titulo.toLowerCase().includes(query);
            const inDesc = p.descripcion && p.descripcion.toLowerCase().includes(query);
            if (!inTitulo && !inDesc) {
              return false;
            }
          }

          // --- LÓGICA DE FILTRADO AÑADIDA (INICIO) ---
          // Filtro de Tipo de Propiedad
          if (params.tipo_propiedad_id && p.tipo_propiedad_id !== Number(params.tipo_propiedad_id)) {
            return false;
          }

          // Filtro de Estado
          if (params.estado_id && p.estado_id !== Number(params.estado_id)) {
            return false;
          }

          // Filtro de Ciudad
          if (params.ciudad_id && p.ciudad_id !== Number(params.ciudad_id)) {
            return false;
          }
          // --- LÓGICA DE FILTRADO AÑADIDA (FIN) ---

          // Filtro de precio
          const precioPropiedad = p.precio || p.precio_alquiler;
          if (precioPropiedad != null) {
            if (params.minPrice != null && precioPropiedad < params.minPrice) {
              return false;
            }
            if (params.maxPrice != null && precioPropiedad > params.maxPrice) {
              return false;
            }
          } else {
            // Si la propiedad no tiene precio, y el usuario filtra por precio, se descarta
            if (params.minPrice != null || params.maxPrice != null) {
              return false;
            }
          }

          // Filtros numéricos
          if (params.habitaciones != null && (p.habitaciones == null || p.habitaciones < params.habitaciones)) {
            return false;
          }
          if (params.banos != null && (p.banos == null || p.banos < params.banos)) {
            return false;
          }
          if (params.estacionamientos != null && (p.estacionamientos == null || p.estacionamientos < params.estacionamientos)) {
            return false;
          }

          return true; // Si la propiedad pasa todos los filtros
        });
      })
    );
  }

  // Lista propiedades para RENTA
  listRentals(): Observable<Property[]> {
    const params = new HttpParams()
      .set('tipo_negocio_id', this.ID_TIPO_RENTA)
      .set('estado_publicacion_id__not_in', this.ESTADOS_EXCLUIDOS);

    return this.listFiltered(params);
  }

  // Lista propiedades para TRASPASO
  listTraspasos(): Observable<Property[]> {
    const params = new HttpParams()
      .set('tipo_negocio_id', this.ID_TIPO_TRASPASO)
      .set('estado_publicacion_id__not_in', this.ESTADOS_EXCLUIDOS);

    return this.listFiltered(params);
  }

  // Lista TODAS las propiedades públicas (sin filtro de tipo de negocio)
  listAllPublic(): Observable<Property[]> {
    const params = new HttpParams()
      .set('estado_publicacion_id__not_in', this.ESTADOS_EXCLUIDOS);

    return this.listFiltered(params);
  }
}