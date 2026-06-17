import { BehaviorSubject, Observable, map } from 'rxjs';
import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_country_code?: string | null;
  phone_number?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country_code?: string | null;
  created_at?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  user?: T;
  errors?: any;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private apiUrl = environment.API_URL;

  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  getProfile(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/profile`).pipe(
      map((res) => {
        if (res.success && res.user) {
          this.userSubject.next(res.user);
          return res.user;
        }
        throw new Error(res.message || 'Error al cargar el perfil');
      })
    );
  }

  updateAddress(address: {
    street?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country_code?: string | null;
  }): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/profile`, address).pipe(
      map((res) => {
        if (res.success && res.user) {
          this.userSubject.next(res.user);
          return res.user;
        }
        throw new Error(res.message || 'Error al actualizar la dirección');
      })
    );
  }

  requestPasswordReset(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, { email });
  }
}
