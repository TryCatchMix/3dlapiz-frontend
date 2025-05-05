import { Observable, tap } from 'rxjs';

import { BaseHttpService } from '../../shared/data-access/base-http.service';
import { Injectable } from '@angular/core';

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone_country_code: string;
  phone_number: string;
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country_code?: string;
}

export interface LoginData {
  email: string;
  password: string;
  device_name: string;
}

export interface ResetPasswordData {
  email: string;
  password: string;
  password_confirmation: string;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly authPath = '';

  constructor(private baseHttp: BaseHttpService) {}

  register(userData: any): Observable<any> {
    return this.baseHttp.http.post(
      `${this.baseHttp.apiUrl}/${this.authPath}/register`,
      userData
    );
  }

  login(credentials: LoginData): Observable<any> {
    return this.baseHttp.http
      .post(`${this.baseHttp.apiUrl}/${this.authPath}/login`, credentials)
      .pipe(tap((response) => {}));
  }

  logout(): Observable<any> {
    return this.baseHttp.http
      .post(`${this.baseHttp.apiUrl}/${this.authPath}/logout`, {})
      .pipe(
        tap(() => {
          localStorage.removeItem('access_token');
        })
      );
  }

  getUser(): Observable<any> {
    return this.baseHttp.http.get(
      `${this.baseHttp.apiUrl}/${this.authPath}/user`
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.baseHttp.http.post(
      `${this.baseHttp.apiUrl}/${this.authPath}/forgot-password`,
      { email }
    );
  }

  resetPassword(resetData: ResetPasswordData): Observable<any> {
    return this.baseHttp.http.post(
      `${this.baseHttp.apiUrl}/${this.authPath}/reset-password`,
      resetData
    );
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getAuthToken(): string | null {
    return localStorage.getItem('access_token');
  }
}
