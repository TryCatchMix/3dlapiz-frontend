import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AdminProductService } from '../../../core/services/admin/product.service';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';

const YOUTUBE_REGEX =
  /^https:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)[A-Za-z0-9_-]{11}(?:[?&][\w=\-&%.]*)?$/;

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
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

  cancelEdit() {
    this.selectedProduct = null;
  }
}
