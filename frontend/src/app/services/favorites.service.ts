import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private _favorites = new BehaviorSubject<number[]>(this.loadFavorites());
  favorites$ = this._favorites.asObservable();

  private loadFavorites(): number[] {
    const raw = localStorage.getItem('favorites');
    return raw ? JSON.parse(raw) : [];
  }

  private saveFavorites(list: number[]) {
    localStorage.setItem('favorites', JSON.stringify(list));
  }

  toggle(id: number) {
    const list = this._favorites.value;
    const exists = list.includes(id);
    const updated = exists ? list.filter(x => x !== id) : [...list, id];
    this._favorites.next(updated);
    this.saveFavorites(updated);
  }

  isFav(id: number): boolean {
    return this._favorites.value.includes(id);
  }

  clear() {
    this._favorites.next([]);
    localStorage.removeItem('favorites');
  }
}
