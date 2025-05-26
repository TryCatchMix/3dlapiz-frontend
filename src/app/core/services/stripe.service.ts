import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

declare var Stripe: any;

export interface StripeSessionResponse {
  success: boolean;
  session_id: string;
  order_id: string;
  message?: string;
  error?: string;
}

export interface PaymentConfirmationResponse {
  success: boolean;
  order: any;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripe: any;
  private apiUrl = environment.API_URL;

  constructor(private http: HttpClient) {
    this.stripe = Stripe(environment.stripePublicKey);
  }

  createPaymentSession(orderData: any): Observable<StripeSessionResponse> {
    return this.http.post<StripeSessionResponse>(`${this.apiUrl}/stripe/checkout`, orderData);
  }

  confirmPayment(sessionId: string): Observable<PaymentConfirmationResponse> {
    return this.http.post<PaymentConfirmationResponse>(`${this.apiUrl}/stripe/confirm-payment`, {
      session_id: sessionId
    });
  }

  async redirectToCheckout(sessionId: string): Promise<any> {
    return await this.stripe.redirectToCheckout({
      sessionId: sessionId
    });
  }
}
