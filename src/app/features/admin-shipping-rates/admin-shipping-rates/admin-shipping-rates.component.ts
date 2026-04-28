import { AdminShippingRatesService, ShippingRate } from '../../../core/services/admin/shipping-rates.service';
import { Component, OnInit, inject } from '@angular/core';
import { CountryOption, getCountryName, getCountryOptions } from '../../../shared/utils/countries.util';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-shipping-rates',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-3xl mx-auto p-4">
      <div class="bg-white rounded-lg shadow p-6">
        <h1 class="text-2xl font-bold mb-6">Precios de envío por país</h1>

        <p class="text-sm text-gray-600 mb-4">
          Por defecto: <strong>España 20€</strong>, resto del mundo <strong>70€</strong>.
          Aquí solo aparecen los países con un precio personalizado.
        </p>

        <form [formGroup]="form" (ngSubmit)="add()" class="flex flex-wrap gap-3 items-end mb-6">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium mb-1">País</label>
            <select formControlName="country_code" class="w-full border rounded p-2">
              <option value="">— selecciona —</option>
              <option *ngFor="let c of countries" [value]="c.code">{{ c.name }}</option>
            </select>
          </div>
          <div class="w-32">
            <label class="block text-sm font-medium mb-1">Precio (€)</label>
            <input type="number" step="0.01" min="0" formControlName="price" class="w-full border rounded p-2" />
          </div>
          <button type="submit" [disabled]="form.invalid || saving"
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            Añadir
          </button>
        </form>

        <table class="w-full text-left">
          <thead>
            <tr class="border-b text-sm text-gray-600">
              <th class="py-2">País</th>
              <th class="py-2">Precio</th>
              <th class="py-2 w-40">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of rates" class="border-b">
              <td class="py-2">{{ countryName(r.country_code) }} ({{ r.country_code }})</td>
              <td class="py-2">
                <input type="number" step="0.01" min="0" [value]="r.price"
                  #priceInput class="w-28 border rounded p-1" />
              </td>
              <td class="py-2 space-x-2">
                <button (click)="save(r, priceInput.value)" class="text-blue-600 hover:underline">Guardar</button>
                <button (click)="remove(r)" class="text-red-600 hover:underline">Eliminar</button>
              </td>
            </tr>
            <tr *ngIf="rates.length === 0">
              <td colspan="3" class="py-4 text-gray-500 text-center">No hay precios personalizados.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class AdminShippingRatesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(AdminShippingRatesService);

  countries: CountryOption[] = getCountryOptions();
  rates: ShippingRate[] = [];
  saving = false;

  form = this.fb.group({
    country_code: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}$/)]],
    price: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.list().subscribe((rates) => (this.rates = rates));
  }

  countryName(code: string): string {
    return getCountryName(code);
  }

  add(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.api.create({
      country_code: this.form.value.country_code!.toUpperCase(),
      price: Number(this.form.value.price),
    }).subscribe({
      next: () => { this.saving = false; this.form.reset({ country_code: '', price: 0 }); this.load(); },
      error: () => { this.saving = false; },
    });
  }

  save(rate: ShippingRate, value: string): void {
    const price = Number(value);
    if (isNaN(price) || price < 0) return;
    this.api.update(rate.id, price).subscribe(() => this.load());
  }

  remove(rate: ShippingRate): void {
    if (!confirm(`¿Eliminar precio personalizado para ${rate.country_code}?`)) return;
    this.api.delete(rate.id).subscribe(() => this.load());
  }
}
