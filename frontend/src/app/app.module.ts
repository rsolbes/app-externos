import { AppComponent } from './app.component';
// These components are likely used in your routes or imported by AppComponent
// import { PropertyCardComponent } from './components/property-card/property-card';
// import { PropertyDetailPage } from './pages/property-detail/property-detail';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router'; // Import provideRouter

// Rutas
import { routes } from './app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // Use provideRouter(routes) for standalone applications
    // Components should not be listed in the main providers array
    // PropertyCardComponent,
    // PropertyDetailPage
  ]
});
