import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Component, OnInit, inject } from '@angular/core';
import { Order, OrderService } from '../../../core/services/order.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  private orderService = inject(OrderService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  order: Order | null = null;
  loading = true;
  error: string | null = null;
  showCancelModal = false;
  cancellationReason = '';
  cancelling = false;

  ngOnInit(): void {
    const orderId = this.route.snapshot.params['id'];
    this.loadOrderDetails(orderId);
  }

  loadOrderDetails(orderId: number): void {
    this.loading = true;
    this.error = null;

    this.orderService.getOrder(orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.error = 'Error al cargar el pedido. Por favor, intenta de nuevo.';
        this.loading = false;
      }
    });
  }

  openCancelModal(): void {
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.cancellationReason = '';
  }

  confirmCancelOrder(): void {
    if (!this.order) return;

    this.cancelling = true;

    this.orderService.cancelOrder(this.order.id, this.cancellationReason).subscribe({
      next: () => {
        this.cancelling = false;
        this.closeCancelModal();
        this.loadOrderDetails(this.order!.id);
      },
      error: (error) => {
        console.error('Error cancelling order:', error);
        this.cancelling = false;
        alert('Error al cancelar el pedido. Por favor, intenta de nuevo.');
      }
    });
  }

  canCancelOrder(): boolean {
    return this.order?.status === 'pending' || this.order?.status === 'processing';
  }

  getStatusLabel(status: string): string {
    return this.orderService.getStatusLabel(status);
  }

  getStatusColor(status: string): string {
    return this.orderService.getStatusColor(status);
  }

  goBack(): void {
    this.router.navigate(['/profile/orders']);
  }

  getOrderItemsTotal(): number {
    if (!this.order) return 0;
    return this.order.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  }
}
