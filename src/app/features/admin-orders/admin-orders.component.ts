import { Component, OnInit, OnDestroy, inject } from '@angular/core';

import { AdminOrdersService } from '../../core/services/admin/admin-orders.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6">Pedidos</h1>

      <!-- Filtros -->
      <div class="flex flex-wrap gap-3 items-center mb-4">
        <input
          [(ngModel)]="search"
          (ngModelChange)="onSearchChange()"
          placeholder="Buscar por nº de pedido…"
          class="border rounded p-2 flex-1 min-w-[220px]"
        />

        <select
          [(ngModel)]="status"
          (ngModelChange)="applyFilters()"
          class="border rounded p-2"
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="processing">En proceso</option>
          <option value="paid">Pagado</option>
          <option value="shipped">Enviado</option>
          <option value="delivered">Entregado</option>
          <option value="cancelled">Cancelado</option>
          <option value="failed">Fallido</option>
        </select>

        <select
          [ngModel]="perPage"
          (ngModelChange)="changePageSize($event)"
          class="border rounded p-2"
        >
          <option *ngFor="let s of pageSizes" [ngValue]="s">
            {{ s }} por página
          </option>
        </select>

        <span class="text-sm text-gray-500">{{ total }} pedidos</span>
      </div>

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
            <tr
              *ngFor="let o of orders; trackBy: trackById"
              class="border-t cursor-pointer hover:bg-gray-50 transition"
              (click)="viewOrder(o)"
            >
              <td class="p-3 font-mono">#{{ o.order_number }}</td>
              <td class="p-3">
                <div>{{ o.shipping_info?.fullName }}</div>
                <div class="text-xs text-gray-500">
                  {{ o.shipping_info?.email }} · {{ o.shipping_info?.phone }}
                </div>
              </td>
              <td class="p-3">{{ o.total }} €</td>
              <td class="p-3">
                <span
                  class="px-2 py-1 rounded text-xs"
                  [ngClass]="{
                    'bg-yellow-100 text-yellow-800': o.status === 'pending',
                    'bg-indigo-100 text-indigo-800': o.status === 'processing',
                    'bg-green-100 text-green-800': o.status === 'paid',
                    'bg-blue-100 text-blue-800': o.status === 'shipped',
                    'bg-gray-200 text-gray-800': o.status === 'delivered',
                    'bg-red-100 text-red-800': o.status === 'cancelled',
                    'bg-red-200 text-red-900': o.status === 'failed',
                  }"
                  >{{ o.status }}</span
                >
              </td>
              <td class="p-3 text-sm">
                <span *ngIf="o.tracking_number"
                  >{{ o.shipping_carrier }} · {{ o.tracking_number }}</span
                >
                <span *ngIf="!o.tracking_number" class="text-gray-400">—</span>
              </td>
              <td class="p-3">
                <button
                  *ngIf="o.status === 'paid'"
                  (click)="$event.stopPropagation(); openTracking(o)"
                  class="text-blue-600 hover:underline text-sm"
                >
                  Marcar enviado
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Estados vacíos / carga -->
        <div *ngIf="loading" class="p-4 text-center text-gray-500">Cargando…</div>
        <div
          *ngIf="!loading && orders.length === 0"
          class="p-6 text-center text-gray-500"
        >
          No hay pedidos con esos filtros.
        </div>

        <!-- Paginador -->
        <div
          *ngIf="lastPage > 1"
          class="flex items-center justify-between p-3 border-t text-sm"
        >
          <button
            (click)="goToPage(page - 1)"
            [disabled]="page === 1 || loading"
            class="px-3 py-1 border rounded disabled:opacity-40"
          >
            ← Anterior
          </button>

          <span>Página {{ page }} de {{ lastPage }}</span>

          <button
            (click)="goToPage(page + 1)"
            [disabled]="page === lastPage || loading"
            class="px-3 py-1 border rounded disabled:opacity-40"
          >
            Siguiente →
          </button>
        </div>
      </div>

      <!-- Modal tracking -->
      <div
        *ngIf="trackingFor"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        (click)="trackingFor = null"
      >
        <div
          class="bg-white rounded p-6 w-full max-w-md"
          (click)="$event.stopPropagation()"
        >
          <h2 class="text-lg font-bold mb-4">
            Añadir tracking — #{{ trackingFor.order_number }}
          </h2>
          <label class="block text-sm mb-1">Transportista</label>
          <input
            [(ngModel)]="carrier"
            class="w-full border rounded p-2 mb-3"
            placeholder="SEUR, Correos…"
          />
          <label class="block text-sm mb-1">Nº de seguimiento</label>
          <input
            [(ngModel)]="trackingNumber"
            class="w-full border rounded p-2 mb-4"
          />
          <div class="flex justify-end gap-2">
            <button
              (click)="trackingFor = null"
              class="px-4 py-2 border rounded"
            >
              Cancelar
            </button>
            <button
              (click)="saveTracking()"
              [disabled]="!carrier || !trackingNumber || saving"
              class="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminOrdersComponent implements OnInit, OnDestroy {
  private api = inject(AdminOrdersService);
  private router = inject(Router);

  orders: any[] = [];
  loading = false;

  // paginación
  page = 1;
  perPage = 50;
  lastPage = 1;
  total = 0;
  readonly pageSizes = [25, 50, 100, 200];

  // filtros
  status = '';
  search = '';
  private searchTimer: any;

  trackingFor: any = null;
  carrier = '';
  trackingNumber = '';
  saving = false;

  ngOnInit() {
    this.load();
  }

  ngOnDestroy() {
    clearTimeout(this.searchTimer);
  }

  load() {
    this.loading = true;
    this.api
      .list({
        page: this.page,
        per_page: this.perPage,
        status: this.status || undefined,
        search: this.search.trim() || undefined,
      })
      .subscribe({
        next: (res: any) => {
          this.orders = res.data ?? [];
          this.page = res.current_page ?? 1;
          this.lastPage = res.last_page ?? 1;
          this.total = res.total ?? this.orders.length;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  goToPage(p: number) {
    if (p < 1 || p > this.lastPage || p === this.page || this.loading) return;
    this.page = p;
    this.load();
  }

  changePageSize(size: number) {
    this.perPage = Number(size);
    this.page = 1;
    this.load();
  }

  applyFilters() {
    this.page = 1;
    this.load();
  }

  onSearchChange() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.applyFilters(), 350);
  }

  trackById(_: number, o: any) {
    return o.id;
  }

  openTracking(o: any) {
    this.trackingFor = o;
    this.carrier = '';
    this.trackingNumber = '';
  }

  viewOrder(o: any): void {
    this.router.navigate(['/admin/orders', o.id]);
  }

  saveTracking() {
    if (!this.trackingFor) return;
    this.saving = true;
    this.api
      .setTracking(this.trackingFor.id, this.trackingNumber, this.carrier)
      .subscribe({
        next: () => {
          this.saving = false;
          this.trackingFor = null;
          this.load();
        },
        error: () => {
          this.saving = false;
        },
      });
  }
}
