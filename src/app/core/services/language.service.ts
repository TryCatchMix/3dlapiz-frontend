import { Injectable, inject, signal } from '@angular/core';
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES, SupportedLanguage, resolveSupportedLanguage } from '../i18n/supported-languages';

import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private translate = inject(TranslateService);
  private STORAGE_KEY = 'preferred_language';

  activeLang = signal<SupportedLanguage>('es');
  readonly supportedLanguages = SUPPORTED_LANGUAGES;
  readonly labels = LANGUAGE_LABELS;

  init(): void {
    // 1) Prioridad: localStorage > navegador > default
    const stored = this.safeReadStorage();
    const browser = navigator.language;
    const lang = resolveSupportedLanguage(stored ?? browser);

    this.translate.addLangs([...SUPPORTED_LANGUAGES]);
    this.translate.setFallbackLang('es');
    this.translate.use(lang);
    this.activeLang.set(lang);
  }

  setLanguage(raw: string): void {
    const lang = resolveSupportedLanguage(raw);
    this.translate.use(lang);
    this.activeLang.set(lang);
    try {
      localStorage.setItem(this.STORAGE_KEY, lang);
    } catch {}
  }

  private safeReadStorage(): string | null {
    try {
      return localStorage.getItem(this.STORAGE_KEY);
    } catch {
      return null;
    }
  }
}
