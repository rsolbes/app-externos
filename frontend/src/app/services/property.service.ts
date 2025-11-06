import { Injectable, inject } from '@angular/core';
// Importamos HttpParams
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';
import { Property } from '../components/models/property.model';

// Esta interfaz se mantiene igual
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

  // --- IDs DE TU BASE DE DATOS ---
  private ID_TIPO_VENTA = '1';
  private ID_TIPO_RENTA = '2';
  private ID_TIPO_TRASPASO = '3';

  // --- CAMBIO: IDs a excluir ---
  // Unimos "En Borrador" (2), "Vendida" (3) y "Rentada" (4)
  private ESTADOS_EXCLUIDOS = '2,3,4';
  // -------------------------------

  // Mapea la respuesta de la API... (sin cambios)
  private mapProperty(item: any): Property {
    return {
      ...item,
      // Ya NO mapear image_url porque usamos 'Imagen' directamente de la BD
      // El campo 'Imagen' ya viene en la respuesta del backend
    };
  }

  // --- NUEVA FUNCIÓN PRIVADA ---
  // Función genérica para obtener propiedades filtradas... (sin cambios)
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

  // --- MODIFICADO ---
  // Devuelve la lista de propiedades para "Comprar"
  list(): Observable<Property[]> {
    const params = new HttpParams()
      .set('tipo_negocio_id', this.ID_TIPO_VENTA)
      // Usamos 'estado_publicacion_id__not_in' para excluir la lista
      .set('estado_publicacion_id__not_in', this.ESTADOS_EXCLUIDOS);

    return this.listFiltered(params);
  }

  // Obtiene una propiedad específica por su ID... (sin cambios)
  get(id: number): Observable<Property | null> {
    // Es mucho más eficiente pedir solo 1 propiedad al backend
    // Corregimos el tipo de lo que esperamos (Property) y el map
    return this.http.get<Property>(`${this.base}/${id}`).pipe(
      map(response => {
        // La respuesta ES la propiedad, no está dentro de "response.property"
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

  // Incrementa las vistas de una propiedad... (sin cambios)
  incrementViews(id: number): Observable<any> {
    // Esta llamada fallará si tu backend no tiene esta ruta.
    // Necesitas crear una ruta como: POST /api/propiedades/:id/view
    return this.http.post(`${this.base}/${id}/view`, {}).pipe(
      catchError(err => {
        // No queremos que la app crashee si esto falla, solo logueamos
        console.warn(`Error al incrementar vistas (frontend)`, err);
        return of(null); // Devuelve null para que el subscribe() no falle
      })
    );
  }


  // --- FUNCIÓN DE BÚSQUEDA (sin cambios en la lógica) ---
  // Esta función llama a this.list(), que AHORA ya viene filtrado
  // por el backend (solo "Venta" y sin "Borrador/Vendido/Rentado").
  // Luego, aplica los filtros de la búsqueda (precio, habs, etc.)
  // en el frontend sobre esa lista ya filtrada.
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
            // Si la propiedad no tiene precio, y el usuario filtró por precio, descartar
            if (params.minPrice != null || params.maxPrice != null) {
              return false;
            }
          }

          // --- Filtros Numéricos (CORREGIDOS) ---
          // Si el filtro existe Y (la propiedad no tiene el dato O la propiedad tiene menos de lo pedido)
          if (params.habitaciones != null && (p.habitaciones == null || p.habitaciones < params.habitaciones)) {
            return false;
          }
          if (params.banos != null && (p.banos == null || p.banos < params.banos)) {
            return false;
          }
          if (params.estacionamientos != null && (p.estacionamientos == null || p.estacionamientos < params.estacionamientos)) {
            return false;
          }

          return true;
        });
      })
    );
  }

  // --- MODIFICADO ---
  // Lista las propiedades en alquiler
  listRentals(): Observable<Property[]> {
    const params = new HttpParams()
      .set('tipo_negocio_id', this.ID_TIPO_RENTA)
      // Usamos 'estado_publicacion_id__not_in' para excluir la lista
      .set('estado_publicacion_id__not_in', this.ESTADOS_EXCLUIDOS);

    return this.listFiltered(params);
  }

  // --- MODIFICADO (es la nueva función que creamos) ---
  // Lista las propiedades en traspaso
  listTraspasos(): Observable<Property[]> {
    const params = new HttpParams()
      .set('tipo_negocio_id', this.ID_TIPO_TRASPASO)
      // Usamos 'estado_publicacion_id__not_in' para excluir la lista
      .set('estado_publicacion_id__not_in', this.ESTADOS_EXCLUIDOS);

    return this.listFiltered(params);
  }

  listAllPublic(): Observable<Property[]> {
    const params = new HttpParams()
      // NO filtramos por tipo_negocio_id
      .set('estado_publicacion_id__not_in', this.ESTADOS_EXCLUIDOS);

    return this.listFiltered(params);
  }
}
