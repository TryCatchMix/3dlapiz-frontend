import { ActivatedRoute, Router } from '@angular/router';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { CartService } from '../../../core/services/cart.service';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import type { ProductVariant } from '../../../core/models/product.model';
import { buildYoutubeEmbedUrl } from '../../../shared/utils/youtube.util';
import { environment } from '../../../../environments/environment';

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

  // ── NUEVO: zoom con lupa ─────────────────────────────────
  zoomActive = false;
  zoomX = 50;
  zoomY = 50;

  // ── NUEVO: animación volar al carrito ────────────────────
  flying: { fromX: number; fromY: number; dx: number; dy: number; key: number } | null = null;
  added = false;

  @ViewChild('mainImg') mainImg?: ElementRef<HTMLElement>;
  @ViewChild('cartBtn') cartBtn?: ElementRef<HTMLElement>;

  // helper para padding del contador 01/08
  readonly pad = (n: number) => n.toString().padStart(2, '0');

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

  // ── NUEVO: el vídeo se trata como "una imagen más" del carrusel ──
  // Si hay safeVideoUrl, lo metemos como un slot virtual al final.
  // Devuelve true si el slot actual es el del vídeo.
  get totalSlots(): number {
    const imgs = this.product?.images?.length ?? 0;
    return imgs + (this.safeVideoUrl ? 1 : 0);
  }
  get isVideoSlot(): boolean {
    return !!this.safeVideoUrl && this.currentImageIndex === this.product.images.length;
  }

  setVariant(variant: ProductVariant): void {
    if (variant === 'unpainted' && !this.hasUnpaintedOption) return;
    this.selectedVariant = variant;
  }

  prevImage(): void {
    this.zoomActive = false;
    this.currentImageIndex = this.currentImageIndex > 0
      ? this.currentImageIndex - 1
      : this.totalSlots - 1;
  }
  nextImage(): void {
    this.zoomActive = false;
    this.currentImageIndex = this.currentImageIndex < this.totalSlots - 1
      ? this.currentImageIndex + 1
      : 0;
  }
  setImageIndex(index: number): void {
    this.zoomActive = false;
    this.currentImageIndex = index;
  }

  decreaseQuantity(): void { if (this.quantity > 1) this.quantity--; }
  increaseQuantity(): void { if (this.quantity < this.product.stock) this.quantity++; }

  // ── NUEVO: lupa de zoom ────────────────────────────────
  onMouseMove(e: MouseEvent) {
    if (this.isVideoSlot) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    this.zoomX = ((e.clientX - r.left) / r.width) * 100;
    this.zoomY = ((e.clientY - r.top) / r.height) * 100;
    this.zoomActive = true;
  }
  onMouseLeave() { this.zoomActive = false; }

  // ── addToCart con animación "volar al carrito" ─────────
  addToCart(): void {
    if (!this.product || this.product.stock <= 0) return;

    const fromEl = this.mainImg?.nativeElement;
    const toEl = this.cartBtn?.nativeElement;
    if (fromEl && toEl) {
      const a = fromEl.getBoundingClientRect();
      const b = toEl.getBoundingClientRect();
      this.flying = {
        fromX: a.left + a.width / 2,
        fromY: a.top + a.height / 2,
        dx: (b.left + b.width / 2) - (a.left + a.width / 2),
        dy: (b.top + b.height / 2) - (a.top + a.height / 2),
        key: Date.now(),
      };
      setTimeout(() => (this.flying = null), 850);
    }

    for (let i = 0; i < this.quantity; i++) {
      this.cartService.addToCart(this.product, this.selectedVariant);
    }
    this.added = true;
    setTimeout(() => (this.added = false), 1800);
  }

  openLightbox(index: number) {
    if (this.isVideoSlot) return; // no abrir lightbox sobre el iframe
    this.lightboxIndex = index;
    this.lightboxOpen = true;
  }
  closeLightbox() { this.lightboxOpen = false; }

  imageSrc(image: any): string {
     return `${environment.STATIC_URL}/${image.image_url}`;
  }

  trackByIndex(i: number) { return i; }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.lightboxOpen) this.closeLightbox();
    if (!this.lightboxOpen) {
      if (event.key === 'ArrowLeft') this.prevImage();
      if (event.key === 'ArrowRight') this.nextImage();
    }
  }
}
