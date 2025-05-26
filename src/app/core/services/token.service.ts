import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = 'auth_token';

  constructor(private storageService: StorageService) {}

  setToken(token: string): void {
    this.storageService.set(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return this.storageService.get<string>(this.TOKEN_KEY);
  }

  removeToken(): void {
    this.storageService.remove(this.TOKEN_KEY);
  }

  isTokenValid(): boolean {
    return !!this.getToken();
  }
}
