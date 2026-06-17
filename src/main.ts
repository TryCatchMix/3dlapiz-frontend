import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { bootstrapApplication } from '@angular/platform-browser';
import localeEnAu from '@angular/common/locales/en-AU';
import localeEnCa from '@angular/common/locales/en-CA';
import localeEnGb from '@angular/common/locales/en-GB';
import localeEs from '@angular/common/locales/es';
import localeEsAr from '@angular/common/locales/es-AR';
import localeEsCl from '@angular/common/locales/es-CL';
import localeEsCo from '@angular/common/locales/es-CO';
import localeEsMx from '@angular/common/locales/es-MX';
import localePtBr from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localeEs);
registerLocaleData(localeEnGb);
registerLocaleData(localeEnCa);
registerLocaleData(localeEnAu);
registerLocaleData(localeEsMx);
registerLocaleData(localeEsAr);
registerLocaleData(localeEsCo);
registerLocaleData(localeEsCl);
registerLocaleData(localePtBr);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
