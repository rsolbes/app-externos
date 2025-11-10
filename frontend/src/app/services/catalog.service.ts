import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

export interface TipoPropiedad {
  id: number;
  nombre: string;
}

export interface Estado {
  id: number;
  nombre: string;
}

export interface Ciudad {
  id: number;
  nombre: string;
  estado_id: number;
}

export interface Catalogos {
  tipos_propiedad: TipoPropiedad[];
  estados: Estado[];
  ciudades: Ciudad[];
  estados_fisicos: any[];
  estados_publicacion: any[];
  frecuencias_alquiler: any[];
  monedas: any[];
  tipos_negocio: any[];
  zonas: any[];
  agentes: any[];
  agentes_externos: any[];
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5000/api';

  /**
   * Obtiene todos los catálogos del backend
   */
  getCatalogos(): Observable<Catalogos> {
    return this.http.get<Catalogos>(`${this.baseUrl}/catalogos`).pipe(
      catchError(err => {
        console.error('Error al cargar catálogos:', err);
        return of({
          tipos_propiedad: [],
          estados: [],
          ciudades: [],
          estados_fisicos: [],
          estados_publicacion: [],
          frecuencias_alquiler: [],
          monedas: [],
          tipos_negocio: [],
          zonas: [],
          agentes: [],
          agentes_externos: []
        });
      })
    );
  }

  /**
   * Obtiene solo los tipos de propiedad
   */
  getTiposPropiedad(): Observable<TipoPropiedad[]> {
    return this.getCatalogos().pipe(
      map(catalogos => catalogos.tipos_propiedad)
    );
  }

  /**
   * Obtiene solo los estados
   */
  getEstados(): Observable<Estado[]> {
    return this.getCatalogos().pipe(
      map(catalogos => catalogos.estados)
    );
  }

  /**
   * Obtiene solo las ciudades
   */
  getCiudades(): Observable<Ciudad[]> {
    return this.getCatalogos().pipe(
      map(catalogos => catalogos.ciudades)
    );
  }

  /**
   * Obtiene las ciudades filtradas por estado
   */
  getCiudadesByEstado(estadoId: number): Observable<Ciudad[]> {
    return this.getCiudades().pipe(
      map(ciudades => ciudades.filter(c => c.estado_id === estadoId))
    );
  }
}



 