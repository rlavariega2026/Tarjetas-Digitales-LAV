/**
 * Optimizes and resizes an uploaded image file before storing as base64 Data URL.
 * Prevents localStorage QuotaExceededError while preserving transparency for PNG/SVG/WebP.
 */
export async function optimizeImageFile(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.85,
  outputFormat?: 'image/webp' | 'image/jpeg'
): Promise<string> {
  // If SVG, read as text/dataURL directly
  if (file.type === 'image/svg+xml') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate proportional scale
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        // Draw scaled image
        ctx.drawImage(img, 0, 0, width, height);

        // Catalog/gallery can use WebP to reduce large originals before card storage.
        // Existing callers retain the original PNG transparency behavior.
        const isPng = file.type === 'image/png';
        const mimeType = outputFormat || (isPng ? 'image/png' : 'image/jpeg');
        const optimizedDataUrl = canvas.toDataURL(mimeType, mimeType === 'image/png' ? undefined : quality);

        resolve(optimizedDataUrl);
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
