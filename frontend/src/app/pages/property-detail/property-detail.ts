// property-detail.ts
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { Property } from '../../components/models/property.model';
import { PropertyService } from '../../services/property.service';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe],
  templateUrl: './property-detail.html',
  styleUrls: ['./property-detail.scss']
})
export class PropertyDetailPage implements OnInit {
  data: Property | null = null;
  loading = true;
  currentImageIndex = 0;
  images: string[] = [];

  private route = inject(ActivatedRoute);
  private api = inject(PropertyService);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      // Incrementar contador de visitas
      this.api.incrementViews(id).subscribe();

      this.api.get(id).subscribe({
        next: (property) => {
          if (property) {
            this.data = property;
            this.loading = false;
            // --- LÓGICA DE IMAGEN CORREGIDA ---
            this.processImages(property);
          } else {
            // Si la propiedad es null (ej. no encontrada)
            this.data = null;
            this.loading = false;
          }
        },
        error: () => {
          this.data = null;
          this.loading = false;
        }
      });
    }
  }

  // --- FUNCIÓN DE IMAGEN CORREGIDA ---
  private processImages(property: Property): void {
    this.images = [];

    // 1. Usar el array 'imagenes' de la propiedad
    if (property.imagenes && property.imagenes.length > 0) {
      // Mapea el array de objetos de imagen a un array de URLs
      this.images = property.imagenes
        .sort((a, b) => a.orden - b.orden) // Asegura el orden
        .map(img => img.url); // Extrae solo la URL
    }

    // 2. Si no hay ninguna imagen, usar placeholder
    if (this.images.length === 0) {
      this.images.push('assets/placeholder-property.jpg'); // Asegúrate que esta imagen exista
    }
  }

  get displayPrice(): number | null {
    if (!this.data) return null;
    return this.data.precio ?? this.data.precio_alquiler ?? null;
  }

  get tipoNegocio(): string {
    if (!this.data) return '';

    // Usar tipo_negocio_id: 1=VENTA, 2=RENTA
    if (this.data.tipo_negocio_id === 1 || this.data.tipo_negocio_id === '1') {
      return 'Venta';
    } else if (this.data.tipo_negocio_id === 2 || this.data.tipo_negocio_id === '2') {
      return 'Renta';
    }

    // Fallback
    return this.data.precio ? 'Venta' : this.data.precio_alquiler ? 'Renta' : 'Consultar';
  }

  nextImage(): void {
    if (this.images.length > 1) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
    }
  }

  prevImage(): void {
    if (this.images.length > 1) {
      this.currentImageIndex = this.currentImageIndex === 0
        ? this.images.length - 1
        : this.currentImageIndex - 1;
    }
  }

  verEnGoogleMaps(): void {
    if (this.data && this.data.lat && this.data.lng) {
      const lat = parseFloat(this.data.lat);
      const lng = parseFloat(this.data.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        const url = `https://www.google.com/maps?q=${lat},${lng}`;
        window.open(url, '_blank');
      } else {
        // No uses alert, usa console.warn
        console.warn("Coordenadas inválidas.");
      }
    } else {
      console.warn("No se han proporcionado las coordenadas de la propiedad.");
    }
  }

  contactarWhatsApp(): void {
    if (this.data) {
      const mensaje = `Hola, estoy interesado en la propiedad: ${this.data.titulo}`;
      // CAMBIA ESTE NÚMERO POR EL TUYO (formato: 521 + 10 dígitos)
      const url = `https://wa.me/5218112345678?text=${encodeURIComponent(mensaje)}`;
      window.open(url, '_blank');
    }
  }

  compartir(): void {
    if (navigator.share && this.data) {
      navigator.share({
        title: this.data.titulo || 'Propiedad',
        text: this.data.descripcion || '',
        url: window.location.href
      }).catch(err => console.log('Error al compartir:', err));
    } else {
      // Fallback: copiar al portapapeles
      // (Evita usar 'alert' si es posible)
      navigator.clipboard.writeText(window.location.href)
        .then(() => console.log('Enlace copiado al portapapeles'))
        .catch(() => console.error('No se pudo copiar el enlace'));
    }
  }
}

