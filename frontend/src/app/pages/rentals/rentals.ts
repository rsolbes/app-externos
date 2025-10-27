import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';               // ⬅️ IMPORTANTE
import { Observable } from 'rxjs';

import { Property } from '../../components/models/property.model';
import { PropertyListComponent } from '../../components/property-list/property-list';
import { PropertyService } from '../../services/property.service';

@Component({
  selector: 'app-rentals',
  standalone: true,
  imports: [CommonModule, IonicModule, PropertyListComponent],  // ⬅️ AGREGA IonicModule
  templateUrl: './rentals.html',
  styleUrls: ['./rentals.scss'],
})
export class RentalsPage {
  private api = inject(PropertyService);
  properties$!: Observable<Property[]>;
  loading = true;

  ngOnInit() {
    this.properties$ = this.api.listRentals();
    this.properties$.subscribe({
      next: () => (this.loading = false),
      error: () => (this.loading = false),
    });
  }
}
