/**
 * Image Utility Library for FActHub
 * - Normalizes image URLs from Wikipedia, Wikimedia Commons, ImgBB, Google Drive, Imgur, Dropbox, etc.
 * - Client-side high-quality image compressor & reader for direct file upload (drag & drop / file picker)
 * - Safe image loader with error recovery and fallback banners
 */

/**
 * Normalizes raw URLs pasted by users into direct, embeddable image URLs
 */
export function normalizeImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Already a direct Data URL or SVG blob
  if (trimmed.startsWith('data:image/') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // 1. Wikipedia / Wikimedia Commons File Pages & Media Viewer Links
  // Examples:
  // - https://commons.wikimedia.org/wiki/File:The_Signing_of_the_Treaty_of_Nanking.jpg
  // - https://en.wikipedia.org/wiki/File:The_Signing_of_the_Treaty_of_Nanking.jpg
  // - https://en.wikipedia.org/wiki/Treaty_of_Nanking#/media/File:The_Signing_of_the_Treaty_of_Nanking.jpg
  // - https://commons.m.wikimedia.org/wiki/File:XYZ.png
  const wikiFileMatch = trimmed.match(/(?:commons\.wikimedia\.org|(?:\w+)\.wikipedia\.org)\/(?:wiki\/|\S*#\/media\/)(?:File:|Special:FilePath\/)([^?#&]+)/i);
  if (wikiFileMatch && wikiFileMatch[1]) {
    const rawFileName = wikiFileMatch[1];
    const decodedFileName = decodeURIComponent(rawFileName).replace(/\s+/g, '_');
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(decodedFileName)}?width=1200`;
  }

  // If someone already has Special:FilePath without query
  if (trimmed.includes('commons.wikimedia.org/wiki/Special:FilePath/') && !trimmed.includes('?width=')) {
    return `${trimmed}?width=1200`;
  }

  // 2. Google Drive file links
  // Examples:
  // - https://drive.google.com/file/d/1A2B3C4D5E/view?usp=sharing
  // - https://drive.google.com/open?id=1A2B3C4D5E
  const gdriveMatch = trimmed.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/i);
  if (gdriveMatch && gdriveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${gdriveMatch[1]}`;
  }

  // 3. Dropbox share links
  // Example: https://www.dropbox.com/s/xyz/photo.jpg?dl=0
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace('dl=0', 'raw=1').replace('www.dropbox.com', 'dl.dropboxusercontent.com');
  }

  // 4. Imgur links (turn page link into direct image link)
  // Example: https://imgur.com/abc1234 -> https://i.imgur.com/abc1234.jpg
  const imgurMatch = trimmed.match(/^https?:\/\/(?:www\.)?imgur\.com\/([a-zA-Z0-9]+)$/i);
  if (imgurMatch && imgurMatch[1]) {
    return `https://i.imgur.com/${imgurMatch[1]}.jpg`;
  }

  return trimmed;
}

/**
 * Resolves HTML viewer page URLs (e.g. from ImgBB `https://ibb.co/xyz` or PostImg `https://postimg.cc/xyz`)
 * to their direct raw image sources via our server-side resolver
 */
export async function resolveDirectImageUrl(url: string): Promise<string> {
  const normalized = normalizeImageUrl(url);
  if (!normalized) return '';

  // If already a direct image extension or data URL or special endpoint, return directly
  if (
    normalized.startsWith('data:image/') ||
    normalized.startsWith('blob:') ||
    /\.(jpg|jpeg|png|webp|gif|svg|avif)(\?.*)?$/i.test(normalized) ||
    normalized.includes('commons.wikimedia.org/wiki/Special:FilePath/') ||
    normalized.includes('lh3.googleusercontent.com') ||
    normalized.includes('images.unsplash.com')
  ) {
    return normalized;
  }

  // If it's a viewer page like ibb.co, postimg.cc, etc., query the backend resolver
  if (/ibb\.co|postimg\.cc|prnt\.sc|gyazo\.com/i.test(normalized)) {
    try {
      const res = await fetch(`/api/utils/resolve-image?url=${encodeURIComponent(normalized)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.directUrl) {
          return data.directUrl;
        }
      }
    } catch (e) {
      console.warn("Could not resolve image URL via backend:", e);
    }
  }

  return normalized;
}

/**
 * Compresses an uploaded image file on the client using HTML Canvas and returns an optimized WebP/JPEG Data URL.
 * Automatically limits max width/height while maintaining aspect ratio, making it lightweight for Firestore storage and instant preview.
 */
export function compressAndReadImageFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 800,
  quality = 0.82
): Promise<{ dataUrl: string; width: number; height: number; originalName: string; sizeKb: number }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image.'));
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate scaled dimensions maintaining aspect ratio
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Failed to create canvas context'));
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Export as WebP (or fallback to JPEG if WebP unsupported)
        let dataUrl = '';
        try {
          dataUrl = canvas.toDataURL('image/webp', quality);
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
        } catch {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);

        resolve({
          dataUrl,
          width,
          height,
          originalName: file.name,
          sizeKb
        });
      };

      img.onerror = () => reject(new Error('Failed to load image for processing.'));
      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file from disk.'));
    reader.readAsDataURL(file);
  });
}
