import countries from 'i18n-iso-countries';
import esLocale from 'i18n-iso-countries/langs/es.json';

countries.registerLocale(esLocale);

export interface CountryOption {
  code: string;  // ISO alpha-2
  name: string;
}

export function getCountryOptions(): CountryOption[] {
  const map = countries.getNames('es', { select: 'official' });
  return Object.entries(map)
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

export function getCountryName(code: string | null | undefined): string {
  if (!code) return '';
  return countries.getName(code.toUpperCase(), 'es') ?? code;
}
