import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header';
import { FloatingWhatsappComponent } from './components/floating-whatsap/floating-whatsapp.component'; // 👈 AÑADIR

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    HeaderComponent,
    FloatingWhatsappComponent // 👈 AÑADIR
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  [x: string]: any;
}