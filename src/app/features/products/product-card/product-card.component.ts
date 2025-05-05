import { Component, Input } from '@angular/core';

import { CartService } from '../../../core/services/cart.service';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styles: [],
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  constructor(private router: Router, private cartService: CartService) {}

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
    alert(`${product.name} añadido al carrito`);
  }

  goToProductDetails() {
    this.router.navigate(['/product', this.product.id]);
  }
}
