/**
 * Converts various YouTube or Vimeo URL formats into a clean embed iframe URL.
 * Supports:
 * - https://www.youtube.com/watch?v=xxxx
 * - https://youtu.be/xxxx
 * - https://www.youtube.com/shorts/xxxx
 * - https://vimeo.com/xxxx
 */
export function getEmbedVideoUrl(url?: string): string | null {
  if (!url || !url.trim()) return null;
  const clean = url.trim();

  // YouTube Shorts: https://www.youtube.com/shorts/ID
  const shortsMatch = clean.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch && shortsMatch[1]) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  }

  // YouTube Standard: watch?v=ID
  const watchMatch = clean.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/v\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  // YouTube Shortlink: youtu.be/ID
  const shortlinkMatch = clean.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortlinkMatch && shortlinkMatch[1]) {
    return `https://www.youtube.com/embed/${shortlinkMatch[1]}`;
  }

  // Vimeo: vimeo.com/ID
  const vimeoMatch = clean.match(/vimeo\.com\/([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Already an embed or iframe URL
  if (clean.includes('/embed/') || clean.includes('player.vimeo.com')) {
    return clean;
  }

  return null;
}
