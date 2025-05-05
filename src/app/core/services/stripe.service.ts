import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private apiUrl = environment.API_URL;

  constructor(private http: HttpClient) {}

  createPaymentSession(orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/stripe/checkout`, orderData);
  }

  confirmPayment(sessionId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/stripe/success?session_id=${sessionId}`);
  }

  redirectToCheckout(sessionId: string): Promise<any> {
    window.location.href = sessionId;
    return Promise.resolve({ success: true });
  }
}
