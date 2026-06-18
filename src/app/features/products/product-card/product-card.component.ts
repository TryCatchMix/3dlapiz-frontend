import { Component, Input } from '@angular/core';

import { CartService } from '../../../core/services/cart.service';
import { CommonModule } from '@angular/common';
import { PriceEurPipe } from '../../../shared/pipes/price-eur.pipe';
import { Product } from '../../../core/models/product.model';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, PriceEurPipe, TranslateModule],
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

  imgUrl(path?: string): string {
  if (!path) return `${environment.STATIC_URL}/images/default-placeholder.jpg`;
  return `${environment.STATIC_URL}/${path}`;
}
}
