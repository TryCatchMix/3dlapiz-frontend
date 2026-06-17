import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { CurrencyService, SUPPORTED_CURRENCIES } from '../../core/services/currency.service';

import { AuthService } from '../../core/services/auth.service';
import { AuthStateService } from '../../core/services/auth-state.service';
import { CartService } from '../../core/services/cart.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styles: [],
})
export class HeaderComponent {
  showUserMenu = false;
  showMobileMenu = false;

  currencyService = inject(CurrencyService);
  currencies = SUPPORTED_CURRENCIES;

  constructor(
    public cartService: CartService,
    public authService: AuthService,
    public authStateService: AuthStateService,
    private el: ElementRef,
  ) {}

  toggleUserMenu(): void { this.showUserMenu = !this.showUserMenu; }
  toggleMobileMenu(): void { this.showMobileMenu = !this.showMobileMenu; }

  onCurrencyChange(event: Event): void {
    this.currencyService.setCurrency((event.target as HTMLSelectElement).value);
  }

  logout(): void {
    this.authService.logout();
    this.showUserMenu = false;
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event) {
    if (!this.el.nativeElement.contains(e.target)) this.showUserMenu = false;
  }
}
