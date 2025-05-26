import { CartItem, CartService } from '../../core/services/cart.service';
import { Component, OnInit } from '@angular/core';

import { AuthStateService } from '../../core/services/auth-state.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: [],
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  isLoading = false;

  constructor(
    public cartService: CartService,
    private router: Router,
    private authStateService: AuthStateService
  ) {}

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe((items) => {
      this.cartItems = items;
    });

    if (this.authStateService.isAuthenticated()) {
      this.syncWithBackend();
    }
  }

  syncWithBackend(): void {
    this.isLoading = true;
    this.cartService.syncWithBackend().subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  updateQuantity(item: CartItem, quantity: number): void {
    this.cartService.updateQuantity(item.id, quantity);
  }

  removeItem(itemId: number): void {
    this.cartService.removeFromCart(itemId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  proceedToCheckout(): void {
    if (!this.authStateService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.router.navigate(['/checkout']);
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }
}
