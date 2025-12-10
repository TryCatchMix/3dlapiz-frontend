import { Component, OnInit, inject } from '@angular/core';
import { Order, OrderService } from '../../../core/services/order.service';
import { Router, RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss']
})
export class OrdersListComponent implements OnInit {
  private orderService = inject(OrderService);
  private router = inject(Router);

  orders: Order[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = null;

    this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.error = 'Error al cargar los pedidos. Por favor, intenta de nuevo.';
        this.loading = false;
      }
    });
  }

  viewOrderDetails(orderId: number): void {
    this.router.navigate(['/profile/orders', orderId]);
  }

  getStatusLabel(status: string): string {
    return this.orderService.getStatusLabel(status);
  }

  getStatusColor(status: string): string {
    return this.orderService.getStatusColor(status);
  }

  getOrderTotal(order: Order): number {
    return order.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  }
}
