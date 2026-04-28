// Solo HTTPS, dominios de YouTube y un ID alfanumérico de 11 chars
const YOUTUBE_REGEX =
  /^https:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&][\w=\-&%.]*)?$/;

export function extractYoutubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(YOUTUBE_REGEX);
  return match ? match[1] : null;
}

export function isValidYoutubeUrl(url: string | null | undefined): boolean {
  return extractYoutubeId(url) !== null;
}

export function buildYoutubeEmbedUrl(url: string | null | undefined): string | null {
  const id = extractYoutubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}
