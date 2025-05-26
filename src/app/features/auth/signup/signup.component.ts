import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { PasswordService } from '../../../core/services/password.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  showAlert = false;
  isError = false;
  alertMessage = '';
  passwordStrength: 'weak' | 'medium' | 'strong' = 'weak';

  @ViewChild('alert') alertElement!: ElementRef;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private readonly pass: PasswordService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.signupForm = this.formBuilder.group(
      {
        first_name: ['', [Validators.required, Validators.maxLength(50)]],
        last_name: ['', [Validators.required, Validators.maxLength(50)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        password_confirmation: ['', Validators.required],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );

    this.signupForm.get('password')?.valueChanges.subscribe((password) => {
      if (password) {
        this.passwordStrength =
          this.pass.checkPasswordStrength(password);
      } else {
        this.passwordStrength = 'weak';
      }
    });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('password_confirmation')?.value;

    if (password === confirmPassword) {
      return null;
    }

    return { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      Object.keys(this.signupForm.controls).forEach((key) => {
        const control = this.signupForm.get(key);
        control?.markAsTouched();
      });

      this.showAlertMessage('Please correct errors in the form', true);
      return;
    }

    this.authService.register(this.signupForm.value).subscribe({
      next: (response) => {
        this.showAlertMessage(
          response.message || 'Registration successful!',
          false
        );

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        let errorMsg = 'Registration failed. Please try again.';

        if (err.data && typeof err.data === 'object') {
          if (err.data.errors) {
            const errors = Object.values(err.data.errors).flat();
            if (errors.length > 0) {
              errorMsg = errors.join('. ');
            }
          } else if (err.data.message) {
            errorMsg = err.data.message;
          }
        } else if (err.error) {
          errorMsg = err.error;
        }

        this.showAlertMessage(errorMsg, true);
      },
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
