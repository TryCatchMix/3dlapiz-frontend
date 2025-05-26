import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';

import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (req.url.includes('/logout') || req.url.includes('/login')) {
    return next(req);
  }

  const token = tokenService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 && !req.url.includes('/logout')) {
        authService.clearSession();
        if (!router.url.includes('/login')) {
          router.navigate(['/login'], {
            queryParams: { returnUrl: router.url },
          });
        }
      }
      return throwError(() => error);
    })
  );
};
