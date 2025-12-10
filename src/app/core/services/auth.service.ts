import { AuthResponse, User } from '../models/user.model';
import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { AuthStateService } from './auth-state.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.API_URL;
  private tokenService = inject(TokenService);
  private authStateService = inject(AuthStateService);
  private router = inject(Router);
  private tokenCheckInterval: any;

  constructor(private http: HttpClient) {
    this.loadStoredUser();
    this.tokenCheckInterval = setInterval(() => {
      if (this.isLoggedIn()) {
        this.verifyToken().subscribe();
      }
    }, 5 * 60 * 1000);
  }

  ngOnDestroy() {
    clearInterval(this.tokenCheckInterval);
  }

  private loadStoredUser(): void {
    if (this.tokenService.isTokenValid()) {
      //TODO
      console.log('Token valid, fetching user profile...');
      console.log('Token:', this.tokenService.getToken());
      this.getUserProfile().subscribe({ error: () => /*this.clearSession();*/ null }); //TODO
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
      .post<AuthResponse>(`${this.apiUrl}/register`, {
        ...userData,
        device_name: 'web',
      })
      .pipe(
        tap((res) => res.access_token && this.setSession(res)),
        catchError((err) =>
          throwError(() => ({
            error: err.error.message || 'Registration failed',
            data: err.error,
          }))
        )
      );
  }

  login(email: string, password: string, deviceName = 'web'): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
      email,
      password,
      device_name: deviceName,
    }).pipe(
      tap((res) => res.access_token && this.setSession(res)),
      catchError((err) =>
        throwError(() => ({
          error: err.error.message || 'Login failed',
          data: err.error,
          status: err.status,
          statusText: err.statusText,
        }))
      )
    );
  }

  private setSession(auth: AuthResponse): void {
    if (auth.access_token && auth.user) {
      this.tokenService.setToken(auth.access_token);
      this.authStateService.setUser(auth.user);
    }
  }

  logout(): void {
    this.http.post<any>(`${this.apiUrl}/logout`, {})
      .pipe(catchError(() => of(null)))
      .subscribe(() => {
        this.clearSession();
        this.router.navigate(['/login']);
      });
  }

  clearSession(): void {
    this.tokenService.removeToken();
    this.authStateService.clearUser();
  }

  isLoggedIn(): boolean {
    return this.tokenService.isTokenValid();
  }

  getToken(): string | null {
    return this.tokenService.getToken();
  }

  getUserProfile(): Observable<User> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/user`).pipe(
      map((res) => res.user),
      tap((user) => this.authStateService.setUser(user)),
      catchError((err) => {
        //TODO
        //if (err.status === 401) this.clearSession();
        console.error('Error fetching user profile:', err);
        return throwError(() => err);
      })
    );
  }

  verifyRole(requiredRole: 'admin' | 'staff' | 'user'): Observable<boolean> {
    return this.http.get<{ allowed: boolean }>(`${this.apiUrl}/verify-role/${requiredRole}`).pipe(
      map((res) => res.allowed),
      catchError(() => of(false))
    );
  }

  get currentUser() {
    return this.authStateService.currentUser;
  }

  forgotPassword(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/forgot-password`, { email }).pipe(
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
    return this.http.post<AuthResponse>(`${this.apiUrl}/reset-password`, data).pipe(
      catchError((err) =>
        throwError(() => ({
          error: err.error.message || 'Password reset failed',
          data: err.error,
        }))
      )
    );
  }

  verifyToken(): Observable<boolean> {
    return this.http.get(`${this.apiUrl}/verify-token`).pipe(
      map(() => true),
      catchError((err) => {
        //TODO
        //this.clearSession();
        return of(false);
      })
    );
  }
}
