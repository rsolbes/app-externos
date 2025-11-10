import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Property } from '../../components/models/property.model';
import { PropertyListComponent } from '../../components/property-list/property-list';
import { PropertyService } from '../../services/property.service';

@Component({
  selector: 'app-traspasos',
  standalone: true,
  imports: [CommonModule, IonicModule, PropertyListComponent],
  templateUrl: './traspasos.html',
  styleUrls: ['./traspasos.scss'],
})
export class TraspasosPage {
  private api = inject(PropertyService);

  // --- CAMBIOS AQUÍ ---
  properties: Property[] = []; // Ya no es un Observable
  loading = true;
  // --------------------

  ngOnInit() {
    this.loading = true;
    this.api.listTraspasos().subscribe({ // Llama a listTraspasos
      next: (data) => {
        this.properties = data; // Asigna los datos al array
        this.loading = false;   // Apaga el 'loading'
      },
      error: (err) => {
        console.error('Error al cargar traspasos', err);
        this.loading = false;   // Apaga el 'loading' en caso de error
      },
    });
  }
}
