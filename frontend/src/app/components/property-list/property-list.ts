import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Property } from '../models/property.model';
import { PropertyCardComponent } from '../property-card/property-card'; // Importamos la tarjeta

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule, CurrencyPipe, PropertyCardComponent], // Añadimos la tarjeta
  template: `
    <div class="list-container">
      
      <!-- 
        Comprobamos si 'loading' es falso 
        y si 'properties' existe y tiene items 
      -->
      @if (!loading && properties && properties.length > 0) {
        
        <!-- 
          Usamos 'app-property-card' 
          y le pasamos la propiedad [data]="prop"
        -->
        @for (prop of properties; track prop.id) {
          <app-property-card [data]="prop"></app-property-card>
        }

      } @else if (!loading && (!properties || properties.length === 0)) {
        
        <!-- Este es el mensaje que ves ahora -->
        <div class="empty-state">
          <ion-icon name="home-outline"></ion-icon>
          <p>No hay propiedades para mostrar.</p>
        </div>

      } @else if (loading) {
        
        <!-- Esto se muestra mientras 'loading' es true -->
        <div class="empty-state">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Cargando propiedades...</p>
        </div>
      }
    </div>
  `,
  // Estilos (los mismos de antes)
  styles: [
    `
      .list-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
        padding: 16px;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
      }
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        text-align: center;
        color: var(--ion-color-medium, #999);
        width: 100%;
        grid-column: 1 / -1;
      }
      .empty-state ion-icon {
        font-size: 4rem;
        margin-bottom: 16px;
      }
    `
  ]
})
export class PropertyListComponent {
  // @Input() permite que 'home.ts' le pase los datos
  @Input() properties: Property[] = [];
  
  // ******
  // ESTA LÍNEA ARREGLA EL ERROR de binding:
  // Declara que 'loading' es una propiedad que este componente puede recibir.
  // ******
  @Input() loading: boolean = true;
}
