import { Observable, of } from 'rxjs';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';

import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { resolveSupportedLanguage } from './supported-languages';

/**
 * Loader HTTP de traducciones con validación.
 *
 * SEGURIDAD:
 *   - Valida el código de idioma contra la allow-list ANTES de construir
 *     la URL. Aunque ngx-translate ya saneará la entrada, añadimos esta
 *     capa como defensa en profundidad.
 *   - Si el JSON falla al cargarse, devuelve `{}` en lugar de romper la
 *     app. Las claves se mostrarán "en crudo" (p.ej. `HEADER.HOME`),
 *     que es preferible a una pantalla en blanco.
 */
export class SafeTranslateLoader implements TranslateLoader {
  constructor(
    private readonly http: HttpClient,
    private readonly prefix = '/i18n/',
    private readonly suffix = '.json',
  ) {}

  getTranslation(lang: string): Observable<TranslationObject> {
    const safeLang = resolveSupportedLanguage(lang);
    const url = `${this.prefix}${safeLang}${this.suffix}`;

    return this.http.get<TranslationObject>(url).pipe(
      catchError((err) => {
        // Logueamos pero no rompemos la UI: devolvemos un objeto vacío
        // y ngx-translate mostrará la clave en crudo (p.ej. `HEADER.HOME`),
        // que es preferible a una pantalla en blanco.
        console.error(`[i18n] No se pudo cargar ${url}`, err);
        return of<TranslationObject>({});
      }),
    );
  }
}

/** Factory que ngx-translate espera en su configuración. */
export function safeTranslateLoaderFactory(http: HttpClient): TranslateLoader {
  return new SafeTranslateLoader(http);
}
