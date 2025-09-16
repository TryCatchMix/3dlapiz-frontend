import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { AdminProductService } from '../../../core/services/admin/product.service';
import { AuthStateService } from '../../../core/services/auth-state.service';
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

        <form
          [formGroup]="productForm"
          (ngSubmit)="onSubmit()"
          class="space-y-4"
        >
          <!-- Información básica -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-group">
              <label
                for="name"
                class="block text-sm font-medium text-gray-700 mb-1"
                >Nombre *</label
              >
              <input
                type="text"
                id="name"
                formControlName="name"
                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                [ngClass]="{ 'border-red-500': isFieldInvalid('name') }"
              />
              @if (isFieldInvalid('name')) {
              <p class="text-red-500 text-xs mt-1">El nombre es obligatorio</p>
              }
            </div>


          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-group">
              <label
                for="price"
                class="block text-sm font-medium text-gray-700 mb-1"
                >Precio *</label
              >
              <input
                type="number"
                id="price"
                formControlName="price"
                min="0"
                step="0.01"
                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                [ngClass]="{ 'border-red-500': isFieldInvalid('price') }"
              />
              @if (isFieldInvalid('price')) {
              <p class="text-red-500 text-xs mt-1">
                El precio es obligatorio y debe ser mayor o igual a 0
              </p>
              }
            </div>

            <div class="form-group">
              <label
                for="stock"
                class="block text-sm font-medium text-gray-700 mb-1"
                >Stock *</label
              >
              <input
                type="number"
                id="stock"
                formControlName="stock"
                min="0"
                step="1"
                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                [ngClass]="{ 'border-red-500': isFieldInvalid('stock') }"
              />
              @if (isFieldInvalid('stock')) {
              <p class="text-red-500 text-xs mt-1">
                El stock es obligatorio y debe ser mayor o igual a 0
              </p>
              }
            </div>
          </div>

          <div class="form-group">
            <label
              for="description"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Descripción</label
            >
            <textarea
              id="description"
              formControlName="description"
              rows="4"
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <!-- Imágenes -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Imágenes</label
            >
            <div
              class="border-dashed border-2 border-gray-300 p-6 rounded-md text-center"
            >
              <input
                type="file"
                id="images"
                multiple
                accept="image/jpeg,image/png,image/gif,image/jpg"
                (change)="onFileSelected($event)"
                class="hidden"
                #fileInput
              />
              <div
                (click)="fileInput.click()"
                class="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div class="flex flex-col items-center justify-center py-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-10 w-10 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p class="mt-2 text-sm text-gray-600">
                    Haz clic para subir imágenes
                  </p>
                  <p class="text-xs text-gray-500">
                    (Máximo 5 archivos, 2MB cada uno)
                  </p>
                </div>
              </div>
            </div>

            @if (selectedFiles.length > 0) {
            <div
              class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
            >
              @for (fileObj of selectedFiles; track $index) {
              <div class="relative group">
                <img
                  [src]="fileObj.previewUrl"
                  alt="Preview"
                  class="h-32 w-full object-cover rounded-md"
                />
                <div
                  class="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full cursor-pointer"
                  (click)="removeFile($index)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
              }
            </div>
            }
          </div>

          <!-- Mensajes de error -->
          @if (errorMessage) {
          <div
            class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
          >
            {{ errorMessage }}
          </div>
          }

          <!-- Mensaje de éxito -->
          @if (successMessage) {
          <div
            class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded"
          >
            {{ successMessage }}
          </div>
          }

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
  styles: [
    `
      .ng-invalid.ng-touched:not(form) {
        border-color: #ef4444;
      }
    `,
  ],
})
export class ProductAddComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminProductService = inject(AdminProductService);
  private authStateService = inject(AuthStateService);
  private router = inject(Router);

  productForm!: FormGroup;
  selectedFiles: { file: File; previewUrl: string }[] = [];
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    // Verificar si el usuario es administrador
    if (!this.authStateService.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }

    this.initForm();
  }

  initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
    });
  }


  isFieldInvalid(field: string): boolean {
    const control = this.productForm.get(field);
    return (control?.invalid && control?.touched) || false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);

      // Validar tamaño de archivos (2MB max)
      const invalidFiles = files.filter((file) => file.size > 2 * 1024 * 1024);
      if (invalidFiles.length > 0) {
        this.errorMessage = 'Algunos archivos superan el tamaño máximo de 2MB';
        return;
      }

      // Limitar a 5 archivos
      const remainingSlots = 5 - this.selectedFiles.length;
      const filesToAdd = files.slice(0, remainingSlots);

      // Crear objetos con file y previewUrl
      const newFiles = filesToAdd.map((file) => ({
        file: file,
        previewUrl: URL.createObjectURL(file),
      }));

      this.selectedFiles = [...this.selectedFiles, ...newFiles];
      this.errorMessage = '';

      if (files.length > remainingSlots) {
        this.errorMessage = `Solo se pueden agregar ${remainingSlots} archivos más`;
      }
    }
  }
  removeFile(index: number): void {
    const fileToRemove = this.selectedFiles[index];
    // Revocar la URL del objeto para liberar memoria
    URL.revokeObjectURL(fileToRemove.previewUrl);

    const newFiles = [...this.selectedFiles];
    newFiles.splice(index, 1);
    this.selectedFiles = newFiles;
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = new FormData();

    Object.keys(this.productForm.value).forEach((key) => {
      const value = this.productForm.value[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    // Añadir las imágenes (extraer solo el file del objeto)
    this.selectedFiles.forEach((fileObj, index) => {
      formData.append(`images[${index}]`, fileObj.file);
    });

    this.adminProductService.createProduct(formData).subscribe({
      next: (response) => {
        console.log('Producto creado', response);
        this.successMessage = 'Producto creado exitosamente';
        this.isSubmitting = false;

        // Redirigir después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/admin/products']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error al crear el producto', error);
        this.isSubmitting = false;

        // Manejar diferentes tipos de errores
        if (error.status === 422) {
          // Errores de validación
          this.errorMessage = 'Por favor, revisa los datos ingresados';
          if (error.error.errors) {
            const firstError = Object.values(error.error.errors)[0] as string[];
            this.errorMessage = firstError[0];
          }
        } else {
          this.errorMessage = 'Error al crear el producto. Intenta nuevamente.';
        }
      },
    });
  }

  goBack(): void {
    // Limpiar las URLs de los archivos antes de navegar
    this.selectedFiles.forEach((fileObj) => {
      URL.revokeObjectURL(fileObj.previewUrl);
    });
    this.router.navigate(['/admin/products']);
  }
}
