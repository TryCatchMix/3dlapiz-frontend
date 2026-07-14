import { AdminDiscountsService, DiscountCode } from '../../core/services/admin/admin-discounts.service';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-discounts',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-discounts.component.html',
})
export class AdminDiscountsComponent implements OnInit {
  private api = inject(AdminDiscountsService);
  private fb = inject(NonNullableFormBuilder);

  discounts = signal<DiscountCode[]>([]);
  loading = signal(true);
  error = signal('');
  showForm = signal(false);

  form = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9\-]{3,20}$/)]],
    percentage: [10, [Validators.required, Validators.min(1), Validators.max(99)]],
    expires_at: [''],
    min_order_amount: [null as number | null],
    max_uses: [null as number | null],
    max_uses_per_user: [null as number | null],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (data) => {
        this.discounts.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error cargando códigos');
        this.loading.set(false);
      },
    });
  }

  create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: any = {
      code: raw.code.toUpperCase(),
      percentage: raw.percentage,
    };
    if (raw.expires_at) payload.expires_at = raw.expires_at;
    if (raw.min_order_amount) payload.min_order_amount = raw.min_order_amount;
    if (raw.max_uses) payload.max_uses = raw.max_uses;
    if (raw.max_uses_per_user) payload.max_uses_per_user = raw.max_uses_per_user;

    this.api.create(payload).subscribe({
      next: () => {
        this.form.reset({ percentage: 10, code: '' });
        this.showForm.set(false);
        this.load();
      },
      error: (err) => {
        alert(err.error?.message ?? 'Error al crear el código');
      },
    });
  }

  toggleActive(d: DiscountCode): void {
    this.api.update(d.id, { active: !d.active }).subscribe({
      next: () => this.load(),
    });
  }

  remove(d: DiscountCode): void {
    if (!confirm(`¿Eliminar el código "${d.code}"?`)) return;
    this.api.remove(d.id).subscribe({ next: () => this.load() });
  }
}
