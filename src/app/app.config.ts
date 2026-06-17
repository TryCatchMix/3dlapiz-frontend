import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { TranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { CartService } from './core/services/cart.service';
import { CurrencyService } from './core/services/currency.service';
import { LanguageService } from './core/services/language.service';
import { SafeTranslateLoader } from './core/i18n/safe-translate-loader';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    CartService,

    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => new SafeTranslateLoader(http, '/i18n/', '.json'),
        deps: [HttpClient],
      },
      fallbackLang: 'es',
      lang: 'es',
    }),

    provideAppInitializer(() => {
      const cs = inject(CurrencyService);
      const ls = inject(LanguageService);
      cs.init();
      ls.init();
    }),
  ],
};
