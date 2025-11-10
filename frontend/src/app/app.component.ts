import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from './components/header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonicModule, RouterOutlet, HeaderComponent],
  templateUrl: './app.html',
})
export class AppComponent {}
