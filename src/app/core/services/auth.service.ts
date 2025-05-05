import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Injectable, signal } from '@angular/core';
import { catchError, map, tap } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'staff' | 'user';
  phone_country_code?: string;
  phone_number?: string;
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country_code?: string;
}

export interface AuthResponse {
  message: string;
  token_type?: string;
  access_token?: string;
  user?: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenKey = 'auth_token';

  public isAuthenticated = signal(false);
  public currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          this.currentUserSubject.next(user);
          this.isAuthenticated.set(true);
          this.currentUser.set(user);
        } catch (e) {
          this.logout();
        }
      } else {
        this.getUserProfile().subscribe();
      }
    }
  }

  register(userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap((response) => {
          if (response.access_token && response.user) {
            this.setSession(response);
          }
        }),
        catchError((err) => {
          return throwError(() => ({
            error: err.error.message || 'Registration failed',
            data: err.error,
          }));
        })
      );
  }

  login(
    email: string,
    password: string,
    deviceName: string = 'web'
  ): Observable<AuthResponse> {
    const payload = {
      email,
      password,
      device_name: deviceName,
    };

    console.log('Sending payload:', payload);
    console.log('To URL:', `${this.apiUrl}/login`);

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap((response) => {
        console.log('Login response:', response);
        if (response.access_token && response.user) {
          this.setSession(response);
        }
      }),
      catchError((err) => {
        console.error('Login error:', err);
        return throwError(() => ({
          error: err.error.message || 'Login failed',
          data: err.error,
          status: err.status,
          statusText: err.statusText,
        }));
      })
    );
  }

  private setSession(authResult: AuthResponse): void {
    if (authResult.access_token && authResult.user) {
      localStorage.setItem(this.tokenKey, authResult.access_token);
      localStorage.setItem('user_data', JSON.stringify(authResult.user));
      this.currentUserSubject.next(authResult.user);
      this.isAuthenticated.set(true);
      this.currentUser.set(authResult.user);
    }
  }

  logout(): void {
    this.http
      .post<any>(`${this.apiUrl}/logout`, {})
      .pipe(catchError(() => of(null)))
      .subscribe(() => {
        this.clearSession();
        this.router.navigate(['/login']);
      });
  }

  public clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user_data');
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUserProfile(): Observable<User> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/user`).pipe(
      map((response) => response.user),
      tap((user) => {
        localStorage.setItem('user_data', JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.isAuthenticated.set(true);
        this.currentUser.set(user);
        return user;
      }),
      catchError((err) => {
        if (err.status === 401) {
          this.clearSession();
        }
        return throwError(() => err);
      })
    );
  }

  isAdmin(): boolean {
    const user = this.currentUser();
    return user?.role === 'admin';
  }

  getFullName(): string {
    const user = this.currentUser();
    if (user) {
      return `${user.first_name} ${user.last_name}`;
    }
    return '';
  }

  getInitial(): string {
    const user = this.currentUser();
    if (user && user.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    }
    return '';
  }

  forgotPassword(email: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/forgot-password`, { email })
      .pipe(
        catchError((err) =>
          throwError(() => ({
            error: err.error.message || 'Password reset request failed',
            data: err.error,
          }))
        )
      );
  }

  resetPassword(data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/reset-password`, data)
      .pipe(
        catchError((err) =>
          throwError(() => ({
            error: err.error.message || 'Password reset failed',
            data: err.error,
          }))
        )
      );
  }

  checkPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    if (password.length < 8) return 'weak';

    let score = 0;

    if (/[a-z]/.test(password)) score++;

    if (/[A-Z]/.test(password)) score++;

    if (/[0-9]/.test(password)) score++;

    if (/[^a-zA-Z0-9]/.test(password)) score++;

    // Evaluación final
    if (score <= 2) return 'weak';
    if (score === 3) return 'medium';
    return 'strong';
  }

  verifyToken(): Observable<boolean> {
    return this.http.get<any>(`${this.apiUrl}/verify-token`).pipe(
      map(() => true),
      catchError(() => {
        this.clearSession();
        return of(false);
      })
    );
  }
}
