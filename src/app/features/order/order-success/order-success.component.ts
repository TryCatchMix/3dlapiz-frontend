import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Component, OnInit, inject, signal } from '@angular/core';

import { CartService } from '../../../core/services/cart.service';
import { CommonModule } from '@angular/common';
import { StripeService } from '../../../core/services/stripe.service';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-success.component.html',
})
export class OrderSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private stripeService = inject(StripeService);
  private cartService = inject(CartService);

  loading = signal(true);
  success = signal(false);
  order = signal<any>(null);
  errorMessage = signal('');

  ngOnInit(): void {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');

    if (!sessionId) {
      this.errorMessage.set('No se encontró información del pago.');
      this.loading.set(false);
      return;
    }

    this.stripeService.confirmPayment(sessionId).subscribe({
      next: (res) => {
        if (res?.success) {
          this.order.set(res.order);
          this.success.set(true);
          this.cartService.clearCart();
        } else {
          this.errorMessage.set(res?.message ?? 'No se pudo confirmar el pago.');
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Error al verificar el pago.');
        this.loading.set(false);
      },
    });
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}
