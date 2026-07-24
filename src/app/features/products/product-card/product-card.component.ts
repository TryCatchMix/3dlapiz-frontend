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

  /** El producto se ofrece también sin pintar → hay que elegir acabado. */
  get hasUnpaintedOption(): boolean {
    return (
      this.product?.unpainted_price != null &&
      String(this.product.unpainted_price).trim() !== ''
    );
  }

  get isOutOfStock(): boolean {
    return !this.product || this.product.stock <= 0;
  }

  onCtaClick(event: Event): void {
    event.stopPropagation();

    if (this.isOutOfStock) return;

    // Si hay dos acabados, la elección es del cliente, no nuestra.
    if (this.hasUnpaintedOption) {
      this.goToProductDetails();
      return;
    }

    this.cartService.addToCart(this.product, 'painted', 1);
  }

  goToProductDetails(): void {
    this.router.navigate(['/product', this.product.id]);
  }

  imgUrl(path?: string): string {
    if (!path) return `${environment.STATIC_URL}/images/default-placeholder.jpg`;
    return `${environment.STATIC_URL}/${path}`;
  }
}
