 import { Component, OnInit, Output, EventEmitter, inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CatalogService, TipoPropiedad, Estado, Ciudad } from '../../services/catalog.service';

export interface SearchParams {
  q?: string;
  tipo_propiedad_id?: number;
  estado_id?: number;
  ciudad_id?: number;
  minPrice?: number;
  maxPrice?: number;
  habitaciones?: number;
  banos?: number;
  estacionamientos?: number;
}

 @Component({
  selector: 'app-search-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-filter.html', // <-- Usará el nuevo HTML adaptado
  styleUrls: ['./search-filter.scss'], // <-- Usará el nuevo SCSS adaptado
})
export class SearchFilterComponent implements OnInit {
  @Output() search = new EventEmitter<SearchParams>();
  @Output() reset = new EventEmitter<void>();
  @Input() totalProperties: number = 0;

  private fb = inject(FormBuilder);
  private catalogService = inject(CatalogService);

  form!: FormGroup;
  tiposPropiedad: TipoPropiedad[] = [];
  estados: Estado[] = [];
  ciudades: Ciudad[] = [];
  ciudadesFiltradas: Ciudad[] = [];
  isLoading = false;
  showAdvancedFilters = false;

  ngOnInit(): void {
    this.initForm();
    this.loadCatalogos();
    this.setupEstadoListener();
  }

  private initForm(): void {
    this.form = this.fb.group({
      q: [''],
      tipo_propiedad_id: [''],
      estado_id: [''],
      ciudad_id: [''],
      minPrice: [''],
      maxPrice: [''],
      habitaciones: [''],
      banos: [''],
      estacionamientos: ['']
    });
  }

  private loadCatalogos(): void {
    this.catalogService.getCatalogos().subscribe({
      next: (catalogos) => {
        this.tiposPropiedad = catalogos.tipos_propiedad;
        this.estados = catalogos.estados;
        this.ciudades = catalogos.ciudades;
        console.log('Catálogos cargados:', catalogos);
      },
      error: (err) => {
        console.error('Error al cargar catálogos:', err);
      }
    });
  }

  private setupEstadoListener(): void {
    this.form.get('estado_id')?.valueChanges.subscribe(estadoId => {
      if (estadoId) {
        this.ciudadesFiltradas = this.ciudades.filter(
          c => c.estado_id === Number(estadoId)
        );
        // Limpiar ciudad cuando cambia el estado
        this.form.get('ciudad_id')?.setValue('');
      } else {
        this.ciudadesFiltradas = [];
      }
    });
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isLoading = true;
      
      const formValue = this.form.value;
      const params: SearchParams = {};

      // Solo incluir valores que no estén vacíos
      if (formValue.q) params.q = formValue.q;
      if (formValue.tipo_propiedad_id) params.tipo_propiedad_id = Number(formValue.tipo_propiedad_id);
      if (formValue.estado_id) params.estado_id = Number(formValue.estado_id);
      if (formValue.ciudad_id) params.ciudad_id = Number(formValue.ciudad_id);
      if (formValue.minPrice) params.minPrice = Number(formValue.minPrice);
      if (formValue.maxPrice) params.maxPrice = Number(formValue.maxPrice);
      if (formValue.habitaciones) params.habitaciones = Number(formValue.habitaciones);
      if (formValue.banos) params.banos = Number(formValue.banos);
      if (formValue.estacionamientos) params.estacionamientos = Number(formValue.estacionamientos);

      console.log('Parámetros de búsqueda:', params);
      this.search.emit(params);
      
      // Simular fin de carga
      setTimeout(() => {
        this.isLoading = false;
      }, 500);
    }
  }

  onReset(): void {
    this.form.reset();
    this.ciudadesFiltradas = [];
    this.showAdvancedFilters = false;
    this.reset.emit();
  }

  /**
   * Verifica si hay filtros avanzados activos
   */
  hasActiveFilters(): boolean {
    const formValue = this.form.value;
    return !!(
      formValue.estado_id ||
      formValue.ciudad_id ||
      formValue.minPrice ||
      formValue.maxPrice ||
      formValue.habitaciones ||
      formValue.banos ||
      formValue.estacionamientos
    );
  }

  /**
   * Cuenta cuántos filtros avanzados están activos
   */
  activeFiltersCount(): number {
    const formValue = this.form.value;
    let count = 0;
    
    if (formValue.estado_id) count++;
    if (formValue.ciudad_id) count++;
    if (formValue.minPrice) count++;
    if (formValue.maxPrice) count++;
    if (formValue.habitaciones) count++;
    if (formValue.banos) count++;
    if (formValue.estacionamientos) count++;
    
    return count;
  }
}