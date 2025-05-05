import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { CartService } from '../../../core/services/cart.service';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-details.component.html',
})
export class ProductDetailsComponent implements OnInit {
  product: any = null;
  currentImageIndex = 0;
  quantity = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const productId = params['id'];
      if (productId) {
        this.loadProduct(productId);
      }
    });
  }

  loadProduct(id: string): void {
    this.productService.getProductWithImages(Number(id)).subscribe({
      next: (data) => {
        this.product = data;
      },
      error: (error) => {
        this.productService.getProduct(id).subscribe({
          next: (data) => {
            this.product = data;
          },
          error: (err) => {
            console.error('Error al cargar el producto', err);
            this.router.navigate(['/products']);
          },
        });
      },
    });
  }

  prevImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    } else {
      this.currentImageIndex = this.product.images.length - 1;
    }
  }

  nextImage(): void {
    if (this.currentImageIndex < this.product.images.length - 1) {
      this.currentImageIndex++;
    } else {
      this.currentImageIndex = 0;
    }
  }

  setImageIndex(index: number): void {
    this.currentImageIndex = index;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  increaseQuantity(): void {
    if (this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  addToCart(): void {
    if (this.product.stock <= 0) {
      return;
    }

    if (this.quantity > 1) {
      for (let i = 0; i < this.quantity; i++) {
        this.cartService.addToCart(this.product);
      }
    } else {
      this.cartService.addToCart(this.product);
    }

    // Mostrar notificación de éxito
    //alert(`${this.product.name} (${this.quantity}) añadido al carrito`);
  }
}
