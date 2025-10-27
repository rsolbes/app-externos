import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
// Asegúrate de que esta ruta a tu servicio sea correcta
import { PropertyService, SearchParams } from '../../services/property.service';

@Component({
  selector: 'app-search-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-filter.html', // <-- Usará el nuevo HTML adaptado
  styleUrls: ['./search-filter.scss'], // <-- Usará el nuevo SCSS adaptado
})
export class SearchFilterComponent {
  private fb = inject(FormBuilder);
  @Output() search = new EventEmitter<SearchParams>();

  // Señal para mostrar/ocultar filtros avanzados
  showAdvancedFilters = signal(false);

  // Formulario COMPLETO con todos los campos
  form = this.fb.group({
    q: [''],
    minPrice: [''],
    maxPrice: [''],
    type: [''],
    habitaciones: [''], // <-- Campo avanzado
    banos: [''],        // <-- Campo avanzado
    estacionamientos: [''], // <-- Campo avanzado
  });

  // Método para el botón "Búsqueda Avanzada"
  toggleAdvancedFilters() {
    this.showAdvancedFilters.update(value => !value);
  }

  onSubmit() {
    const v = this.form.value;

    // Lógica de conversión de números (limpia y robusta)
    const minPrice = v.minPrice ? parseFloat(v.minPrice) : undefined;
    const maxPrice = v.maxPrice ? parseFloat(v.maxPrice) : undefined;
    const habitaciones = v.habitaciones ? parseFloat(v.habitaciones) : undefined;
    const banos = v.banos ? parseFloat(v.banos) : undefined;
    const estacionamientos = v.estacionamientos ? parseFloat(v.estacionamientos) : undefined;

    this.search.emit({
      q: v.q || undefined,
      minPrice: !isNaN(minPrice!) ? minPrice : undefined,
      maxPrice: !isNaN(maxPrice!) ? maxPrice : undefined,
      type: v.type || undefined,
      habitaciones: !isNaN(habitaciones!) ? habitaciones : undefined,
      banos: !isNaN(banos!) ? banos : undefined,
      estacionamientos: !isNaN(estacionamientos!) ? estacionamientos : undefined,
    });
  }

  // Método para el botón de "Limpiar"
  onReset() {
    this.form.reset({
      q: '',
      minPrice: '',
      maxPrice: '',
      type: '',
      habitaciones: '',
      banos: '',
      estacionamientos: '',
    });
    // Oculta los filtros avanzados al limpiar
    this.showAdvancedFilters.set(false);
    // Emite una búsqueda "vacía" para recargar todas las propiedades
    this.search.emit({});
  }
}

