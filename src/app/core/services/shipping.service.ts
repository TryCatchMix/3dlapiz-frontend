import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ShippingQuote {
  country_code: string;
  price: number;
}

@Injectable({ providedIn: 'root' })
export class ShippingService {
  private http = inject(HttpClient);
  private apiUrl = environment.API_URL;

  // Pequeña caché por código para evitar pegar al backend al cambiar de input
  private cache = new Map<string, Observable<ShippingQuote>>();

  calculate(countryCode: string): Observable<ShippingQuote> {
    const code = (countryCode || '').toUpperCase().trim();
    if (!/^[A-Z]{2}$/.test(code)) {
      return of({ country_code: code, price: 0 });
    }
    if (!this.cache.has(code)) {
      this.cache.set(
        code,
        this.http
          .get<ShippingQuote>(`${this.apiUrl}/shipping/calculate`, { params: { country_code: code } })
          .pipe(
            catchError(() => of({ country_code: code, price: 0 })),
            shareReplay(1),
          ),
      );
    }
    return this.cache.get(code)!;
  }

  invalidate(): void {
    this.cache.clear();
  }
}
