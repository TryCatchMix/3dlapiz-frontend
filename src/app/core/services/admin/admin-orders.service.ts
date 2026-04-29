import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminOrdersService {
  private http = inject(HttpClient);
  private apiUrl = environment.API_URL;

  list(params: { page?: number; status?: string; search?: string } = {}): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/orders`, { params: params as any });
  }

  setTracking(id: string, tracking_number: string, shipping_carrier: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/orders/${id}/tracking`, { tracking_number, shipping_carrier });
  }
}
