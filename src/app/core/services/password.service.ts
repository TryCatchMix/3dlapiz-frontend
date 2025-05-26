import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PasswordService {
  /**
   * Check password strength
   * @returns 'weak', 'medium', or 'strong'
   */
  checkPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    if (password.length < 8) return 'weak';

    let score = 0;

    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    // Final evaluation
    if (score <= 2) return 'weak';
    if (score === 3) return 'medium';
    return 'strong';
  }
}
