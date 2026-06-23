import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AdminProductService } from '../../../core/services/admin/product.service';
import { CommonModule } from '@angular/common';
import { PriceEurPipe } from '../../../shared/pipes/price-eur.pipe';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment.staging';

const YOUTUBE_REGEX =
  /^https:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)[A-Za-z0-9_-]{11}(?:[?&][\w=\-&%.]*)?$/;

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslateModule, PriceEurPipe],
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.scss']
})
export class ProductEditComponent implements OnInit {
  private productService = inject(ProductService);
  private adminProductService = inject(AdminProductService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  products: Product[] = [];
  selectedProduct: Product | null = null;
  deleting = signal(false);
  newImages: File[] = [];
uploadingImages = false;
deletingImageId: string | null = null;

  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    youtube_url: ['', [Validators.pattern(YOUTUBE_REGEX)]],
    price: [0, [Validators.required, Validators.min(0)]],
    unpainted_price: [null as number | null, [Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
  });

  loading = true;
  saving = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.error = 'Error loading products';
        this.loading = false;
      }
    });
  }

  selectProduct(product: Product) {
    this.selectedProduct = product;
    this.form.patchValue({
      name: product.name,
      description: product.description,
      youtube_url: product.youtube_url ?? '',
      price: parseFloat(product.price),
      unpainted_price:
        product.unpainted_price != null && product.unpainted_price !== ''
          ? parseFloat(product.unpainted_price as any)
          : null,
      stock: product.stock,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  submit() {
    if (!this.selectedProduct || this.form.invalid) return;

    this.saving = true;

    const raw = this.form.value;
    const payload: any = {
      name: raw.name,
      description: raw.description ?? null,
      youtube_url: raw.youtube_url && raw.youtube_url.trim() !== '' ? raw.youtube_url.trim() : null,
      price: raw.price,
      unpainted_price:
        raw.unpainted_price === null ||
        raw.unpainted_price === undefined ||
        (raw.unpainted_price as any) === ''
          ? null
          : Number(raw.unpainted_price),
      stock: raw.stock,
    };

    this.adminProductService
      .updateProduct(String(this.selectedProduct.id), payload)
      .subscribe({
        next: () => {
          this.saving = false;
          this.selectedProduct = null;
          this.loadProducts();
        },
        error: (err) => {
          console.error('Error updating product:', err);
          this.saving = false;
          this.error = 'Error updating product';
        },
      });
  }

  deleteProduct(): void {
  if (!this.selectedProduct) return;

  const name = this.selectedProduct.name;
  const ok = confirm(
    `¿Eliminar "${name}"?\n\nEl producto dejará de aparecer en la tienda. Los pedidos pasados seguirán funcionando.`
  );
  if (!ok) return;

  this.deleting.set(true);
  this.adminProductService.deleteProduct(this.selectedProduct.id).subscribe({
    next: () => {
      this.deleting.set(false);
      this.selectedProduct = null;
      this.loadProducts();
    },
    error: (err) => {
      this.deleting.set(false);
      console.error(err);
      alert('Error al eliminar el producto');
    },
  });
}

onImagesSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files) return;

  const files = Array.from(input.files);
  const tooBig = files.filter(f => f.size > 4 * 1024 * 1024);
  if (tooBig.length > 0) {
    alert(`Algunos archivos exceden 4 MB y no se subirán: ${tooBig.map(f => f.name).join(', ')}`);
  }
  this.newImages = files.filter(f => f.size <= 4 * 1024 * 1024);
}

uploadNewImages(): void {
  if (!this.selectedProduct || this.newImages.length === 0) return;

  this.uploadingImages = true;
  const formData = new FormData();
  this.newImages.forEach(f => formData.append('images[]', f));

  this.adminProductService.manageImages(this.selectedProduct.id, formData).subscribe({
    next: (updated) => {
      this.uploadingImages = false;
      this.newImages = [];
      // Refresca el producto seleccionado con las nuevas imágenes
      if (this.selectedProduct) {
        this.selectedProduct.images = updated.images;
      }
      this.loadProducts(); // refresca la lista lateral por si la usas
    },
    error: (err) => {
      this.uploadingImages = false;
      console.error(err);
      alert('Error al subir las imágenes');
    },
  });
}

deleteImage(imageId: string): void {
  if (!this.selectedProduct) return;
  if (!confirm('¿Eliminar esta imagen? Esta acción no se puede deshacer.')) return;

  this.deletingImageId = imageId;
  const formData = new FormData();
  formData.append('deleted_images[]', imageId);

  this.adminProductService.manageImages(this.selectedProduct.id, formData).subscribe({
    next: (updated) => {
      this.deletingImageId = null;
      if (this.selectedProduct) {
        this.selectedProduct.images = updated.images;
      }
      this.loadProducts();
    },
    error: (err) => {
      this.deletingImageId = null;
      console.error(err);
      alert('Error al eliminar la imagen');
    },
  });
}

imgUrl(path?: string): string {
  if (!path) return `${environment.STATIC_URL}/images/default-placeholder.jpg`;
  return `${environment.STATIC_URL}/${path}`;
}

  cancelEdit() {
    this.selectedProduct = null;
  }
}
