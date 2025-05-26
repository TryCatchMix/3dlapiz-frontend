import * as CryptoJS from 'crypto-js';

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EncryptedStorageService {
  private readonly SECRET_KEY = environment.ENCRYPTION_KEY || 'default-secure-key-change-in-production';

  /**
   * Store encrypted data in localStorage
   * @param key Storage key
   * @param value Value to store (will be encrypted)
   */
  set<T>(key: string, value: T): void {
    try {
      const valueStr = JSON.stringify(value);
      const encrypted = CryptoJS.AES.encrypt(valueStr, this.SECRET_KEY).toString();
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Error encrypting and storing data:', error);
    }
  }

  /**
   * Retrieve and decrypt data from localStorage
   * @param key Storage key
   * @returns Decrypted data or null if not found/error
   */
  get<T>(key: string): T | null {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;

      const decrypted = CryptoJS.AES.decrypt(encrypted, this.SECRET_KEY);
      const valueStr = decrypted.toString(CryptoJS.enc.Utf8);
      if (!valueStr) return null;

      return JSON.parse(valueStr) as T;
    } catch (error) {
      console.error('Error retrieving or decrypting data:', error);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   * @param key Storage key to remove
   */
  remove(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}
