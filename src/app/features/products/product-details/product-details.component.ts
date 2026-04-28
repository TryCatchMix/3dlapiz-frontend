import { ActivatedRoute, Router } from '@angular/router';
import { Component, HostListener, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { CartService } from '../../../core/services/cart.service';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import type { ProductVariant } from '../../../core/models/product.model';
import { buildYoutubeEmbedUrl } from '../../../shared/utils/youtube.util';

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
  lightboxOpen = false;
  lightboxIndex = 0;

  selectedVariant: ProductVariant = 'painted';
  safeVideoUrl: SafeResourceUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const productId = params['id'];
      if (productId) this.loadProduct(productId);
    });
  }

  loadProduct(id: string): void {
    this.productService.getProductWithImages(Number(id)).subscribe({
      next: (data) => this.onProductLoaded(data),
      error: () => {
        this.productService.getProduct(id).subscribe({
          next: (data) => this.onProductLoaded(data),
          error: () => this.router.navigate(['/products']),
        });
      },
    });
  }

  private onProductLoaded(data: any): void {
    this.product = data;
    this.selectedVariant = 'painted';

    // Construimos NOSOTROS la URL del embed a partir del ID validado.
    const embed = buildYoutubeEmbedUrl(data?.youtube_url);
    this.safeVideoUrl = embed ? this.sanitizer.bypassSecurityTrustResourceUrl(embed) : null;
  }

  get hasUnpaintedOption(): boolean {
    return this.product?.unpainted_price != null && this.product?.unpainted_price !== '';
  }

  get currentPrice(): number {
    if (!this.product) return 0;
    return this.selectedVariant === 'unpainted' && this.hasUnpaintedOption
      ? Number(this.product.unpainted_price)
      : Number(this.product.price);
  }

  setVariant(variant: ProductVariant): void {
    if (variant === 'unpainted' && !this.hasUnpaintedOption) return;
    this.selectedVariant = variant;
  }

  prevImage(): void {
    this.currentImageIndex = this.currentImageIndex > 0
      ? this.currentImageIndex - 1
      : this.product.images.length - 1;
  }
  nextImage(): void {
    this.currentImageIndex = this.currentImageIndex < this.product.images.length - 1
      ? this.currentImageIndex + 1
      : 0;
  }
  setImageIndex(index: number): void { this.currentImageIndex = index; }

  decreaseQuantity(): void { if (this.quantity > 1) this.quantity--; }
  increaseQuantity(): void { if (this.quantity < this.product.stock) this.quantity++; }

  addToCart(): void {
    if (this.product.stock <= 0) return;
    for (let i = 0; i < this.quantity; i++) {
      this.cartService.addToCart(this.product, this.selectedVariant);
    }
  }

  openLightbox(index: number) { this.lightboxIndex = index; this.lightboxOpen = true; }
  closeLightbox() { this.lightboxOpen = false; }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.lightboxOpen) this.closeLightbox();
  }
}
