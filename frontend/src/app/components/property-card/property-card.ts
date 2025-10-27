// property-card.ts
import { Component, Input, inject, OnInit, OnDestroy } from '@angular/core';
import { Property } from '../models/property.model';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-property-card',
  templateUrl: './property-card.html',
  styleUrls: ['./property-card.scss'],
  standalone: true,
  imports: [RouterModule, CommonModule, CurrencyPipe, DecimalPipe]
})
export class PropertyCardComponent implements OnInit, OnDestroy {
  @Input() data!: Property;
  private router = inject(Router);
  
  // Estado para animaciones e imagen
  imageLoaded: boolean = false;
  favoriteAnimation: boolean = false;
  imageSrc: string = ''; // ← Agregada esta propiedad que faltaba

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
        this.imageLoaded = true;
      };
      img.src = this.imageSrc;
    } else {
      this.imageLoaded = true;
    }
  }

  // Convertir imagen de base64/blob a URL utilizable
  getImageSource(): string {
    // Usar el campo 'Imagen' de tu base de datos Access
    const imagen = this.data?.Imagen || this.data?.['Imagen'];
    
    if (!imagen) {
      return 'assets/placeholder-property.jpg';
    }

    // Si ya es una URL completa (http/https)
    if (typeof imagen === 'string' && 
        (imagen.startsWith('http://') || imagen.startsWith('https://'))) {
      return imagen;
    }

    // Si es base64 puro (sin prefijo data:image) - caso más común desde Access
    if (typeof imagen === 'string' && !imagen.startsWith('data:')) {
      // Intentar detectar el tipo de imagen o usar jpeg por defecto
      const imageType = this.detectImageType(imagen);
      return `data:image/${imageType};base64,${imagen}`;
    }

    // Si ya tiene el prefijo data:image
    if (typeof imagen === 'string' && imagen.startsWith('data:')) {
      return imagen;
    }

    return 'assets/placeholder-property.jpg';
  }

  // Detectar tipo de imagen desde base64
  private detectImageType(base64: string): string {
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
    return `https://wa.me/521XXXXXXXXXX?text=${message}`;
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