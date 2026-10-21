import QRCode from 'qrcode';

export interface QROptions {
  colorDark?: string;
  colorLight?: string;
  margin?: number;
  width?: number;
}

/**
 * Generates Data URL (PNG) for QR code
 */
export async function generateQrPng(url: string, options: QROptions = {}): Promise<string> {
  const {
    colorDark = '#0f172a',
    colorLight = '#ffffff',
    margin = 2,
    width = 400,
  } = options;

  try {
    return await QRCode.toDataURL(url, {
      width,
      margin,
      color: {
        dark: colorDark,
        light: colorLight,
      },
      errorCorrectionLevel: 'H',
    });
  } catch (err) {
    console.error('Error generating QR PNG:', err);
    throw err;
  }
}

/**
 * Generates SVG string for QR code
 */
export async function generateQrSvg(url: string, options: QROptions = {}): Promise<string> {
  const {
    colorDark = '#0f172a',
    colorLight = '#ffffff',
    margin = 2,
    width = 400,
  } = options;

  try {
    return await QRCode.toString(url, {
      type: 'svg',
      width,
      margin,
      color: {
        dark: colorDark,
        light: colorLight,
      },
      errorCorrectionLevel: 'H',
    });
  } catch (err) {
    console.error('Error generating QR SVG:', err);
    throw err;
  }
}

/**
 * Downloads QR Code file
 */
export async function downloadQr(
  url: string,
  filename: string,
  format: 'png' | 'svg' = 'png',
  options: QROptions = {}
): Promise<void> {
  if (format === 'png') {
    const dataUrl = await generateQrPng(url, options);
    const link = document.createElement('a');
    link.download = `${filename}_qr.png`;
    link.href = dataUrl;
    link.click();
  } else {
    const svgStr = await generateQrSvg(url, options);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const objUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${filename}_qr.svg`;
    link.href = objUrl;
    link.click();
    URL.revokeObjectURL(objUrl);
  }
}
