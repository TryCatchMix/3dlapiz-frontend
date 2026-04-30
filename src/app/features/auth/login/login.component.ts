import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showAlert = false;
  isError = false;
  alertMessage = '';
  returnUrl: string = '/';

  @ViewChild('alert') alertElement!: ElementRef;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach((key) => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password, 'web-browser').subscribe({
      next: () => {
        this.showAlertMessage('Sesión iniciada correctamente', false);
        setTimeout(() => this.router.navigate([this.returnUrl]), 1000);
      },
      error: (err) => {
        let errorMsg = 'No se pudo iniciar sesión. Comprueba tus credenciales.';
        if (err.data?.message) errorMsg = err.data.message;
        else if (err.error) errorMsg = err.error;
        this.showAlertMessage(errorMsg, true);
      },
    });
  }

  showAlertMessage(message: string, isError: boolean): void {
    this.alertMessage = message;
    this.isError = isError;
    this.showAlert = true;
    setTimeout(() => (this.showAlert = false), 5000);
  }

  onForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}
