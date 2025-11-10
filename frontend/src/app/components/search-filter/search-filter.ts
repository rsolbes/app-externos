import { Component, OnInit, Output, EventEmitter, inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CatalogService, TipoPropiedad, Estado, Ciudad } from '../../services/catalog.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
  templateUrl: './search-filter.html',
  styleUrls: ['./search-filter.scss'],
})
export class SearchFilterComponent implements OnInit {
  @Output() search = new EventEmitter<SearchParams>();
  @Output() reset = new EventEmitter<void>();
  @Input() totalProperties: number = 0;

  private fb = inject(FormBuilder);
  private catalogService = inject(CatalogService);

  form!: FormGroup;
  
  // Listas de catálogo originales
  tiposPropiedad: TipoPropiedad[] = [];
  estados: Estado[] = [];
  ciudades: Ciudad[] = [];
  
  // --- NUEVAS PROPIEDADES PARA FILTROS "TYPE-AHEAD" ---
  estadosFiltrados: Estado[] = [];
  ciudadesFiltradas: Ciudad[] = []; // Ciudades del estado seleccionado
  ciudadesFiltradasPorBusqueda: Ciudad[] = []; // Ciudades filtradas por "typeo"

  // Banderas para mostrar/ocultar los dropdowns personalizados
  showEstadosDropdown = false;
  showCiudadesDropdown = false;
  // --- FIN NUEVAS PROPIEDADES ---

  isLoading = false;
  showAdvancedFilters = false;

  ngOnInit(): void {
    this.initForm();
    this.loadCatalogos();
    this.setupSearchListeners(); // <-- Reemplaza setupEstadoListener
  }

  // --- FUNCIÓN DE AYUDA PARA IGNORAR ACENTOS Y MAYÚSCULAS ---
  private normalizeString(str: string): string {
    if (!str) return '';
    return str
      .normalize("NFD") // Descompone caracteres (ej: 'é' -> 'e' + '́')
      .replace(/[\u0300-\u036f]/g, "") // Elimina los acentos
      .toLowerCase(); // Convierte a minúsculas
  }

  private initForm(): void {
    this.form = this.fb.group({
      q: [''],
      tipo_propiedad_id: [''],
      
      // --- CAMBIOS EN EL FORMULARIO ---
      // Mantienen el ID seleccionado
      estado_id: [''], 
      ciudad_id: [''],
      // Nuevos controles para el texto que el usuario escribe
      estadoSearchText: [''],
      ciudadSearchText: [''],
      // --- FIN CAMBIOS ---

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
        this.estadosFiltrados = [...this.estados]; // Llenar al inicio
        console.log('Catálogos cargados:', catalogos);
      },
      error: (err) => {
        console.error('Error al cargar catálogos:', err);
      }
    });
  }

  // --- LÓGICA DE BÚSQUEDA "TYPE-AHEAD" ---
  private setupSearchListeners(): void {
    
    // 1. Escuchar cambios en el input de ESTADO
    this.form.get('estadoSearchText')?.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged()
    ).subscribe(searchText => {
      const normalizedQuery = this.normalizeString(searchText);
      if (!normalizedQuery) {
        this.estadosFiltrados = [...this.estados]; // Mostrar todos si está vacío
      } else {
        this.estadosFiltrados = this.estados.filter(estado =>
          this.normalizeString(estado.nombre).includes(normalizedQuery)
        );
      }
    });

    // 2. Escuchar cambios en el ID de ESTADO (para filtrar ciudades)
    this.form.get('estado_id')?.valueChanges.subscribe(estadoId => {
      if (estadoId) {
        this.ciudadesFiltradas = this.ciudades.filter(
          c => c.estado_id === Number(estadoId)
        );
      } else {
        this.ciudadesFiltradas = [];
      }
      this.ciudadesFiltradasPorBusqueda = [...this.ciudadesFiltradas]; // Resetear lista de búsqueda
      this.form.get('ciudadSearchText')?.setValue('', { emitEvent: false }); // Limpiar texto de ciudad
      this.form.get('ciudad_id')?.setValue('', { emitEvent: false }); // Limpiar ID de ciudad
    });

    // 3. Escuchar cambios en el input de CIUDAD
    this.form.get('ciudadSearchText')?.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged()
    ).subscribe(searchText => {
      const normalizedQuery = this.normalizeString(searchText);
      if (!normalizedQuery) {
        this.ciudadesFiltradasPorBusqueda = [...this.ciudadesFiltradas]; // Mostrar todas
      } else {
        this.ciudadesFiltradasPorBusqueda = this.ciudadesFiltradas.filter(ciudad =>
          this.normalizeString(ciudad.nombre).includes(normalizedQuery)
        );
      }
    });
  }

  // --- NUEVAS FUNCIONES PARA SELECCIONAR Y OCULTAR DROPDOWNS ---

  selectEstado(estado: Estado): void {
    this.form.get('estado_id')?.setValue(estado.id);
    this.form.get('estadoSearchText')?.setValue(estado.nombre, { emitEvent: false });
    this.showEstadosDropdown = false;
  }

  selectCiudad(ciudad: Ciudad): void {
    this.form.get('ciudad_id')?.setValue(ciudad.id);
    this.form.get('ciudadSearchText')?.setValue(ciudad.nombre, { emitEvent: false });
    this.showCiudadesDropdown = false;
  }

  // Ocultar dropdowns si se hace clic fuera
  closeDropdowns(): void {
    this.showEstadosDropdown = false;
    this.showCiudadesDropdown = false;
  }

  // --- FIN NUEVAS FUNCIONES ---

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
      
      // Usar los IDs seleccionados
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
    this.form.reset({
      q: '',
      tipo_propiedad_id: '',
      estado_id: '',
      ciudad_id: '',
      estadoSearchText: '',
      ciudadSearchText: '',
      minPrice: '',
      maxPrice: '',
      habitaciones: '',
      banos: '',
      estacionamientos: ''
    });
    this.ciudadesFiltradas = [];
    this.estadosFiltrados = [...this.estados];
    this.ciudadesFiltradasPorBusqueda = [];
    this.showAdvancedFilters = false;
    this.reset.emit();
  }

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

