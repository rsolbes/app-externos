// property-card.ts - CON DEBUG Y LOGGING
import { Component, Input, inject, OnInit, OnDestroy } from '@angular/core';
import { Property } from '../models/property.model';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-property-card',
  templateUrl: './property-card.html',
  styleUrls: ['./property-card.scss'],
  standalone: true,
  imports: [RouterModule, CommonModule, CurrencyPipe, DecimalPipe, IonicModule]
})
export class PropertyCardComponent implements OnInit, OnDestroy {
  @Input() data!: Property;

  private router = inject(Router);
  private favoritesService = inject(FavoritesService);

  imageLoaded: boolean = false;
  favoriteAnimation: boolean = false;
  imageSrc: string = '';

  ngOnInit() {
    console.log('PropertyCard initialized with data:', this.data);

    this.imageSrc = this.getImageSource();

    if (this.imageSrc) {
      const img = new Image();
      img.onload = () => {
        this.imageLoaded = true;
      };
      img.onerror = () => {
        console.warn('Error cargando imagen para propiedad:', this.data?.id);
        this.imageLoaded = true;
        this.imageSrc = 'assets/placeholder-property.jpg';
      };
      img.src = this.imageSrc;
    } else {
      this.imageSrc = 'assets/placeholder-property.jpg';
      this.imageLoaded = true;
    }
  }

  getImageSource(): string {
    if (this.data?.imagenes && this.data.imagenes.length > 0) {
      const principalImage = this.data.imagenes.find(img => img.es_principal);
      if (principalImage && principalImage.url) {
        return principalImage.url;
      }
      if (this.data.imagenes[0] && this.data.imagenes[0].url) {
        return this.data.imagenes[0].url;
      }
    }
    return 'assets/placeholder-property.jpg';
  }

  waUrl(p: Property): string {
    const message = encodeURIComponent(`Hola, me interesa la propiedad: ${p.titulo}`);
    return `https://wa.me/5218330000000?text=${message}`;
  }

  price(p: Property): number | null {
    return p.precio ?? p.precio_alquiler ?? null;
  }

  verEnGoogleMaps(p: Property, event: MouseEvent): void {
    event.stopPropagation();
    if (p.lat && p.lng) {
      const lat = parseFloat(p.lat);
      const lng = parseFloat(p.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        const url = `https://www.google.com/maps?q=${lat},${lng}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        console.warn("Coordenadas inválidas.");
      }
    } else {
      console.warn("No se han proporcionado las coordenadas de la propiedad.");
    }
  }

  openDetails(): void {
    if (this.data && this.data.id) {
      this.router.navigate(['/property-detail', this.data.id]);
    }
  }

  onKeyEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.openDetails();
    }
  }

  // ===== FAVORITOS CON DEBUG =====
  toggleFavorite(event: MouseEvent): void {
    event.stopPropagation();
    console.log('toggleFavorite clicked for property:', this.data?.id);

    if (!this.data || !this.data.id) {
      console.warn('No data or id available');
      return;
    }

    // Usa el servicio centralizado
    this.favoritesService.toggle(this.data.id);
    console.log('Favorite toggled. Is now favorite?', this.isFavorite());

    // Activar animación
    this.favoriteAnimation = true;
    setTimeout(() => this.favoriteAnimation = false, 600);
  }

  isFavorite(): boolean {
    if (!this.data || !this.data.id) {
      return false;
    }
    const result = this.favoritesService.isFav(this.data.id);
    console.log('isFavorite check for', this.data.id, ':', result);
    return result;
  }

  hasFeatures(): boolean {
    return !!(this.data?.habitaciones || this.data?.m2_construccion);
  }

  ngOnDestroy(): void {
    if (this.imageSrc && this.imageSrc.startsWith('blob:')) {
      URL.revokeObjectURL(this.imageSrc);
    }
  }
}
