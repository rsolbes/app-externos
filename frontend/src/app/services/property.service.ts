import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';
import { Property } from '../components/models/property.model';

export interface SearchParams {
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  type?: string;
  habitaciones?: number;
  banos?: number;
  estacionamientos?: number;
}

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private http = inject(HttpClient);
  private base = 'http://localhost:5000/api/propiedades';

  // Mapea la respuesta de la API a un formato de propiedad que tu aplicación entiende
  private mapProperty(item: any): Property {
    return {
      ...item,
      // Ya NO mapear image_url porque usamos 'Imagen' directamente de la BD
      // El campo 'Imagen' ya viene en la respuesta del backend
    };
  }

  // Devuelve la lista de propiedades desde la API
  list(): Observable<Property[]> {
    return this.http.get<any>(this.base).pipe(
      map(response => {
        if (response && response.properties && Array.isArray(response.properties)) {
          return response.properties.map((item: any) => this.mapProperty(item));
        }
        return [];
      }),
      catchError(err => {
        console.error('Error al conectar con el backend', err);
        return of([]); // En caso de error, devuelve un array vacío
      })
    );
  }

  // Obtiene una propiedad específica por su ID
  get(id: number): Observable<Property | null> {
    return this.list().pipe(
      map(properties => properties.find(p => p.id === id) || null)
    );
  }

  // --- FUNCIÓN DE BÚSQUEDA ---
  search(params: SearchParams): Observable<Property[]> {
    return this.list().pipe(
      map(properties => {
        return properties.filter(p => {
          
          // --- Filtro de Texto (q) ---
          if (params.q) {
            const query = params.q.toLowerCase();
            const inTitulo = p.titulo && p.titulo.toLowerCase().includes(query);
            const inDesc = p.descripcion && p.descripcion.toLowerCase().includes(query);
            if (!inTitulo && !inDesc) {
              return false;
            }
          }

          // --- Filtro de Precio ---
          const precioPropiedad = p.precio || p.precio_alquiler;
          if (precioPropiedad != null) {
            if (params.minPrice != null && precioPropiedad < params.minPrice) {
              return false;
            }
            if (params.maxPrice != null && precioPropiedad > params.maxPrice) {
              return false;
            }
          } else {
            if (params.minPrice != null || params.maxPrice != null) {
              return false;
            }
          }

          // --- Filtros Numéricos ---
          if (params.habitaciones != null && p.habitaciones < params.habitaciones) {
            return false;
          }
          if (params.banos != null && p.banos < params.banos) {
            return false;
          }
          if (params.estacionamientos != null && p.estacionamientos < params.estacionamientos) {
            return false;
          }

          return true;
        });
      })
    );
  }

  // Lista las propiedades en alquiler
  listRentals(): Observable<Property[]> {
    return this.list().pipe(
      map(rows => rows.filter(p => p.precio_alquiler != null && p.precio_alquiler > 0))
    );
  }
}