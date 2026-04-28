import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

export interface ShippingRate {
  id: string;
  country_code: string;
  price: string | number;
}

@Injectable({ providedIn: 'root' })
export class AdminShippingRatesService {
  private http = inject(HttpClient);
  private apiUrl = environment.API_URL;

  list(): Observable<ShippingRate[]> {
    return this.http.get<ShippingRate[]>(`${this.apiUrl}/admin/shipping-rates`);
  }
  create(payload: { country_code: string; price: number }): Observable<ShippingRate> {
    return this.http.post<ShippingRate>(`${this.apiUrl}/admin/shipping-rates`, payload);
  }
  update(id: string, price: number): Observable<ShippingRate> {
    return this.http.put<ShippingRate>(`${this.apiUrl}/admin/shipping-rates/${id}`, { price });
  }
  delete(id: string): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/admin/shipping-rates/${id}`);
  }
}
