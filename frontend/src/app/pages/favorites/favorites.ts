import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
// --- ¡IMPORTA ESTOS OPERADORES! ---
import { map, combineLatest, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Property } from '../../components/models/property.model';
import { PropertyListComponent } from '../../components/property-list/property-list';
import { PropertyService } from '../../services/property.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, PropertyListComponent],
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.scss'],
})
export class FavoritesPage {
  private api = inject(PropertyService);
  private fav = inject(FavoritesService);

  // --- CAMBIOS AQUÍ ---
  properties: Property[] = []; // Ya no es un Observable
  loading = true;
  // --------------------

  ngOnInit() {
    this.loading = true;

    // Usamos combineLatest para esperar a que AMBOS observables (propiedades y favoritos)
    // tengan un valor.
    combineLatest([
      this.api.listAllPublic(),     // 1. Obtiene todas las propiedades públicas
      this.fav.favorites$           // 2. Obtiene la lista de IDs favoritos (usando favorites$ SÍ)
    ]).pipe(
      map(([properties, favs]) => {
        // 3. Filtra las propiedades basándose en los IDs de favoritos
        return properties.filter(p => favs.includes(p.id!));
      }),
      catchError(err => {
        // 4. En caso de error, oculta el 'loading' y devuelve una lista vacía
        console.error('Error al cargar favoritos', err);
        this.loading = false;
        return of([]); // Devuelve un array vacío
      })
    ).subscribe(filteredProps => {
        // 5. Cuando todo termina, asigna los datos y oculta el 'loading'
        this.properties = filteredProps;
        this.loading = false;
    });
  }
}
