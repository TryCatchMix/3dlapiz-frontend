import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'EUR', symbol: '€',   name: 'Euro',                locale: 'es-ES' },
  { code: 'USD', symbol: 'US$', name: 'Dólar estadounidense',locale: 'en-US' },
  { code: 'GBP', symbol: '£',   name: 'Libra esterlina',     locale: 'en-GB' },
  { code: 'CAD', symbol: 'CA$', name: 'Dólar canadiense',    locale: 'en-CA' },
  { code: 'AUD', symbol: 'AU$', name: 'Dólar australiano',   locale: 'en-AU' },
  { code: 'MXN', symbol: 'MX$', name: 'Peso mexicano',       locale: 'es-MX' },
  { code: 'ARS', symbol: 'AR$', name: 'Peso argentino',      locale: 'es-AR' },
  { code: 'COP', symbol: 'CO$', name: 'Peso colombiano',     locale: 'es-CO' },
  { code: 'CLP', symbol: 'CL$', name: 'Peso chileno',        locale: 'es-CL' },
  { code: 'BRL', symbol: 'R$',  name: 'Real brasileño',      locale: 'pt' },
];

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private http = inject(HttpClient);

  private STORAGE_KEY = 'preferred_currency';
  private RATES_KEY = 'currency_rates_cache';
  private RATES_TTL_HOURS = 24;

  activeCurrency = signal<Currency>(this.loadStoredCurrency());
  rates = signal<Record<string, number>>({ EUR: 1 });
  loaded = signal(false);

  init(): void {
    const cached = this.getCachedRates();
    if (cached) {
      this.rates.set(cached);
      this.loaded.set(true);
      return;
    }
    this.fetchRates().subscribe({
      next: (r) => {
        this.rates.set(r);
        this.loaded.set(true);
        this.cacheRates(r);
      },
      error: () => {
        this.rates.set({ EUR: 1 });
        this.loaded.set(true);
      },
    });
  }

  setCurrency(code: string): void {
    const c = SUPPORTED_CURRENCIES.find((x) => x.code === code);
    if (!c) return;
    this.activeCurrency.set(c);
    localStorage.setItem(this.STORAGE_KEY, code);
  }

  convert(eurPrice: number | string | null | undefined): number {
    const eur = Number(eurPrice ?? 0);
    if (isNaN(eur)) return 0;
    const r = this.rates();
    const code = this.activeCurrency().code;
    const rate = code === 'EUR' ? 1 : r[code];
    return rate ? eur * rate : eur;
  }

  format(eurPrice: number | string | null | undefined): string {
    const converted = this.convert(eurPrice);
    const c = this.activeCurrency();
    try {
      return new Intl.NumberFormat(c.locale, {
        style: 'currency',
        currency: c.code,
        maximumFractionDigits: 2,
      }).format(converted);
    } catch {
      return `${c.symbol}${converted.toFixed(2)}`;
    }
  }

  isEUR(): boolean {
    return this.activeCurrency().code === 'EUR';
  }

  private loadStoredCurrency(): Currency {
    try {
      const code = localStorage.getItem(this.STORAGE_KEY) ?? 'EUR';
      return SUPPORTED_CURRENCIES.find((c) => c.code === code) ?? SUPPORTED_CURRENCIES[0];
    } catch {
      return SUPPORTED_CURRENCIES[0];
    }
  }

  private fetchRates(): Observable<Record<string, number>> {
    const codes = SUPPORTED_CURRENCIES
      .filter((c) => c.code !== 'EUR')
      .map((c) => c.code)
      .join(',');
    return this.http
      .get<{ rates: Record<string, number> }>(`https://api.frankfurter.dev/v1/latest?base=EUR&symbols=${codes}`)
      .pipe(
        map((res) => ({ EUR: 1, ...res.rates })),
        catchError(() => of({ EUR: 1 } as Record<string, number>))
      );
  }

  private getCachedRates(): Record<string, number> | null {
    try {
      const raw = localStorage.getItem(this.RATES_KEY);
      if (!raw) return null;
      const { rates, ts } = JSON.parse(raw);
      const ageHours = (Date.now() - ts) / (1000 * 60 * 60);
      if (ageHours > this.RATES_TTL_HOURS) return null;
      return rates;
    } catch {
      return null;
    }
  }

  private cacheRates(rates: Record<string, number>): void {
    try {
      localStorage.setItem(this.RATES_KEY, JSON.stringify({ rates, ts: Date.now() }));
    } catch {}
  }
}
