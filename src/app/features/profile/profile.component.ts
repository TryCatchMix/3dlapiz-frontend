import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CountryOption, getCountryName, getCountryOptions } from '../../shared/utils/countries.util';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService, User } from '../../core/services/profile.service';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { AuthStateService } from '../../core/services/auth-state.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private authState = inject(AuthStateService);
  private router = inject(Router);

  private destroy$ = new Subject<void>();

  user = signal<User | null>(null);
  countries: CountryOption[] = getCountryOptions();

  loading = signal(true);
  savingAddress = signal(false);
  editingAddress = signal(false);
  sendingResetEmail = signal(false);
  error = signal('');
  success = signal('');

  isAdmin = computed(() => this.authState.isAdmin());

  addressForm: FormGroup = this.fb.group({
    street: ['', [Validators.maxLength(255)]],
    city: ['', [Validators.maxLength(100)]],
    state: ['', [Validators.maxLength(100)]],
    postal_code: ['', [Validators.maxLength(20)]],
    country_code: ['', [Validators.pattern(/^[A-Z]{2}$/)]],
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProfile(): void {
    this.loading.set(true);
    this.profileService
      .getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.user.set(user);
          this.populateAddress(user);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.message ?? 'Error al cargar el perfil');
          this.loading.set(false);
        },
      });
  }

  private populateAddress(user: User): void {
    this.addressForm.patchValue({
      street: user.street ?? '',
      city: user.city ?? '',
      state: user.state ?? '',
      postal_code: user.postal_code ?? '',
      country_code: (user.country_code ?? '').toUpperCase(),
    });
  }

  toggleEditAddress(): void {
    if (this.editingAddress()) {
      // Cancelar: restaurar valores originales
      const u = this.user();
      if (u) this.populateAddress(u);
    }
    this.editingAddress.set(!this.editingAddress());
    this.error.set('');
    this.success.set('');
  }

  saveAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      this.error.set('Revisa los campos marcados.');
      return;
    }

    this.savingAddress.set(true);
    this.error.set('');

    const data = { ...this.addressForm.value };
    Object.keys(data).forEach((k) => {
      if (data[k] === '' || data[k] === null) data[k] = null;
    });

    this.profileService
      .updateAddress(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.user.set(user);
          this.populateAddress(user);
          this.editingAddress.set(false);
          this.savingAddress.set(false);
          this.success.set('Dirección actualizada correctamente.');
          setTimeout(() => this.success.set(''), 4000);
        },
        error: (err) => {
          this.savingAddress.set(false);
          this.error.set(err.error?.message ?? err.message ?? 'Error al guardar la dirección.');
        },
      });
  }

  sendPasswordResetEmail(): void {
    const user = this.user();
    if (!user) return;

    this.sendingResetEmail.set(true);
    this.error.set('');

    this.profileService
      .requestPasswordReset(user.email)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.sendingResetEmail.set(false);
          this.success.set(`Te hemos enviado un correo a ${user.email} con instrucciones para cambiar tu contraseña.`);
        },
        error: () => {
          this.sendingResetEmail.set(false);
          // Por seguridad, no revelamos si el email existe; mostramos el mismo mensaje
          this.success.set(`Si tu correo está registrado, recibirás instrucciones en breve.`);
        },
      });
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }

  goToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  logout(): void {
  this.authService.logout();
}
  countryNameOf(code: string | null | undefined): string {
    return code ? getCountryName(code) : '—';
  }

  hasError(field: string, error: string): boolean {
    const c = this.addressForm.get(field);
    return !!c && c.touched && c.hasError(error);
  }
}
