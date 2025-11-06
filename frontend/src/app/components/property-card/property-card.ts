// property-card.ts
import { Component, Input, inject, OnInit, OnDestroy } from '@angular/core';
import { Property } from '../models/property.model';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { IonicModule } from '@ionic/angular'; // <-- 1. IMPORTA IONICMODULE

@Component({
  selector: 'app-property-card',
  templateUrl: './property-card.html',
  styleUrls: ['./property-card.scss'],
  standalone: true,
  // 2. AÑADE IONICMODULE A LOS IMPORTS
  imports: [RouterModule, CommonModule, CurrencyPipe, DecimalPipe, IonicModule]
})
export class PropertyCardComponent implements OnInit, OnDestroy {
  @Input() data!: Property;
  private router = inject(Router);

  // Estado para animaciones e imagen
  imageLoaded: boolean = false;
  favoriteAnimation: boolean = false;
  imageSrc: string = ''; // ← Propiedad para la URL de la imagen

  ngOnInit() {
    this.imageSrc = this.getImageSource();

    // Pre-cargar la imagen
    if (this.imageSrc) {
      const img = new Image();
      img.onload = () => {
        this.imageLoaded = true;
      };
      img.onerror = () => {
        console.warn('Error cargando imagen para propiedad:', this.data?.id);
        this.imageLoaded = true; // Marcar como cargada incluso si hay error (para quitar skeleton)
        this.imageSrc = 'assets/placeholder-property.jpg'; // Usar placeholder en caso de error
      };
      img.src = this.imageSrc;
    } else {
      this.imageSrc = 'assets/placeholder-property.jpg';
      this.imageLoaded = true;
    }
  }

  // --- LÓGICA DE IMAGEN CORREGIDA ---
  getImageSource(): string {
    // 1. Revisa si existe el array 'imagenes' y si tiene elementos
    if (this.data?.imagenes && this.data.imagenes.length > 0) {

      // 2. Busca la imagen marcada como 'es_principal'
      const principalImage = this.data.imagenes.find(img => img.es_principal);
      if (principalImage && principalImage.url) {
        return principalImage.url;
      }

      // 3. Si no hay principal, usa la primera imagen del array
      if (this.data.imagenes[0] && this.data.imagenes[0].url) {
        return this.data.imagenes[0].url;
      }
    }

    // 4. Si no hay nada, usa el placeholder
    return 'assets/placeholder-property.jpg';
  }

  // Detectar tipo de imagen (ya no es necesario si las URLs son directas)
  private detectImageType(base64: string): string {
    // ... esta función puede quedar por si acaso, pero la lógica de arriba ya no la usa
    const signatures: { [key: string]: string } = {
      '/9j/': 'jpeg',
      'iVBORw0KGgo': 'png',
      'R0lGODlh': 'gif',
      'UklGR': 'webp'
    };

    for (const [signature, type] of Object.entries(signatures)) {
      if (base64.startsWith(signature)) {
        return type;
      }
    }
    return 'jpeg'; // Por defecto
  }

  waUrl(p: Property): string {
    const message = encodeURIComponent(`Hola, me interesa la propiedad: ${p.titulo}`);
    // Asegúrate de cambiar este número
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

  // ===== SISTEMA DE FAVORITOS =====
  toggleFavorite(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.data || !this.data.id) return;

    const favorites = this.getFavorites();
    const index = favorites.indexOf(this.data.id.toString());

    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(this.data.id.toString());
    }

    localStorage.setItem('property_favorites', JSON.stringify(favorites));

    // Activar animación
    this.favoriteAnimation = true;
    setTimeout(() => this.favoriteAnimation = false, 600);
  }

  isFavorite(): boolean {
    if (!this.data || !this.data.id) return false;
    const favorites = this.getFavorites();
    return favorites.includes(this.data.id.toString());
  }

  private getFavorites(): string[] {
    const stored = localStorage.getItem('property_favorites');
    return stored ? JSON.parse(stored) : [];
  }

  // Helpers
  hasFeatures(): boolean {
    return !!(this.data?.habitaciones || this.data?.m2_construccion);
  }

  // Limpiar URLs de objetos cuando se destruya el componente
  ngOnDestroy(): void {
    if (this.imageSrc && this.imageSrc.startsWith('blob:')) {
      URL.revokeObjectURL(this.imageSrc);
    }
  }
}
