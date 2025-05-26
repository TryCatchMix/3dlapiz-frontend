import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage: Storage = sessionStorage;


  set(key: string, value: any): void {
    try {
      const serializedValue = JSON.stringify(value);
      this.storage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = this.storage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting from storage:', error);
      return null;
    }
  }


  remove(key: string): void {
    this.storage.removeItem(key);
  }


  clear(): void {
    this.storage.clear();
  }


  exists(key: string): boolean {
    return this.storage.getItem(key) !== null;
  }
}
