import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-whatsapp-float',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="floating-whatsapp" 
         [class.visible]="isVisible"
         [class.pulse]="shouldPulse">
      
      <!-- Botón principal -->
      <a [href]="whatsappUrl" 
         target="_blank" 
         rel="noopener noreferrer"
         class="whatsapp-btn"
         [attr.aria-label]="'Contactar por WhatsApp'"
         (mouseenter)="stopPulse()"
         (click)="handleClick()">
        
        <!-- Ícono de WhatsApp -->
        <svg class="whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>

        <!-- Efecto de ondas -->
        <span class="ping"></span>
        <span class="ping ping-2"></span>
      </a>

      <!-- Tooltip (mensaje) -->
      <div class="whatsapp-tooltip">
        <p>¿Necesitas ayuda?</p>
        <span>Chatea con nosotros</span>
      </div>
    </div>
  `,
  styles: [`
    .floating-whatsapp {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999;
      opacity: 0;
      transform: scale(0) translateY(20px);
      transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);

      &.visible {
        opacity: 1;
        transform: scale(1) translateY(0);
      }

      &.pulse .whatsapp-btn {
        animation: pulse 2s infinite;
      }
    }

    .whatsapp-btn {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
      border-radius: 50%;
      box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      color: white;

      &:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 30px rgba(37, 211, 102, 0.6);

        ~ .whatsapp-tooltip {
          opacity: 1;
          transform: translateX(0);
          visibility: visible;
        }
      }

      &:active {
        transform: scale(0.95);
      }
    }

    .whatsapp-icon {
      width: 32px;
      height: 32px;
      position: relative;
      z-index: 2;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }

    .ping {
      position: absolute;
      inset: -8px;
      border: 3px solid #25d366;
      border-radius: 50%;
      opacity: 0.7;
      animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    .ping-2 {
      animation-delay: 0.5s;
    }

    .whatsapp-tooltip {
      position: absolute;
      right: 75px;
      top: 50%;
      transform: translateY(-50%) translateX(10px);
      background: white;
      padding: 12px 16px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      white-space: nowrap;
      pointer-events: none;

      &::after {
        content: '';
        position: absolute;
        right: -6px;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid white;
        border-top: 6px solid transparent;
        border-bottom: 6px solid transparent;
      }

      p {
        margin: 0 0 4px;
        font-size: 0.875rem;
        font-weight: 700;
        color: #1e293b;
      }

      span {
        font-size: 0.75rem;
        color: #64748b;
      }
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }

    @keyframes ping {
      0% {
        transform: scale(1);
        opacity: 0.7;
      }
      75%, 100% {
        transform: scale(1.8);
        opacity: 0;
      }
    }

    @media (max-width: 768px) {
      .floating-whatsapp {
        bottom: 16px;
        right: 16px;
      }

      .whatsapp-btn {
        width: 56px;
        height: 56px;
      }

      .whatsapp-icon {
        width: 28px;
        height: 28px;
      }

      .whatsapp-tooltip {
        display: none;
      }
    }
  `]
})
export class FloatingWhatsappComponent {
  isVisible = false;
  shouldPulse = true;
  phoneNumber = '528333212182';
  message = 'Hola, estoy interesado en obtener más información sobre las propiedades disponibles. ¿Podrían ayudarme?';

  get whatsappUrl(): string {
    const encodedMessage = encodeURIComponent(this.message);
    return `https://wa.me/${this.phoneNumber}?text=${encodedMessage}`;
  }

  ngOnInit() {
    // Mostrar después de 1 segundo
    setTimeout(() => {
      this.isVisible = true;
    }, 1000);

    // Detener pulso después de 10 segundos
    setTimeout(() => {
      this.shouldPulse = false;
    }, 10000);
  }

  stopPulse() {
    this.shouldPulse = false;
  }

  handleClick() {
    console.log('WhatsApp button clicked');
  }
}