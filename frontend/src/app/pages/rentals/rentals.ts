import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Property } from '../../components/models/property.model';
import { PropertyListComponent } from '../../components/property-list/property-list';
import { PropertyService } from '../../services/property.service';
import { SearchFilterComponent, SearchParams } from '../../components/search-filter/search-filter';

@Component({
  selector: 'app-rentals',
  standalone: true,
  // --- AÑADIDO SearchFilterComponent ---
  imports: [CommonModule, IonicModule, PropertyListComponent, SearchFilterComponent],
  templateUrl: './rentals.html',
  styleUrls: ['./rentals.scss'],
})
export class RentalsPage {
  private api = inject(PropertyService);

  properties: Property[] = [];
  private allProperties: Property[] = []; // Cache para resetear
  loading = true;

  // ID para Alquiler
  private readonly TIPO_NEGOCIO_ID = '2';

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading = true;
    this.api.listRentals().subscribe({
      next: (data) => {
        this.properties = data;
        this.allProperties = data; // Guarda el estado inicial
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar alquileres', err);
        this.loading = false;
      },
    });
  }

  // --- MÉTODO AÑADIDO PARA MANEJAR LA BÚSQUEDA ---
  onSearch(params: SearchParams): void {
    this.loading = true;
    this.api.search(params, this.TIPO_NEGOCIO_ID).subscribe({
      next: (data) => {
        this.properties = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al buscar alquileres', err);
        this.loading = false;
      }
    });
  }

  // --- MÉTODO AÑADIDO PARA RESETEAR ---
  onReset(): void {
    this.properties = [...this.allProperties];
  }
}