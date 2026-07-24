import { Injectable, inject } from '@angular/core';

import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminOrdersService {
  private http = inject(HttpClient);
  private apiUrl = environment.API_URL;

  list(
    params: {
      page?: number;
      per_page?: number;
      status?: string;
      search?: string;
    } = {},
  ): Observable<any> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        httpParams = httpParams.set(k, String(v));
      }
    });
    return this.http.get(`${this.apiUrl}/admin/orders`, { params: httpParams });
  }

  setTracking(
    id: string,
    tracking_number: string,
    shipping_carrier: string,
  ): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/orders/${id}/tracking`, {
      tracking_number,
      shipping_carrier,
    });
  }

  get(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/orders/${id}`);
  }

  updateStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/orders/${id}/status`, {
      status,
    });
  }
}
