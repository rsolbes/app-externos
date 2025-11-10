import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { SearchFilterComponent } from '../../components/search-filter/search-filter';
import { PropertyListComponent } from '../../components/property-list/property-list';
import { FloatingWhatsappComponent } from '../../components/floating-whatsap/floating-whatsapp.component';

import { PropertyService, SearchParams } from '../../services/property.service';
import { Property } from '../../components/models/property.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    IonicModule, 
    CommonModule, 
    RouterModule,
    SearchFilterComponent, 
    PropertyListComponent,
    FloatingWhatsappComponent
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class HomePage {
  private api = inject(PropertyService);
  properties: Property[] = [];
  loading = true;
  totalProperties = 0;

  ngOnInit() {
    this.loadProperties();
  }

  loadProperties() {
    this.api.list().subscribe({
      next: rows => { 
        this.properties = rows; 
        this.totalProperties = rows.length;
        this.loading = false; 
      },
      error: () => { 
        this.properties = []; 
        this.totalProperties = 0;
        this.loading = false; 
      },
    });
  }

  onSearch(params: SearchParams) {
    this.loading = true;
    this.api.search(params).subscribe({
      next: rows => { 
        this.properties = rows; 
        this.totalProperties = rows.length;
        this.loading = false; 
      },
      error: () => { 
        this.properties = []; 
        this.totalProperties = 0;
        this.loading = false; 
      },
    });
  }
}