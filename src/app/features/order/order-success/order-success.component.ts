import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-success.component.html',
  styleUrls: ['./order-success.component.scss'],
})
export class OrderSuccessComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);

  order: any;
  loading = true;

  ngOnInit(): void {
    // Obtener el order_id de los parámetros de la URL
    const orderId = this.route.snapshot.queryParams['order_id'];

    if (orderId) {
      this.loadOrderDetails(orderId);
    } else {
      // Si no hay order_id en la URL, intentar obtenerlo del estado de navegación
      const navigation = this.router.getCurrentNavigation();
      if (navigation?.extras.state) {
        this.order = navigation.extras.state['order'];
        this.loading = false;
      } else {
        // Si no hay pedido, redirigir al inicio
        this.router.navigate(['/']);
      }
    }
  }

  loadOrderDetails(orderId: string): void {
    this.orderService.getOrder(orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.loading = false;
        this.router.navigate(['/']);
      }
    });
  }

  goToOrders(): void {
    this.router.navigate(['/profile/orders']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}
