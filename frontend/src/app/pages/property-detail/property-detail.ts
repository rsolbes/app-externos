import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
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
            this.processImages(property);
          }
        },
        error: () => {
          this.data = null;
          this.loading = false;
        }
      });
    }
  }

  private processImages(property: Property): void {
    this.images = [];

    // PRIORIDAD 1: Imágenes de la tabla propiedades_imagenes
    if (property.imagenes && property.imagenes.length > 0) {
      this.images = property.imagenes.map(img => this.processImageUrl(img.url));
    }
    
    // PRIORIDAD 2: Imagen legacy (campo Imagen en tabla propiedades)
    // Solo si no hay imágenes en la tabla propiedades_imagenes
    if (this.images.length === 0 && property.Imagen) {
      const legacyImage = this.convertBase64ToUrl(property.Imagen);
      if (legacyImage) {
        this.images.push(legacyImage);
      }
    }

    // Si no hay ninguna imagen, usar placeholder
    if (this.images.length === 0) {
      this.images.push('assets/images/no-image-placeholder.jpg');
    }
  }

  private processImageUrl(url: string): string {
    // Si ya es una URL completa, devolverla tal cual
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Si ya tiene el prefijo data:image, devolverla tal cual
    if (url.startsWith('data:')) {
      return url;
    }

    // Si parece ser base64, convertir
    if (this.isBase64(url)) {
      return this.convertBase64ToUrl(url);
    }

    // Si es una ruta relativa, construir URL completa
    // Asumiendo que tienes un servidor de archivos
    return `${this.getImageBaseUrl()}/${url}`;
  }

  private getImageBaseUrl(): string {
    // Ajusta según tu configuración de servidor
    return 'http://localhost:3000/uploads';
  }

  private isBase64(str: string): boolean {
    // Verificar si parece ser base64
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    return base64Regex.test(str) && str.length % 4 === 0;
  }

  private convertBase64ToUrl(imagen: string): string {
    if (!imagen) return '';

    // Si ya es una URL completa
    if (imagen.startsWith('http://') || imagen.startsWith('https://')) {
      return imagen;
    }

    // Si ya tiene el prefijo data:image
    if (imagen.startsWith('data:')) {
      return imagen;
    }

    // Si es base64 puro
    const imageType = this.detectImageType(imagen);
    return `data:image/${imageType};base64,${imagen}`;
  }

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
        alert("Coordenadas inválidas.");
      }
    } else {
      alert("No se han proporcionado las coordenadas de la propiedad.");
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
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Enlace copiado al portapapeles'))
        .catch(() => alert('No se pudo copiar el enlace'));
    }
  }
}