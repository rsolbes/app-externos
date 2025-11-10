import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Property } from '../models/property.model';
import { PropertyCardComponent } from '../property-card/property-card';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule, PropertyCardComponent],
  template: `
    <div class="list-container">
      
      @if (!loading && properties && properties.length > 0) {
        @for (prop of properties; track prop.id) {
          <app-property-card [data]="prop"></app-property-card>
        }
      } @else if (!loading && (!properties || properties.length === 0)) {
        <div class="empty-state">
          <ion-icon name="home-outline"></ion-icon>
          <p>No hay propiedades para mostrar.</p>
        </div>
      } @else if (loading) {
        <div class="empty-state">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Cargando propiedades...</p>
        </div>
      }
    </div>
  `,
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
  @Input() properties: Property[] = [];
  @Input() loading: boolean = true;
}