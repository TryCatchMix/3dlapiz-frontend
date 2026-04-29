import { Component, OnInit, inject } from '@angular/core';

import { AdminOrdersService } from '../../core/services/admin/admin-orders.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6">Pedidos</h1>

      <div class="bg-white rounded shadow overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-gray-50 text-sm">
            <tr>
              <th class="p-3">Nº</th>
              <th class="p-3">Cliente</th>
              <th class="p-3">Total</th>
              <th class="p-3">Estado</th>
              <th class="p-3">Tracking</th>
              <th class="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let o of orders" class="border-t">
              <td class="p-3 font-mono">#{{ o.order_number }}</td>
              <td class="p-3">
                <div>{{ o.shipping_info?.fullName }}</div>
                <div class="text-xs text-gray-500">{{ o.shipping_info?.email }} · {{ o.shipping_info?.phone }}</div>
              </td>
              <td class="p-3">{{ o.total }} €</td>
              <td class="p-3">
                <span class="px-2 py-1 rounded text-xs"
                  [ngClass]="{
                    'bg-yellow-100 text-yellow-800': o.status === 'pending',
                    'bg-green-100 text-green-800': o.status === 'paid',
                    'bg-blue-100 text-blue-800': o.status === 'shipped',
                    'bg-gray-200 text-gray-800': o.status === 'delivered',
                    'bg-red-100 text-red-800': o.status === 'cancelled'
                  }">{{ o.status }}</span>
              </td>
              <td class="p-3 text-sm">
                <span *ngIf="o.tracking_number">{{ o.shipping_carrier }} · {{ o.tracking_number }}</span>
                <span *ngIf="!o.tracking_number" class="text-gray-400">—</span>
              </td>
              <td class="p-3">
                <button *ngIf="o.status === 'paid'" (click)="openTracking(o)"
                  class="text-blue-600 hover:underline text-sm">Marcar enviado</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal tracking -->
      <div *ngIf="trackingFor" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
           (click)="trackingFor = null">
        <div class="bg-white rounded p-6 w-full max-w-md" (click)="$event.stopPropagation()">
          <h2 class="text-lg font-bold mb-4">Añadir tracking — #{{ trackingFor.order_number }}</h2>
          <label class="block text-sm mb-1">Transportista</label>
          <input [(ngModel)]="carrier" class="w-full border rounded p-2 mb-3" placeholder="SEUR, Correos…">
          <label class="block text-sm mb-1">Nº de seguimiento</label>
          <input [(ngModel)]="trackingNumber" class="w-full border rounded p-2 mb-4">
          <div class="flex justify-end gap-2">
            <button (click)="trackingFor = null" class="px-4 py-2 border rounded">Cancelar</button>
            <button (click)="saveTracking()" [disabled]="!carrier || !trackingNumber || saving"
              class="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">Enviar</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminOrdersComponent implements OnInit {
  private api = inject(AdminOrdersService);

  orders: any[] = [];
  trackingFor: any = null;
  carrier = '';
  trackingNumber = '';
  saving = false;

  ngOnInit() { this.load(); }

  load() {
    this.api.list().subscribe((res: any) => {
      this.orders = res.data ?? res;
    });
  }

  openTracking(o: any) {
    this.trackingFor = o;
    this.carrier = '';
    this.trackingNumber = '';
  }

  saveTracking() {
    if (!this.trackingFor) return;
    this.saving = true;
    this.api.setTracking(this.trackingFor.id, this.trackingNumber, this.carrier).subscribe({
      next: () => { this.saving = false; this.trackingFor = null; this.load(); },
      error: () => { this.saving = false; },
    });
  }
}
