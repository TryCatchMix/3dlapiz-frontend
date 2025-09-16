import { BehaviorSubject, Observable, map } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';

export interface Country {
  code: string;
  name: string;
  phone_code: string;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_country_code?: string;
  phone_number?: string;
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country_code?: string;
  role: string;
  phone_verified: boolean;
  formatted_phone?: string;
  remaining_changes: number;
  can_change_profile: boolean;
  last_profile_change?: string;
}

export interface ProfileLimits {
  max_changes_per_month: number;
  remaining_changes: number;
  can_change: boolean;
  reset_date?: string;
  last_change?: string;
  changes_used: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  user?: T;
  countries?: T;
  limits?: T;
  errors?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = environment.API_URL; // Asume que tienes esto en environment
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el perfil del usuario actual
   */
  getProfile(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/profile`)
      .pipe(
        map(response => {
          if (response.success && response.user) {
            this.userSubject.next(response.user);
            return response.user;
          }
          throw new Error(response.message || 'Error al obtener el perfil');
        })
      );
  }

  /**
   * Actualiza el perfil del usuario
   */
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/profile`, userData)
      .pipe(
        map(response => {
          if (response.success && response.user) {
            this.userSubject.next(response.user);
            return response.user;
          }
          throw new Error(response.message || 'Error al actualizar el perfil');
        })
      );
  }

  /**
   * Obtiene los límites de cambios de perfil
   */
  getProfileLimits(): Observable<ProfileLimits> {
    return this.http.get<ApiResponse<ProfileLimits>>(`${this.apiUrl}/profile/limits`)
      .pipe(
        map(response => {
          if (response.success && response.limits) {
            return response.limits;
          }
          throw new Error(response.message || 'Error al obtener los límites');
        })
      );
  }

  /**
   * Cambia la contraseña del usuario
   */
  changePassword(passwordData: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/profile/change-password`, passwordData)
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Error al cambiar la contraseña');
          }
        })
      );
  }

  /**
   * Obtiene la lista de países con códigos telefónicos
   */
  getCountries(): Observable<Country[]> {
    return this.http.get<ApiResponse<Country[]>>(`${this.apiUrl}/countries`)
      .pipe(
        map(response => {
          if (response.success && response.countries) {
            return response.countries;
          }
          throw new Error('Error al obtener la lista de países');
        })
      );
  }

  /**
   * Busca países por nombre o código
   */
  searchCountries(query: string): Observable<Country[]> {
    return this.http.get<ApiResponse<Country[]>>(`${this.apiUrl}/countries/search`, {
      params: { q: query }
    }).pipe(
      map(response => {
        if (response.success && response.countries) {
          return response.countries;
        }
        return [];
      })
    );
  }

  /**
   * Obtiene el usuario actual del subject
   */
  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  /**
   * Limpia los datos del usuario
   */
  clearUser(): void {
    this.userSubject.next(null);
  }
}
