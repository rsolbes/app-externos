import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-whatsapp-button', // Este es su "nombre"
  standalone: true,
  imports: [CommonModule],
  // 1. Usamos el HTML que tiene el SVG integrado
  template: `
    <a
      class="wa-fab"
      href="https://wa.me/5218330000000"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
    >
      <svg viewBox="0 0 32 32" aria-hidden="true" class="wa-icon">
        <circle cx="16" cy="16" r="16" class="wa-bg" />
        <path
          class="wa-mark"
          fill="currentColor"
          d="M19.1 17.6c-.3-.1-1.9-.9-2.2-1s-.5-.1-.7.1-.8 1-.9 1.1-.3.2-.6.1a6.9 6.9 0 0 1-2-1.2 7.2 7.2 0 0 1-1.3-1.6c-.2-.3 0-.4.1-.6l.3-.4.1-.2c.1-.2.1-.3 0-.5s-.7-1.8-.9-2.4-.5-.4-.7-.4h-.6c-.2 0-.5.1-.7.3-.8.8-1.2 1.8-1.2 2.9 0 .3 0 .6.1.9a7.9 7.9 0 0 0 2.5 4.2 8.6 8.6 0 0 0 5.4 2.3c1 .1 2 0 3-.3 1.1-.3 2-.9 2.7-1.8.2-.3.4-.7.4-1.1 0-.3 0-.5-.3-.6z"
        />
      </svg>
    </a>
  `,
  // 2. Estilos integrados (ya no necesitas el .scss)
  styles: [
    `
      .wa-fab {
        position: fixed;
        right: 18px;
        bottom: 18px;
        width: 56px;
        height: 56px;
        border-radius: 999px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000; /* Asegura que esté por encima de todo */
      }

      .wa-fab:hover {
        transform: scale(1.1);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
      }

      .wa-icon {
        width: 100%;
        height: 100%;
      }

      .wa-bg {
        fill: #25d366; /* Color verde de WhatsApp */
      }

      .wa-mark {
        color: #ffffff; /* Color del logo (blanco) */
        transform: scale(0.65) translate(12px, 12px);
      }
    `
  ]
})
export class WhatsappButtonComponent { }