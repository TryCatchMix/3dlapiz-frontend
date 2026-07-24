import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { Injectable, inject, signal } from '@angular/core';

import { AuthStateService } from './auth-state.service';
import { HttpClient } from '@angular/common/http';
import type { ProductVariant } from '../models/product.model';
import { environment } from '../../../environments/environment';

const VALID_VARIANTS: ProductVariant[] = ['painted', 'unpainted'];

function isValidVariant(v: any): v is ProductVariant {
  return VALID_VARIANTS.includes(v);
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  stock: number;
  variant: ProductVariant;
}

export interface BackendCartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  variant: ProductVariant;
  price: number;
}

export interface BackendCart {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  items: BackendCartItem[];
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = environment.API_URL;
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  public cartCount = signal(0);
  public cartTotal = signal(0);
  public isSyncing = signal(false);

  private authStateService = inject(AuthStateService);

  constructor(private http: HttpClient) {
    this.loadCartFromLocalStorage();

    this.authStateService.currentUser$.subscribe((user) => {
      if (user) {
        this.syncWithBackend();
      }
    });
  }

  /**
   * Clave de identidad de una línea de carrito.
   * Un producto puede estar dos veces con variantes distintas: la identidad
   * NO es el product_id, es product_id + variante.
   */
  private itemKey(productId: string, variant: ProductVariant): string {
    return `${productId}::${variant}`;
  }

  private loadCartFromLocalStorage(): void {
    const savedCart = localStorage.getItem('cart');
    if (!savedCart) return;

    try {
      const parsed = JSON.parse(savedCart);
      if (!Array.isArray(parsed)) {
        localStorage.removeItem('cart');
        return;
      }

      // Descartamos entradas sin variante válida (carritos guardados por
      // versiones antiguas). Una línea con variante ambigua es exactamente
      // lo que provocaba cobrar la variante equivocada: mejor perderla.
      const clean = parsed.filter(
        (item: any) => item && isValidVariant(item.variant),
      );

      if (clean.length !== parsed.length) {
        console.warn('Se descartaron líneas del carrito sin variante válida');
      }

      this.cartItemsSubject.next(clean as CartItem[]);
      this.updateCartState();
      this.saveCartToLocalStorage(clean as CartItem[]);
    } catch {
      localStorage.removeItem('cart');
    }
  }

  private saveCartToLocalStorage(items: CartItem[]): void {
    localStorage.setItem('cart', JSON.stringify(items));
  }

  private updateCartState(): void {
    const items = this.cartItemsSubject.value;
    this.cartCount.set(items.reduce((total, item) => total + item.quantity, 0));
    this.cartTotal.set(
      items.reduce((total, item) => total + item.price * item.quantity, 0),
    );
  }

  syncWithBackend(): Observable<CartItem[]> {
    if (!this.authStateService.isAuthenticated()) {
      return of(this.cartItemsSubject.value);
    }

    this.isSyncing.set(true);

    return this.http.get<BackendCart>(`${this.apiUrl}/cart`).pipe(
      catchError((error) => {
        console.error('Error fetching cart from backend', error);
        this.isSyncing.set(false);
        return of(null);
      }),
      switchMap((backendCart) => {
        if (!backendCart) {
          return this.pushLocalCartToBackend();
        }

        return this.mergeLocalAndBackendCarts(backendCart);
      }),
      tap(() => {
        this.isSyncing.set(false);
      }),
    );
  }

  private pushLocalCartToBackend(): Observable<CartItem[]> {
    const localItems = this.cartItemsSubject.value;

    if (localItems.length === 0) {
      return of([]);
    }

    const cartItems = localItems.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
      variant: item.variant,
    }));

    return this.http
      .post<BackendCart>(`${this.apiUrl}/cart/sync`, { items: cartItems })
      .pipe(
        catchError((error) => {
          console.error('Error syncing cart with backend', error);
          return of(null);
        }),
        map(() => this.cartItemsSubject.value),
      );
  }

  private mergeLocalAndBackendCarts(
    backendCart: BackendCart,
  ): Observable<CartItem[]> {
    const localItems = this.cartItemsSubject.value;

    // Ignoramos líneas del backend con variante inválida en vez de asumir
    // 'painted': si no sabemos qué pidió el cliente, no lo inventamos.
    const backendItems = (backendCart.items ?? []).filter((i) =>
      isValidVariant(i.variant),
    );

    if (localItems.length === 0 && backendItems.length > 0) {
      return this.fetchProductDetails(backendItems).pipe(
        tap((cartItems) => {
          this.cartItemsSubject.next(cartItems);
          this.updateCartState();
          this.saveCartToLocalStorage(cartItems);
        }),
      );
    }

    // ── Merge por (producto + variante), no solo por producto ──
    const keys = new Set<string>([
      ...localItems.map((i) => this.itemKey(i.id, i.variant)),
      ...backendItems.map((i) => this.itemKey(i.product_id, i.variant)),
    ]);

    const mergedItems: any[] = [];

    keys.forEach((key) => {
      const localItem = localItems.find(
        (i) => this.itemKey(i.id, i.variant) === key,
      );
      const backendItem = backendItems.find(
        (i) => this.itemKey(i.product_id, i.variant) === key,
      );

      if (localItem && backendItem) {
        mergedItems.push({
          ...localItem,
          variant: localItem.variant, // explícito, nunca heredado por descuido
          quantity: Math.max(localItem.quantity, backendItem.quantity),
        });
      } else if (localItem) {
        mergedItems.push(localItem);
      } else if (backendItem) {
        mergedItems.push({
          backendItemId: backendItem.id,
          productId: backendItem.product_id,
          quantity: backendItem.quantity,
          variant: backendItem.variant,
          price: backendItem.price,
          needsDetails: true,
        });
      }
    });

    const itemsNeedingDetails = mergedItems.filter((item) => item.needsDetails);

    if (itemsNeedingDetails.length === 0) {
      const finalItems = mergedItems as CartItem[];
      this.cartItemsSubject.next(finalItems);
      this.updateCartState();
      this.saveCartToLocalStorage(finalItems);

      return this.pushLocalCartToBackend();
    }

    return this.fetchProductDetails(
      itemsNeedingDetails.map((item: any) => ({
        product_id: item.productId,
        quantity: item.quantity,
        variant: item.variant,
        price: item.price != null ? Number(item.price) : undefined,
      })),
    ).pipe(
      tap((fetchedItems) => {
        const finalItems = mergedItems
          .filter((item) => !item.needsDetails)
          .concat(fetchedItems) as CartItem[];

        this.cartItemsSubject.next(finalItems);
        this.updateCartState();
        this.saveCartToLocalStorage(finalItems);

        this.pushLocalCartToBackend().subscribe();
      }),
    );
  }

  private fetchProductDetails(
    items: {
      product_id: string;
      quantity: number;
      variant: ProductVariant;
      price?: number;
    }[],
  ): Observable<CartItem[]> {
    if (items.length === 0) return of([]);

    const productIds = [...new Set(items.map((item) => item.product_id))];

    return this.http
      .post<any[]>(`${this.apiUrl}/products/details`, { ids: productIds })
      .pipe(
        map((products) => {
          return items
            .map((item) => {
              const productDetails = products.find(
                (p) => p.id === item.product_id,
              );
              if (!productDetails) return null;
              if (!isValidVariant(item.variant)) return null;

              // Si el backend mandó snapshot de precio (cart_item.price), úsalo;
              // si no, calcúlalo desde el producto según la variante.
              // Este precio es solo para mostrar: el real se recalcula en backend.
              const fallbackPrice =
                item.variant === 'unpainted' &&
                productDetails.unpainted_price != null
                  ? Number(productDetails.unpainted_price)
                  : Number(productDetails.price);

              return {
                id: productDetails.id,
                name: productDetails.name,
                price: item.price ?? fallbackPrice,
                quantity: item.quantity,
                image_url: productDetails.images?.[0]?.image_url ?? '',
                stock: productDetails.stock,
                variant: item.variant,
              } as CartItem;
            })
            .filter((item): item is CartItem => item !== null);
        }),
        catchError((error) => {
          console.error('Error fetching product details', error);
          return of([]);
        }),
      );
  }

  getCartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  /**
   * La variante es OBLIGATORIA: sin valor por defecto.
   * Si alguna llamada la omitía, ahora falla en compilación en vez de
   * añadir silenciosamente la versión pintada.
   */
  addToCart(product: any, variant: ProductVariant, quantity: number = 1): void {
    if (!isValidVariant(variant)) {
      console.error('Variante no válida al añadir al carrito', variant);
      return;
    }
    if (variant === 'unpainted' && product.unpainted_price == null) {
      console.error('Este producto no tiene variante sin pintar', product?.id);
      return;
    }

    const qty = Math.max(1, Math.floor(quantity));

    // El precio que mostramos viene del producto; el real se recalcula
    // siempre en backend a partir de la variante.
    const variantPrice =
      variant === 'unpainted' && product.unpainted_price != null
        ? Number(product.unpainted_price)
        : Number(product.price);

    const currentItems = this.cartItemsSubject.value;
    const existingItemIndex = currentItems.findIndex(
      (item) => item.id === product.id && item.variant === variant,
    );

    let updatedItems: CartItem[];
    let quantityAdded = 0;

    if (existingItemIndex > -1) {
      const existing = currentItems[existingItemIndex];
      const newQuantity = Math.min(existing.quantity + qty, product.stock);
      quantityAdded = newQuantity - existing.quantity;

      if (quantityAdded <= 0) return; // ya está al límite de stock

      updatedItems = [...currentItems];
      updatedItems[existingItemIndex] = {
        ...existing,
        quantity: newQuantity,
      };
    } else {
      quantityAdded = Math.min(qty, product.stock);
      if (quantityAdded <= 0) return;

      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: variantPrice,
        quantity: quantityAdded,
        image_url: product.images?.[0]?.image_url ?? '',
        stock: product.stock,
        variant,
      };
      updatedItems = [...currentItems, newItem];
    }

    this.cartItemsSubject.next(updatedItems);
    this.updateCartState();
    this.saveCartToLocalStorage(updatedItems);

    if (this.authStateService.isAuthenticated()) {
      this.http
        .post(`${this.apiUrl}/cart/add`, {
          product_id: product.id,
          quantity: quantityAdded,
          variant,
        })
        .subscribe({
          error: (error) =>
            console.error('Error adding item to backend cart', error),
        });
    }
  }

  updateQuantity(
    productId: string,
    variant: ProductVariant,
    quantity: number,
  ): void {
    const currentItems = this.cartItemsSubject.value;
    const updatedItems = currentItems.map((item) =>
      item.id === productId && item.variant === variant
        ? { ...item, quantity }
        : item,
    );
    this.cartItemsSubject.next(updatedItems);
    this.updateCartState();
    this.saveCartToLocalStorage(updatedItems);

    if (this.authStateService.isAuthenticated()) {
      this.http
        .put(`${this.apiUrl}/cart/update`, {
          product_id: productId,
          quantity,
          variant,
        })
        .subscribe({ error: (e) => console.error(e) });
    }
  }

  /**
   * @deprecated Usa removeItem(). Se mantiene con la variante ya obligatoria
   * para que cualquier llamada antigua falle en compilación.
   */
  removeFromCart(productId: string, variant: ProductVariant): void {
    this.removeItem(productId, variant);
  }

  removeItem(productId: string, variant: ProductVariant): void {
    const updatedItems = this.cartItemsSubject.value.filter(
      (item) => !(item.id === productId && item.variant === variant),
    );
    this.cartItemsSubject.next(updatedItems);
    this.updateCartState();
    this.saveCartToLocalStorage(updatedItems);

    if (this.authStateService.isAuthenticated()) {
      this.http
        .delete(`${this.apiUrl}/cart/remove`, {
          body: { product_id: productId, variant },
        })
        .subscribe({ error: (e) => console.error(e) });
    }
  }

  clearCart(): void {
    this.cartItemsSubject.next([]);
    this.updateCartState();
    localStorage.removeItem('cart');

    if (this.authStateService.isAuthenticated()) {
      this.http.delete(`${this.apiUrl}/cart/clear`).subscribe({
        error: (error) => {
          console.error('Error clearing backend cart', error);
        },
      });
    }
  }

  checkout(orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders`, orderData).pipe(
      tap(() => {
        this.clearCart();
      }),
    );
  }
}
