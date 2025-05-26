import { ChangePasswordData, User, UserUpdateData } from '../models/user.model';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = environment.API_URL;
  private readonly userPath = 'users';
  private tokenService = inject(TokenService);
  private passwordService = inject(PasswordService);

  constructor(private http: HttpClient) {}

  updateProfile(userData: UserUpdateData): Observable<User> {
    return this.http.put<User>(
      `${this.apiUrl}/${this.userPath}/profile`,
      userData
    ).pipe(
      catchError((err) => throwError(() => ({
        error: err.error.message || 'Profile update failed',
        data: err.error,
      })))
    );
  }

  changePassword(passwordData: ChangePasswordData): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${this.userPath}/change-password`,
      passwordData
    ).pipe(
      catchError((err) => throwError(() => ({
        error: err.error.message || 'Password change failed',
        data: err.error,
      })))
    );
  }

  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(
      `${this.apiUrl}/${this.userPath}/${userId}`
    ).pipe(
      catchError((err) => throwError(() => ({
        error: err.error.message || 'Failed to get user data',
        data: err.error,
      })))
    );
  }

  getUsers(page: number = 1, perPage: number = 10): Observable<{users: User[], total: number}> {
    return this.http.get<{users: User[], total: number}>(
      `${this.apiUrl}/${this.userPath}`,
      {
        params: {
          page: page.toString(),
          per_page: perPage.toString()
        }
      }
    ).pipe(
      catchError((err) => throwError(() => ({
        error: err.error.message || 'Failed to get users',
        data: err.error,
      })))
    );
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/${this.userPath}/${userId}`
    ).pipe(
      catchError((err) => throwError(() => ({
        error: err.error.message || 'Failed to delete user',
        data: err.error,
      })))
    );
  }

  checkPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    return this.passwordService.checkPasswordStrength(password);
  }
}
