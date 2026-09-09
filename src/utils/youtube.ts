/**
 * Helper utilities for YouTube and video parsing
 * Supports all YouTube formats: standard, shorts, mobile (m.), youtu.be, embed, live, raw ID, query params, etc.
 */

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  let trimmed = url.trim();

  // Strip leading/trailing quotes or angle brackets
  trimmed = trimmed.replace(/^["'<(\[]+|["'>)\]]+$/g, '').trim();

  // 1. If already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // 2. Query parameter v= or vi= (handles ?v=, &v=, ?vi=, &vi=)
  const vParamMatch = trimmed.match(/[?&]v(?:i)?=([a-zA-Z0-9_-]{11})(?:[&?#]|$)/i);
  if (vParamMatch && vParamMatch[1]) {
    return vParamMatch[1];
  }

  // 3. youtu.be / y2u.be short link
  const youtuBeMatch = trimmed.match(/(?:youtu\.be\/|y2u\.be\/)([a-zA-Z0-9_-]{11})(?:[?&#/]|$)/i);
  if (youtuBeMatch && youtuBeMatch[1]) {
    return youtuBeMatch[1];
  }

  // 4. youtube.com path variations: /embed/, /v/, /vi/, /shorts/, /live/, /e/
  const pathMatch = trimmed.match(
    /(?:youtube(?:-nocookie)?\.com)\/(?:embed\/|v\/|vi\/|shorts\/|live\/|e\/)([a-zA-Z0-9_-]{11})(?:[?&#/]|$)/i
  );
  if (pathMatch && pathMatch[1]) {
    return pathMatch[1];
  }

  // 5. Broader regex for any subdomain (m.youtube.com, music.youtube.com, www.youtube.com, etc.)
  const broadMatch = trimmed.match(
    /(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)?(?:youtube\.com|youtu\.be|youtube-nocookie\.com)\/(?:[^/\n\s]+\/)*([a-zA-Z0-9_-]{11})(?:[?&#/]|$)/i
  );
  if (broadMatch && broadMatch[1]) {
    return broadMatch[1];
  }

  // 6. Generic fallback: 11-character token following common markers
  const genericMatch = trimmed.match(/(?:watch\?v=|embed\/|youtu\.be\/|\/v\/|\/shorts\/|\/live\/)([a-zA-Z0-9_-]{11})/i);
  if (genericMatch && genericMatch[1]) {
    return genericMatch[1];
  }

  return null;
}

/**
 * Normalizes any video link so it is always a valid watchable web URL
 */
export function normalizeVideoUrl(url: string): string {
  if (!url) return '';
  let trimmed = url.trim();

  // Strip leading/trailing quotes or brackets
  trimmed = trimmed.replace(/^["'<(\[]+|["'>)\]]+$/g, '').trim();

  // If user entered only the 11-character YouTube video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return `https://www.youtube.com/watch?v=${trimmed}`;
  }

  // If user entered a link without http:// or https:// (e.g. youtu.be/xxx or youtube.com/watch?v=xxx)
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

export function getYouTubeEmbedUrl(urlOrId: string): string {
  const id = extractYouTubeId(urlOrId);
  if (!id) return '';
  // Use youtube.com embed with playsinline and modestbranding
  return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&playsinline=1&modestbranding=1&enablejsapi=1`;
}

export function getYouTubeWatchUrl(urlOrId: string): string {
  const id = extractYouTubeId(urlOrId);
  if (id) {
    return `https://www.youtube.com/watch?v=${id}`;
  }
  return normalizeVideoUrl(urlOrId);
}

export function getYouTubeThumbnail(urlOrId: string): string {
  const id = extractYouTubeId(urlOrId);
  if (!id) return '';
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export function isDirectVideoFile(url: string): boolean {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url.trim());
}
