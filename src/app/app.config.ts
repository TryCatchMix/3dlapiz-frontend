import { ApplicationConfig, provideAppInitializer, provideZoneChangeDetection, inject } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { CartService } from './core/services/cart.service';
import { CurrencyService } from './core/services/currency.service';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    CartService,
    provideAppInitializer(() => {
      const cs = inject(CurrencyService);
      cs.init();
    }),
  ],
};
