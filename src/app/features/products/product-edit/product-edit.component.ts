import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.scss']
})
export class ProductEditComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  products: Product[] = [];
  selectedProduct: Product | null = null;

  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
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
      price: parseFloat(product.price),
      stock: product.stock,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' }); // sube al formulario
  }

  submit() {
    if (!this.selectedProduct || this.form.invalid) return;

    this.saving = true;

    this.productService.updateProduct(this.selectedProduct.id, this.form.value).subscribe({
      next: (updated) => {
        this.saving = false;
        this.selectedProduct = null;
        this.loadProducts(); // refresca la lista
      },
      error: (err) => {
        console.error('Error updating product:', err);
        this.saving = false;
        this.error = 'Error updating product';
      }
    });
  }

  cancelEdit() {
    this.selectedProduct = null;
  }
}
