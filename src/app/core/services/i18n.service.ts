import {
  DEFAULT_LANGUAGE,
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  resolveSupportedLanguage,
} from '../i18n/supported-languages';
import { Injectable, inject, signal } from '@angular/core';

import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

/**
 * Servicio central de internacionalización.
 *
 * Responsabilidades:
 *   - Detectar el idioma inicial (localStorage > navigator > default).
 *   - Validar SIEMPRE contra la allow-list antes de aplicarlo.
 *   - Cambiar el idioma en caliente y persistirlo.
 *   - Mantener sincronizado el atributo `lang` del <html> (a11y + SEO).
 *
 * NOTA DE SEGURIDAD:
 *   Toda entrada externa (localStorage, navigator) se trata como no
 *   confiable y pasa por `resolveSupportedLanguage` antes de usarse.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);

  private static readonly STORAGE_KEY = '3dlapiz.lang';

  /** Signal reactivo del idioma actual — útil en templates con signals. */
  readonly currentLang = signal<SupportedLanguage>(DEFAULT_LANGUAGE);

  readonly supportedLanguages = SUPPORTED_LANGUAGES;
  readonly languageLabels = LANGUAGE_LABELS;

  /**
   * Inicializa el servicio. Llamar una sola vez al arrancar la app
   * (desde AppComponent).
   */
  init(): void {
    this.translate.addLangs([...SUPPORTED_LANGUAGES]);
    this.translate.setDefaultLang(DEFAULT_LANGUAGE);

    const initial = this.detectInitialLanguage();
    this.use(initial);
  }

  /** Cambia el idioma activo, lo persiste y actualiza el <html lang>. */
  use(lang: string): void {
    const safe = resolveSupportedLanguage(lang);

    this.translate.use(safe).subscribe({
      next: () => {
        this.currentLang.set(safe);
        this.persist(safe);
        this.document.documentElement.setAttribute('lang', safe);
      },
      error: (err) => {
        console.error('[i18n] Error cambiando de idioma', err);
      },
    });
  }

  // ---------- privados ----------

  private detectInitialLanguage(): SupportedLanguage {
    // 1. Preferencia explícita guardada por el usuario.
    const stored = this.readStoredLanguage();
    if (stored) return stored;

    // 2. Preferencia del navegador.
    //    `navigator.languages` (array, en orden de preferencia)
    //    cae bien en `navigator.language` si no existe.
    const candidates: string[] = [
      ...((typeof navigator !== 'undefined' && navigator.languages) || []),
      typeof navigator !== 'undefined' ? navigator.language : '',
    ].filter(Boolean);

    for (const candidate of candidates) {
      const resolved = resolveSupportedLanguage(candidate);
      // Solo aceptamos candidatos que coincidan REALMENTE con uno
      // soportado (no el fallback por defecto, salvo que ya sea ese).
      if (
        resolved !== DEFAULT_LANGUAGE ||
        candidate.toLowerCase().startsWith(DEFAULT_LANGUAGE)
      ) {
        return resolved;
      }
    }

    return DEFAULT_LANGUAGE;
  }

  private readStoredLanguage(): SupportedLanguage | null {
    try {
      const raw = localStorage.getItem(I18nService.STORAGE_KEY);
      if (!raw) return null;
      const safe = resolveSupportedLanguage(raw);
      // Si lo guardado no es válido, lo devolvemos como null para
      // que la detección continúe con el navigator.
      return raw.toLowerCase() === safe ? safe : null;
    } catch {
      // localStorage puede fallar (Safari modo privado, etc.)
      return null;
    }
  }

  private persist(lang: SupportedLanguage): void {
    try {
      localStorage.setItem(I18nService.STORAGE_KEY, lang);
    } catch {
      // Silencioso — no es crítico.
    }
  }
}
