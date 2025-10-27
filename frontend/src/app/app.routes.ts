import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home';
import { PropertyDetailPage } from './pages/property-detail/property-detail';
import { RentalsPage } from './pages/rentals/rentals';
import { FavoritesPage } from './pages/favorites/favorites';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'property-detail/:id', component: PropertyDetailPage },
  { path: 'rentals', component: RentalsPage },
  { path: 'favorites', component: FavoritesPage },
  { path: '**', redirectTo: '' },  // Redirige en caso de una ruta incorrecta
];
