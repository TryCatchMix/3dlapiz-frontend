import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { Country, ProfileLimits, ProfileService, User } from '../../core/services/profile.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap, takeUntil } from 'rxjs';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: []
})
export class ProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Signals para el estado de la aplicación
  user = signal<User | null>(null);
  countries = signal<Country[]>([]);
  filteredCountries = signal<Country[]>([]);
  profileLimits = signal<ProfileLimits | null>(null);

  editMode = signal(false);
  loading = signal(false);
  saving = signal(false);
  error = signal<string>('');
  successMessage = signal<string>('');

  // Estados para desplegables
  showCountryDropdown = signal(false);
  showPhoneCountryDropdown = signal(false);
  countrySearchTerm = signal('');
  phoneCountrySearchTerm = signal('');

  // Formularios reactivos
  profileForm: FormGroup;
  passwordForm: FormGroup;
  showPasswordModal = signal(false);

  // Computed properties
  remainingChanges = computed(() => this.user()?.remaining_changes ?? 0);
  canChangeProfile = computed(() => this.user()?.can_change_profile ?? false);
  isAdmin = computed(() => this.user()?.role === 'admin');

  constructor(
    private profileService: ProfileService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.createProfileForm();
    this.passwordForm = this.createPasswordForm();
  }

  ngOnInit(): void {
    this.loadProfile();
    this.loadCountries();
    this.loadProfileLimits();
    this.setupFormWatchers();
  }

  private createProfileForm(): FormGroup {
    return this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      last_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone_country_code: [''],
      phone_number: ['', [Validators.pattern(/^[0-9\s\-\(\)]+$/)]],
      street: ['', [Validators.maxLength(255)]],
      city: ['', [Validators.maxLength(100)]],
      state: ['', [Validators.maxLength(100)]],
      postal_code: ['', [Validators.maxLength(20)]],
      country_code: ['', [Validators.pattern(/^[A-Z]{2}$/)]]
    });
  }

  private createPasswordForm(): FormGroup {
    return this.fb.group({
      current_password: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(12)]],
      password_confirmation: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('password_confirmation');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirmPassword?.errors?.['passwordMismatch']) {
      delete confirmPassword.errors['passwordMismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }

    return null;
  }

  private setupFormWatchers(): void {
    // Watcher para búsqueda de países (dirección)
    this.profileForm.get('country_code')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.countrySearchTerm.set(value || '');
        this.filterCountries(value || '');
      });

    // Watcher para búsqueda de códigos telefónicos
    this.profileForm.get('phone_country_code')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.phoneCountrySearchTerm.set(value || '');
        this.filterPhoneCountries(value || '');
      });
  }

  private loadProfile(): void {
    this.loading.set(true);
    this.error.set('');

    this.profileService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.user.set(user);
          this.populateForm(user);
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set(error.message || 'Error al cargar el perfil');
          this.loading.set(false);
        }
      });
  }

  private loadCountries(): void {
    this.profileService.getCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (countries) => {
          this.countries.set(countries);
          this.filteredCountries.set(countries);
        },
        error: (error) => {
          console.error('Error loading countries:', error);
        }
      });
  }

  private loadProfileLimits(): void {
    this.profileService.getProfileLimits()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (limits) => {
          this.profileLimits.set(limits);
        },
        error: (error) => {
          console.error('Error loading profile limits:', error);
        }
      });
  }

  private populateForm(user: User): void {
    this.profileForm.patchValue({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone_country_code: user.phone_country_code || '',
      phone_number: user.phone_number || '',
      street: user.street || '',
      city: user.city || '',
      state: user.state || '',
      postal_code: user.postal_code || '',
      country_code: user.country_code || ''
    });
  }

  toggleEditMode(): void {
    if (!this.canChangeProfile() && !this.isAdmin()) {
      this.error.set('Has alcanzado el límite de cambios de perfil este mes.');
      return;
    }

    this.editMode.set(!this.editMode());
    this.error.set('');
    this.successMessage.set('');

    if (!this.editMode()) {
      // Cancelar edición: restaurar valores originales
      const currentUser = this.user();
      if (currentUser) {
        this.populateForm(currentUser);
      }
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      this.error.set('Por favor, corrige los errores en el formulario.');
      return;
    }

    if (!this.canChangeProfile() && !this.isAdmin()) {
      this.error.set('Has alcanzado el límite de cambios de perfil este mes.');
      return;
    }

    this.saving.set(true);
    this.error.set('');

    const formData = this.profileForm.value;

    // Limpiar campos vacíos
    Object.keys(formData).forEach(key => {
      if (formData[key] === '') {
        formData[key] = null;
      }
    });

    this.profileService.updateProfile(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.user.set(user);
          this.editMode.set(false);
          this.saving.set(false);
          this.successMessage.set('Perfil actualizado correctamente');
          this.loadProfileLimits(); // Recargar límites

          // Limpiar mensaje después de 5 segundos
          setTimeout(() => this.successMessage.set(''), 5000);
        },
        error: (error) => {
          this.saving.set(false);
          if (error.status === 422 && error.error?.errors) {
            // Errores de validación
            this.handleValidationErrors(error.error.errors);
          } else {
            this.error.set(error.message || 'Error al actualizar el perfil');
          }
        }
      });
  }

  private handleValidationErrors(errors: any): void {
    Object.keys(errors).forEach(field => {
      const formControl = this.profileForm.get(field);
      if (formControl) {
        formControl.setErrors({ server: errors[field][0] });
      }
    });

    this.error.set('Por favor, corrige los errores en el formulario.');
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Manejo de desplegables de países
  filterCountries(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredCountries.set(this.countries());
      return;
    }

    const filtered = this.countries().filter(country =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    this.filteredCountries.set(filtered);
  }

  selectCountry(country: Country): void {
    this.profileForm.patchValue({ country_code: country.code });
    this.showCountryDropdown.set(false);
  }

  // Manejo de desplegables de códigos telefónicos
  filterPhoneCountries(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredCountries.set(this.countries());
      return;
    }

    const filtered = this.countries().filter(country =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.phone_code.includes(searchTerm) ||
      country.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    this.filteredCountries.set(filtered);
  }

  selectPhoneCountry(country: Country): void {
    this.profileForm.patchValue({ phone_country_code: country.phone_code });
    this.showPhoneCountryDropdown.set(false);
  }

  // Manejo de cambio de contraseña
  openPasswordModal(): void {
    this.showPasswordModal.set(true);
    this.passwordForm.reset();
  }

  closePasswordModal(): void {
    this.showPasswordModal.set(false);
    this.passwordForm.reset();
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }

    const passwordData = this.passwordForm.value;

    this.profileService.changePassword(passwordData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.closePasswordModal();
          this.successMessage.set('Contraseña cambiada correctamente');
          setTimeout(() => this.successMessage.set(''), 5000);
        },
        error: (error) => {
          if (error.status === 422 && error.error?.errors) {
            this.handlePasswordValidationErrors(error.error.errors);
          } else {
            this.error.set(error.message || 'Error al cambiar la contraseña');
          }
        }
      });
  }

  private handlePasswordValidationErrors(errors: any): void {
    Object.keys(errors).forEach(field => {
      const formControl = this.passwordForm.get(field);
      if (formControl) {
        formControl.setErrors({ server: errors[field][0] });
      }
    });
  }

  // Utilidades para el template
  getFieldError(fieldName: string): string {
    const control = this.profileForm.get(fieldName);
    if (control && control.touched && control.errors) {
      if (control.errors['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (control.errors['email']) {
        return 'Ingresa un email válido';
      }
      if (control.errors['minlength']) {
        return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
      }
      if (control.errors['maxlength']) {
        return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
      }
      if (control.errors['pattern']) {
        return `Formato inválido para ${this.getFieldLabel(fieldName)}`;
      }
      if (control.errors['server']) {
        return control.errors['server'];
      }
    }
    return '';
  }

  getPasswordFieldError(fieldName: string): string {
    const control = this.passwordForm.get(fieldName);
    if (control && control.touched && control.errors) {
      if (control.errors['required']) {
        return 'Este campo es requerido';
      }
      if (control.errors['minlength']) {
        return 'La contraseña debe tener al menos 12 caracteres';
      }
      if (control.errors['passwordMismatch']) {
        return 'Las contraseñas no coinciden';
      }
      if (control.errors['server']) {
        return control.errors['server'];
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'first_name': 'Nombre',
      'last_name': 'Apellido',
      'email': 'Email',
      'phone_country_code': 'Código de país',
      'phone_number': 'Teléfono',
      'street': 'Dirección',
      'city': 'Ciudad',
      'state': 'Provincia/Estado',
      'postal_code': 'Código postal',
      'country_code': 'País'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.profileForm.get(fieldName);
    return !!(control && control.touched && control.errors);
  }

  isPasswordFieldInvalid(fieldName: string): boolean {
    const control = this.passwordForm.get(fieldName);
    return !!(control && control.touched && control.errors);
  }

  // Eventos de clicks fuera para cerrar dropdowns
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;

    // Cerrar dropdown de países si se hace click fuera
    if (!target.closest('.country-dropdown-container')) {
      this.showCountryDropdown.set(false);
    }

    // Cerrar dropdown de códigos telefónicos si se hace click fuera
    if (!target.closest('.phone-country-dropdown-container')) {
      this.showPhoneCountryDropdown.set(false);
    }
  }

  ngAfterViewInit(): void {
    // Agregar listener para clicks fuera de los dropdowns
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.onDocumentClick.bind(this));
    this.destroy$.next();
    this.destroy$.complete();
  }
}
