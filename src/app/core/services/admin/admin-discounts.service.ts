import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface DiscountCode {
  id: string;
  code: string;
  percentage: number;
  expires_at: string | null;
  min_order_amount: number | null;
  max_uses: number | null;
  max_uses_per_user: number | null;
  used_count: number;
  active: boolean;
  created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminDiscountsService {
  private http = inject(HttpClient);
  private apiUrl = environment.API_URL;

  list(): Observable<DiscountCode[]> {
    return this.http.get<DiscountCode[]>(`${this.apiUrl}/admin/discounts`);
  }

  create(data: Partial<DiscountCode>): Observable<DiscountCode> {
    return this.http.post<DiscountCode>(`${this.apiUrl}/admin/discounts`, data);
  }

  update(id: string, data: Partial<DiscountCode>): Observable<DiscountCode> {
    return this.http.put<DiscountCode>(`${this.apiUrl}/admin/discounts/${id}`, data);
  }

  remove(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/discounts/${id}`);
  }
}
