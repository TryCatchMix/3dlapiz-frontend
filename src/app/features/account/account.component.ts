import { AuthService, User } from '../../core/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './account.component.html',
  styleUrls: [],
})
export class AccountComponent implements OnInit {
  user: User | null = null;
  loading = true;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.user = this.authService.currentUser();

    if (!this.user) {
      this.loading = true;
      this.authService.getUserProfile().subscribe({
        next: (userData) => {
          this.user = userData;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'No se pudo cargar la información del usuario';
          this.loading = false;
          console.error('Error al cargar perfil:', err);

          if (err.status === 401) {
            this.router.navigate(['/login'], {
              queryParams: { returnUrl: this.router.url },
            });
          }
        },
      });
    } else {
      this.loading = false;
    }
  }

  editProfile(): void {
    this.router.navigate(['/edit-profile']);
  }
}
