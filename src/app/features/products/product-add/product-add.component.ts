import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AdminProductService } from '../../../core/services/admin/product.service';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { Category } from '../../../core/models/product.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mx-auto p-4">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold">Añadir nuevo producto</h1>
          <button
            (click)="goBack()"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Volver
          </button>
        </div>

        <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <!-- Información básica -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-group">
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                id="name"
                formControlName="name"
                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                [ngClass]="{'border-red-500': isFieldInvalid('name')}"
              >
              @if (isFieldInvalid('name')) {
                <p class="text-red-500 text-xs mt-1">El nombre es obligatorio</p>
              }
            </div>

            <div class="form-group">
              <label for="sku" class="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input
                type="text"
                id="sku"
                formControlName="sku"
                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="form-group">
              <label for="price" class="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
              <input
                type="number"
                id="price"
                formControlName="price"
                min="0"
                step="0.01"
                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                [ngClass]="{'border-red-500': isFieldInvalid('price')}"
              >
              @if (isFieldInvalid('price')) {
                <p class="text-red-500 text-xs mt-1">El precio es obligatorio y debe ser mayor o igual a 0</p>
              }
            </div>

            <div class="form-group">
              <label for="stock" class="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
              <input
                type="number"
                id="stock"
                formControlName="stock"
                min="0"
                step="1"
                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                [ngClass]="{'border-red-500': isFieldInvalid('stock')}"
              >
              @if (isFieldInvalid('stock')) {
                <p class="text-red-500 text-xs mt-1">El stock es obligatorio y debe ser mayor o igual a 0</p>
              }
            </div>

            <div class="form-group">
              <label for="category_id" class="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <select
                id="category_id"
                formControlName="category_id"
                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                [ngClass]="{'border-red-500': isFieldInvalid('category_id')}"
              >
                <option value="">Seleccionar categoría</option>
                @for (category of categories; track category.id) {
                  <option [value]="category.id">{{ category.name }}</option>
                }
              </select>
              @if (isFieldInvalid('category_id')) {
                <p class="text-red-500 text-xs mt-1">La categoría es obligatoria</p>
              }
            </div>
          </div>

          <div class="form-group">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              id="description"
              formControlName="description"
              rows="4"
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <!-- Imágenes -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-1">Imágenes</label>
            <div class="border-dashed border-2 border-gray-300 p-6 rounded-md text-center">
              <input
                type="file"
                id="images"
                multiple
                accept="image/jpeg,image/png,image/gif,image/jpg"
                (change)="onFileSelected($event)"
                class="hidden"
                #fileInput
              >
              <div
                (click)="fileInput.click()"
                class="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div class="flex flex-col items-center justify-center py-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p class="mt-2 text-sm text-gray-600">Haz clic para subir imágenes</p>
                  <p class="text-xs text-gray-500">(Máximo 5 archivos, 2MB cada uno)</p>
                </div>
              </div>
            </div>

            @if (selectedFiles.length > 0) {
              <div class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                @for (file of selectedFiles; track $index) {
                  <div class="relative group">
                    <img
                      [src]="getPreviewUrl(file)"
                      alt="Preview"
                      class="h-32 w-full object-cover rounded-md"
                    >
                    <div
                      class="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full cursor-pointer"
                      (click)="removeFile($index)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Opciones adicionales -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-group">
              <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                id="status"
                formControlName="status"
                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="draft">Borrador</option>
              </select>
            </div>

            <div class="form-group flex items-center mt-8">
              <input
                type="checkbox"
                id="featured"
                formControlName="featured"
                class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              >
              <label for="featured" class="ml-2 block text-sm text-gray-700">Producto destacado</label>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              (click)="goBack()"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="productForm.invalid || isSubmitting"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {{ isSubmitting ? 'Guardando...' : 'Guardar producto' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .ng-invalid.ng-touched:not(form) {
      border-color: #ef4444;
    }
  `]
})
export class ProductAddComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminProductService = inject(AdminProductService);
  private authStateService = inject(AuthStateService);
  private router = inject(Router);

  productForm!: FormGroup;
  categories: Category[] = [];
  selectedFiles: File[] = [];
  isSubmitting = false;

  ngOnInit(): void {
    // Verificar si el usuario es administrador
    if (!this.authStateService.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }

    this.initForm();
    this.loadCategories();
  }

  initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      category_id: ['', [Validators.required]],
      sku: [''],
      status: ['active'],
      featured: [false]
    });
  }

  loadCategories(): void {
    // Suponiendo que tienes un servicio para obtener categorías
    // Esto es un ejemplo, deberías implementar este método
    this.categories = [
      { id: 1, name: 'Electrónica', description: '', created_at: null, updated_at: null },
      { id: 2, name: 'Ropa', description: '', created_at: null, updated_at: null },
      { id: 3, name: 'Hogar', description: '', created_at: null, updated_at: null }
    ];
  }

  isFieldInvalid(field: string): boolean {
    const control = this.productForm.get(field);
    return (control?.invalid && control?.touched) || false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);

      // Limitar a 5 archivos
      const remainingSlots = 5 - this.selectedFiles.length;
      const filesToAdd = files.slice(0, remainingSlots);

      this.selectedFiles = [...this.selectedFiles, ...filesToAdd];
    }
  }

  getPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  removeFile(index: number): void {
    const newFiles = [...this.selectedFiles];
    newFiles.splice(index, 1);
    this.selectedFiles = newFiles;
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    // Crear FormData para enviar datos y archivos
    const formData = new FormData();

    // Añadir los campos del formulario
    Object.keys(this.productForm.value).forEach(key => {
      formData.append(key, this.productForm.value[key]);
    });

    // Añadir las imágenes
    this.selectedFiles.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });

    this.adminProductService.createProduct(formData).subscribe({
      next: (response) => {
        console.log('Producto creado', response);
        this.isSubmitting = false;
        // Redirigir a la página de productos o a la de detalles del producto creado
        this.router.navigate(['/admin/products']);
      },
      error: (error) => {
        console.error('Error al crear el producto', error);
        this.isSubmitting = false;
        // Aquí podrías mostrar un mensaje de error
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/products']);
  }
}
