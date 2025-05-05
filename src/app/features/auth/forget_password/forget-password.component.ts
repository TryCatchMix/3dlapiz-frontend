import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center">
      <div class="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 class="text-2xl font-semibold text-yellow-400 mb-4">Reset Password</h2>
        <div class="alert" [class.show]="showAlert" [class.error]="isError">
          {{ alertMessage }}
        </div>
        <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300">Email</label>
            <input type="email" formControlName="email" class="mt-1 p-2 w-full rounded bg-gray-700 text-white">
            <div *ngIf="forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched" class="text-red-400 text-sm mt-1">
              <div *ngIf="forgotPasswordForm.get('email')?.errors?.['required']">Email is required</div>
              <div *ngIf="forgotPasswordForm.get('email')?.errors?.['email']">Email format is invalid</div>
            </div>
          </div>
          <button type="submit" [disabled]="isSubmitting" class="bg-yellow-400 text-gray-800 py-2 px-4 rounded-full font-semibold hover:bg-yellow-500 transition w-full">
            {{ isSubmitting ? 'Sending...' : 'Send Reset Link' }}
          </button>
        </form>
        <p class="mt-4 text-sm text-gray-400 text-center">
          <a routerLink="/login" class="text-yellow-400 hover:underline">Back to Login</a>
        </p>
      </div>
    </div>
  `,
  styleUrls: ['../auth.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  showAlert = false;
  isError = false;
  alertMessage = '';
  isSubmitting = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      Object.keys(this.forgotPasswordForm.controls).forEach(key => {
        const control = this.forgotPasswordForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    this.authService.forgotPassword(this.forgotPasswordForm.value.email)
      .subscribe({
        next: (response) => {
          this.showAlertMessage(response.message || 'Password reset link has been sent to your email', false);
          this.isSubmitting = false;
        },
        error: (err) => {
          let errorMsg = 'Failed to send reset link. Please try again.';

          if (err.data && err.data.message) {
            errorMsg = err.data.message;
          } else if (err.error) {
            errorMsg = err.error;
          }

          this.showAlertMessage(errorMsg, true);
          this.isSubmitting = false;
        }
      });
  }

  showAlertMessage(message: string, isError: boolean): void {
    this.alertMessage = message;
    this.isError = isError;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }
}
