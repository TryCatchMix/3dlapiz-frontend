import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { I18nService } from '../../../core/services/i18n.service';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Selector de idioma. Estilizado con las clases Tailwind del proyecto
 * (primaryText / primaryHover / primaryWithBg) para encajar con el
 * resto del header.
 */
@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="sr-only" for="lang-select">
      {{ 'COMMON.LANGUAGE' | translate }}
    </label>
    <select
      id="lang-select"
      [value]="i18n.currentLang()"
      (change)="onChange($event)"
      class="
        bg-primaryWithBg text-primaryText border border-primaryHover
        rounded-full px-3 py-1 text-sm font-medium
        focus:outline-none focus:ring-2 focus:ring-primaryHover
        cursor-pointer
      "
      [attr.aria-label]="'COMMON.LANGUAGE' | translate"
    >
      <option *ngFor="let lang of i18n.supportedLanguages" [value]="lang">
        {{ i18n.languageLabels[lang] }}
      </option>
    </select>
  `,
})
export class LanguageSwitcherComponent {
  readonly i18n = inject(I18nService);

  onChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.i18n.use(value);
  }
}
