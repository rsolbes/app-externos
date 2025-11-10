import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Property } from '../../components/models/property.model';
import { PropertyListComponent } from '../../components/property-list/property-list';
import { PropertyService } from '../../services/property.service';
import { SearchFilterComponent, SearchParams } from '../../components/search-filter/search-filter';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    PropertyListComponent,
    SearchFilterComponent,
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class HomePage {
  private api = inject(PropertyService);

  properties: Property[] = [];
  private allProperties: Property[] = []; // Cache para resetear
  loading = true;

  // ID para Venta
  private readonly TIPO_NEGOCIO_ID = '1';

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading = true;
    this.api.list().subscribe({
      next: (data) => {
        this.properties = data;
        this.allProperties = data; // Guarda el estado inicial
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar propiedades', err);
        this.loading = false;
      },
    });
  }

  onSearch(params: SearchParams): void {
    this.loading = true;
    // --- CORRECCIÓN AQUÍ ---
    // Añade this.TIPO_NEGOCIO_ID como segundo argumento
    this.api.search(params, this.TIPO_NEGOCIO_ID).subscribe({
      next: (data) => {
        this.properties = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al buscar propiedades', err);
        this.loading = false;
      }
    });
  }

  onReset(): void {
    // Resetea la lista a la carga inicial
    this.properties = [...this.allProperties];
  }
}