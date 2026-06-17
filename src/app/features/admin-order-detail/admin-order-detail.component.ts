import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Component, OnInit, inject, signal } from '@angular/core';

import { AdminOrdersService } from '../../core/services/admin/admin-orders.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PriceEurPipe } from '../../shared/pipes/price-eur.pipe';
import { environment } from '../../../environments/environment';
import { getCountryName } from '../../shared/utils/countries.util';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PriceEurPipe],
  templateUrl: './admin-order-detail.component.html',
})
export class AdminOrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(AdminOrdersService);

  order = signal<any>(null);
  loading = signal(true);
  error = signal('');

  // tracking form
  carrier = '';
  trackingNumber = '';
  savingTracking = signal(false);
  changingStatus = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('ID de pedido inválido');
      this.loading.set(false);
      return;
    }
    this.load(id);
  }

  load(id: string): void {
    this.loading.set(true);
    this.api.get(id).subscribe({
      next: (data) => {
        this.order.set(data);
        this.carrier = data.shipping_carrier ?? '';
        this.trackingNumber = data.tracking_number ?? '';
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el pedido');
        this.loading.set(false);
      },
    });
  }

  countryName(code?: string | null): string {
    return code ? getCountryName(code) : '—';
  }

  itemImageUrl(path?: string | null): string {
    if (!path) return `${environment.STATIC_URL}/images/default-placeholder.jpg`;
    return `${environment.STATIC_URL}/${path}`;
  }

  saveTracking(): void {
    const o = this.order();
    if (!o || !this.carrier || !this.trackingNumber) return;
    this.savingTracking.set(true);
    this.api.setTracking(o.id, this.trackingNumber, this.carrier).subscribe({
      next: () => { this.savingTracking.set(false); this.load(o.id); },
      error: () => this.savingTracking.set(false),
    });
  }

  changeStatus(newStatus: string): void {
    const o = this.order();
    if (!o) return;
    if (!confirm(`¿Cambiar estado a "${newStatus}"?`)) return;
    this.changingStatus.set(true);
    this.api.updateStatus(o.id, newStatus).subscribe({
      next: () => { this.changingStatus.set(false); this.load(o.id); },
      error: () => this.changingStatus.set(false),
    });
  }

  back(): void {
    this.router.navigate(['/admin/orders']);
  }

  computeSubtotal(items: any[]): number {
    return (items ?? []).reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0);
  }
}
