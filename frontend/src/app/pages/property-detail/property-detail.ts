// property-detail.ts
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { Property } from '../../components/models/property.model';
import { PropertyService } from '../../services/property.service';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, DecimalPipe],
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
      this.api.get(id).subscribe({
        next: (property) => {
          if (property) {
            this.data = property;
            this.loading = false;
            
            // Inicializar array de imágenes
            this.images = [];
            
            // Agregar imagen principal desde el campo 'Imagen' de la BD
            if (property.Imagen) {
              const imageSource = this.convertImageToUrl(property.Imagen);
              if (imageSource) {
                this.images.push(imageSource);
              }
            }
            
            // 🔮 FUTURO: Cuando tengas múltiples imágenes, descomenta una de estas opciones:
            
            // OPCIÓN 1: Si tienes un array de imágenes en el modelo
            // if (property.imagenes && Array.isArray(property.imagenes)) {
            //   this.images = [...this.images, ...property.imagenes];
            // }
            
            // OPCIÓN 2: Si tienes campos separados (Imagen_2, Imagen_3, etc.)
            // if (property.Imagen_2) {
            //   const img2 = this.convertImageToUrl(property.Imagen_2);
            //   if (img2) this.images.push(img2);
            // }
            // if (property.Imagen_3) {
            //   const img3 = this.convertImageToUrl(property.Imagen_3);
            //   if (img3) this.images.push(img3);
            // }
            
            // OPCIÓN 3: Si tienes una tabla relacionada de imágenes
            // Necesitarías hacer otra llamada al API:
            // this.api.getPropertyImages(id).subscribe(imgs => {
            //   this.images = [...this.images, ...imgs.map(img => this.convertImageToUrl(img))];
            // });
          }
        },
        error: () => {
          this.data = null;
          this.loading = false;
        }
      });
    }
  }

  // Convertir imagen de base64 a URL utilizable
  private convertImageToUrl(imagen: string | null): string | null {
    if (!imagen) return null;

    // Si ya es una URL completa
    if (imagen.startsWith('http://') || imagen.startsWith('https://')) {
      return imagen;
    }

    // Si ya tiene el prefijo data:image
    if (imagen.startsWith('data:')) {
      return imagen;
    }

    // Si es base64 puro (caso más común desde Access)
    const imageType = this.detectImageType(imagen);
    return `data:image/${imageType};base64,${imagen}`;
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
    
    // Fallback al método anterior
    return this.data.precio ? 'Venta' : this.data.precio_alquiler ? 'Renta' : 'Consultar';
  }

  nextImage() {
    if (this.images.length > 1) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
    }
  }

  prevImage() {
    if (this.images.length > 1) {
      this.currentImageIndex = this.currentImageIndex === 0 ? this.images.length - 1 : this.currentImageIndex - 1;
    }
  }

  verEnGoogleMaps() {
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

  contactarWhatsApp() {
    if (this.data) {
      const mensaje = `Hola, estoy interesado en la propiedad: ${this.data.titulo}`;
      // CAMBIA ESTE NÚMERO POR EL TUYO
      const url = `https://wa.me/521XXXXXXXXXX?text=${encodeURIComponent(mensaje)}`;
      window.open(url, '_blank');
    }
  }

  compartir() {
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