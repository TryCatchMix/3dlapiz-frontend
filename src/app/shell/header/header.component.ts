import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { CurrencyService, SUPPORTED_CURRENCIES } from '../../core/services/currency.service';

import { AuthService } from '../../core/services/auth.service';
import { AuthStateService } from '../../core/services/auth-state.service';
import { CartService } from '../../core/services/cart.service';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../core/services/language.service';
import { RouterModule } from '@angular/router';
import { SUPPORTED_LANGUAGES } from '../../core/i18n/supported-languages';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './header.component.html',
  styles: [],
})
export class HeaderComponent {
  showUserMenu = false;
  showMobileMenu = false;

  currencyService = inject(CurrencyService);
  languageService = inject(LanguageService);
  currencies = SUPPORTED_CURRENCIES;
  languages = SUPPORTED_LANGUAGES;

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

  onLanguageChange(event: Event): void {
    this.languageService.setLanguage((event.target as HTMLSelectElement).value);
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
