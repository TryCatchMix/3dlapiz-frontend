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
import { environment } from '../../../environments/environment.development';

export interface CartItem {
  id: number;
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
  product_id: number;
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

  private loadCartFromLocalStorage(): void {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cartItems = JSON.parse(savedCart);
      this.cartItemsSubject.next(cartItems);
      this.updateCartState();
    }
  }

  private saveCartToLocalStorage(items: CartItem[]): void {
    localStorage.setItem('cart', JSON.stringify(items));
  }

  private updateCartState(): void {
    const items = this.cartItemsSubject.value;
    this.cartCount.set(items.reduce((total, item) => total + item.quantity, 0));
    this.cartTotal.set(
      items.reduce((total, item) => total + item.price * item.quantity, 0)
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
      })
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
        map((response) => {
          if (response) {
            return this.cartItemsSubject.value;
          }
          return this.cartItemsSubject.value;
        })
      );
  }

  private mergeLocalAndBackendCarts(
    backendCart: BackendCart
  ): Observable<CartItem[]> {
    const localItems = this.cartItemsSubject.value;

    if (localItems.length === 0 && backendCart.items.length > 0) {
      return this.fetchProductDetails(backendCart.items).pipe(
        tap((cartItems) => {
          this.cartItemsSubject.next(cartItems);
          this.updateCartState();
          this.saveCartToLocalStorage(cartItems);
        })
      );
    }

    const productIds = new Set([
      ...localItems.map((item) => item.id),
      ...backendCart.items.map((item) => item.product_id),
    ]);

    const mergedItems: any[] = [];

    productIds.forEach((productId) => {
      const localItem = localItems.find((item) => item.id === productId);
      const backendItem = backendCart.items.find(
        (item) => item.product_id === productId
      );

      if (localItem && backendItem) {
        mergedItems.push({
          ...localItem,
          quantity: Math.max(localItem.quantity, backendItem.quantity),
        });
      } else if (localItem) {
        mergedItems.push(localItem);
      } else if (backendItem) {
  mergedItems.push({
    backendItemId: backendItem.id,
    productId: backendItem.product_id,
    quantity: backendItem.quantity,
    variant: backendItem.variant ?? 'painted',
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
    variant: item.variant ?? 'painted',
    price: item.price != null ? Number(item.price) : undefined,
  }))
).pipe(
      tap((fetchedItems) => {
        const finalItems = mergedItems
          .filter((item) => !item.needsDetails)
          .concat(fetchedItems) as CartItem[];

        this.cartItemsSubject.next(finalItems);
        this.updateCartState();
        this.saveCartToLocalStorage(finalItems);

        this.pushLocalCartToBackend().subscribe();
      })
    );
  }

  private fetchProductDetails(
  items: { product_id: number; quantity: number; variant?: ProductVariant; price?: number }[]
): Observable<CartItem[]> {
  if (items.length === 0) return of([]);

  const productIds = items.map((item) => item.product_id);

  return this.http
    .post<any[]>(`${this.apiUrl}/products/details`, { ids: productIds })
    .pipe(
      map((products) => {
        return items
          .map((item) => {
            const productDetails = products.find((p) => p.id === item.product_id);
            if (!productDetails) return null;

            const variant: ProductVariant = item.variant ?? 'painted';
            // Si el backend mandó snapshot de precio (cart_item.price), úsalo;
            // si no, calcúlalo desde el producto según la variante.
            const fallbackPrice =
              variant === 'unpainted' && productDetails.unpainted_price != null
                ? Number(productDetails.unpainted_price)
                : Number(productDetails.price);

            return {
              id: productDetails.id,
              name: productDetails.name,
              price: item.price ?? fallbackPrice,
              quantity: item.quantity,
              image_url: productDetails.images[0]?.image_url || '',
              stock: productDetails.stock,
              variant,
            } as CartItem;
          })
          .filter((item): item is CartItem => item !== null);
      }),
      catchError((error) => {
        console.error('Error fetching product details', error);
        return of([]);
      })
    );
}

  getCartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  addToCart(product: any, variant: ProductVariant = 'painted'): void {
  // Seguridad: el precio que mostramos viene del producto, pero el precio
  // real se recalcula siempre en backend.
  const variantPrice =
    variant === 'unpainted' && product.unpainted_price != null
      ? Number(product.unpainted_price)
      : Number(product.price);

  const currentItems = this.cartItemsSubject.value;
  const existingItemIndex = currentItems.findIndex(
    (item) => item.id === product.id && item.variant === variant
  );

  let updatedItems: CartItem[];

  if (existingItemIndex > -1) {
    updatedItems = [...currentItems];
    if (updatedItems[existingItemIndex].quantity < product.stock) {
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + 1,
      };
    } else {
      return;
    }
  } else {
    const newItem: CartItem = {
      id: product.id,
      name: product.name,
      price: variantPrice,
      quantity: 1,
      image_url: product.images[0].image_url,
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
        quantity: 1,
        variant,
      })
      .subscribe({
        error: (error) => console.error('Error adding item to backend cart', error),
      });
  }
}

  updateQuantity(productId: number, variant: ProductVariant, quantity: number): void {
  const currentItems = this.cartItemsSubject.value;
  const updatedItems = currentItems.map((item) =>
    item.id === productId && item.variant === variant ? { ...item, quantity } : item
  );
  this.cartItemsSubject.next(updatedItems);
  this.updateCartState();
  this.saveCartToLocalStorage(updatedItems);

  if (this.authStateService.isAuthenticated()) {
    this.http.put(`${this.apiUrl}/cart/update`, {
      product_id: productId,
      quantity,
      variant,
    }).subscribe({ error: (e) => console.error(e) });
  }
}

  removeFromCart(productId: number): void {
    const filteredItems = this.cartItemsSubject.value.filter(
      (item) => item.id !== productId
    );
    this.cartItemsSubject.next(filteredItems);
    this.updateCartState();
    this.saveCartToLocalStorage(filteredItems);

    if (this.authStateService.isAuthenticated()) {
      this.http.delete(`${this.apiUrl}/cart/item/${productId}`).subscribe({
        error: (error) => {
          console.error('Error removing item from backend cart', error);
        },
      });
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

  removeItem(productId: number, variant: ProductVariant): void {
  const updatedItems = this.cartItemsSubject.value.filter(
    (item) => !(item.id === productId && item.variant === variant)
  );
  this.cartItemsSubject.next(updatedItems);
  this.updateCartState();
  this.saveCartToLocalStorage(updatedItems);

  if (this.authStateService.isAuthenticated()) {
    this.http.delete(`${this.apiUrl}/cart/remove`, {
      body: { product_id: productId, variant },
    }).subscribe({ error: (e) => console.error(e) });
  }
}

  checkout(orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders`, orderData).pipe(
      tap(() => {
        this.clearCart();
      })
    );
  }
}
