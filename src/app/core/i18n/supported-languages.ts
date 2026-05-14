/**
 * Allow-list de idiomas soportados.
 *
 * SEGURIDAD: cualquier código que llegue desde `navigator.language`,
 * `localStorage` o el selector se valida contra esta lista ANTES de
 * usarse para construir URLs de carga de JSONs. Esto evita inyecciones
 * tipo `../../etc/passwd.json` en el HTTP loader.
 *
 * Para añadir un idioma:
 *   1. Añadir el código aquí.
 *   2. Crear `public/i18n/<codigo>.json`.
 *   3. (Opcional) Añadirlo al mapa `LANGUAGE_LABELS` para el selector.
 */

export const SUPPORTED_LANGUAGES = ['es', 'en'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

/** Etiqueta visible en el selector de idioma. */
export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  es: 'Español',
  en: 'English',
};

/**
 * Valida y devuelve un código de idioma seguro.
 * Acepta entradas como `es`, `es-ES`, `en-US`, `EN`, etc.
 * Si el código (o su prefijo de 2 letras) no está en la allow-list,
 * devuelve el idioma por defecto.
 */
export function resolveSupportedLanguage(
  raw: string | null | undefined,
): SupportedLanguage {
  if (!raw || typeof raw !== 'string') {
    return DEFAULT_LANGUAGE;
  }

  // Normaliza: minúsculas y solo el prefijo (es-ES -> es).
  const normalized = raw.trim().toLowerCase().split(/[-_]/)[0];

  // Validación estricta: solo letras a-z, 2 caracteres exactos.
  if (!/^[a-z]{2}$/.test(normalized)) {
    return DEFAULT_LANGUAGE;
  }

  return (SUPPORTED_LANGUAGES as readonly string[]).includes(normalized)
    ? (normalized as SupportedLanguage)
    : DEFAULT_LANGUAGE;
}
