import countries from 'i18n-iso-countries';

export interface CountryOption {
  code: string;  // ISO alpha-2
  name: string;
}

export function getCountryOptions(): CountryOption[] {
  // Usamos 'en' directamente. No requiere registrar ningún locale previo.
  const map = countries.getNames('en', { select: 'official' });
  return Object.entries(map)
    .map(([code, name]) => ({ code, name }))
    // Ordenamos alfabéticamente usando las reglas de ordenación en inglés ('en')
    .sort((a, b) => a.name.localeCompare(b.name, 'en'));
}

export function getCountryName(code: string | null | undefined): string {
  if (!code) return '';
  return countries.getName(code.toUpperCase(), 'en') ?? code;
}
