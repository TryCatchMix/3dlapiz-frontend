import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable, signal } from '@angular/core';

import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  public isAuthenticated = signal(false);
  public currentUser = signal<User | null>(null);

  setUser(user: User): void {
    this.currentUserSubject.next(user);
    this.isAuthenticated.set(true);
    this.currentUser.set(user);
  }


  clearUser(): void {
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
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


  isAdmin(): boolean {
    const user = this.currentUser();
    return user?.role === 'admin';
  }


  isStaff(): boolean {
    const user = this.currentUser();
    return user?.role === 'staff';
  }
}
