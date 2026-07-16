import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(enLocale);

export interface CountryOption {
  code: string;  // ISO alpha-2
  name: string;
}

export function getCountryOptions(): CountryOption[] {
  const map = countries.getNames('en', { select: 'official' });
  return Object.entries(map)
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'en'));
}

export function getCountryName(code: string | null | undefined): string {
  if (!code) return '';
  return countries.getName(code.toUpperCase(), 'en') ?? code;
}
