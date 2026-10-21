import { CardData } from '../types/card';

/**
 * Generates RFC 2426 compliant vCard 3.0 data string
 */
export function generateVCardString(card: CardData): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN;CHARSET=UTF-8:${card.name}`,
    `N;CHARSET=UTF-8:${card.name};;;;`,
  ];

  if (card.businessName) {
    lines.push(`ORG;CHARSET=UTF-8:${card.businessName}`);
  }

  if (card.jobTitle) {
    lines.push(`TITLE;CHARSET=UTF-8:${card.jobTitle}`);
  }

  if (card.phone) {
    lines.push(`TEL;TYPE=CELL,VOICE:${card.phone}`);
  }

  if (card.whatsapp && card.whatsapp !== card.phone) {
    lines.push(`TEL;TYPE=WORK,VOICE:${card.whatsapp}`);
  }

  if (card.email) {
    lines.push(`EMAIL;TYPE=INTERNET,WORK:${card.email}`);
  }

  if (card.website) {
    lines.push(`URL:${card.website}`);
  }

  if (card.address) {
    lines.push(`ADR;TYPE=WORK;CHARSET=UTF-8:;;${card.address};;;;`);
    lines.push(`LABEL;TYPE=WORK;CHARSET=UTF-8:${card.address}`);
  }

  if (card.bio) {
    const cleanBio = card.bio.replace(/\n/g, '\\n');
    lines.push(`NOTE;CHARSET=UTF-8:${cleanBio}`);
  }

  // Include photo if data URI
  if (card.design.avatarUrl && card.design.avatarUrl.startsWith('data:image')) {
    const parts = card.design.avatarUrl.split(',');
    const meta = parts[0];
    const base64 = parts[1];
    let type = 'JPEG';
    if (meta.includes('png')) type = 'PNG';
    if (meta.includes('webp')) type = 'WEBP';
    if (base64 && base64.length < 50000) {
      lines.push(`PHOTO;ENCODING=b;TYPE=${type}:${base64}`);
    }
  }

  lines.push('REV:' + new Date().toISOString());
  lines.push('END:VCARD');

  return lines.join('\r\n');
}

/**
 * Returns direct HTTPS URL to retrieve the vCard with inline MIME type
 * This is what iOS Safari natively opens as an Apple Contact Sheet without downloading a file.
 */
export function getDirectVCardUrl(card: CardData): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://lavdigitalmkt.com';
  const phone = card.phone || card.whatsapp || '';
  const params = new URLSearchParams({
    n: card.name || 'Contacto',
    p: phone,
    e: card.email || '',
    o: card.businessName || '',
    t: card.jobTitle || '',
    w: card.website || '',
    a: card.address || '',
    note: card.bio || '',
  });
  return `${origin}/c/${card.slug || card.id}.vcf?${params.toString()}`;
}

/**
 * Returns the native Android Contact Intent URL with browser fallback
 * Opens Google Contacts or Samsung Contacts with fields preloaded.
 */
export function getAndroidContactIntentUrl(card: CardData, fallbackUrl?: string): string {
  const phone = (card.phone || card.whatsapp || '').replace(/[^\d+]/g, '');
  const params: string[] = [
    'action=android.intent.action.INSERT',
    'type=vnd.android.cursor.dir/contact',
    `S.name=${encodeURIComponent(card.name)}`,
  ];

  if (phone) {
    params.push(`S.phone=${encodeURIComponent(phone)}`);
  }
  if (card.email) {
    params.push(`S.email=${encodeURIComponent(card.email)}`);
  }
  if (card.businessName) {
    params.push(`S.company=${encodeURIComponent(card.businessName)}`);
  }
  if (card.jobTitle) {
    params.push(`S.job_title=${encodeURIComponent(card.jobTitle)}`);
  }
  if (card.address) {
    params.push(`S.postal=${encodeURIComponent(card.address)}`);
  }
  const noteParts = [card.bio, card.website ? `Web: ${card.website}` : null].filter(Boolean);
  if (noteParts.length > 0) {
    params.push(`S.notes=${encodeURIComponent(noteParts.join(' | '))}`);
  }
  if (fallbackUrl) {
    params.push(`S.browser_fallback_url=${encodeURIComponent(fallbackUrl)}`);
  }

  return `intent:#Intent;${params.join(';')};end`;
}

/**
 * Automatically determines the ideal direct contact opening URL:
 * - On Android: Returns Android Intent scheme to open Contacts app directly.
 * - On iOS (iPhone/iPad): Returns HTTPS URL with inline text/vcard MIME to open iOS Contact Sheet.
 * - On Desktop: Returns direct vCard URL.
 */
export function getSmartContactHref(card: CardData): string {
  const vcardUrl = getDirectVCardUrl(card);
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
  const isAndroid = /android/i.test(ua);

  if (isAndroid) {
    return getAndroidContactIntentUrl(card, vcardUrl);
  }

  return vcardUrl;
}

/**
 * Triggers native contact saving on Android and iOS directly without downloading files
 * - Android: Launches Google Contacts / Samsung Contacts pre-filled via Intent
 * - iOS: Triggers native Apple Contact sheet via Web Share API or inline vCard blob
 * - Desktop: Fallback to .vcf download
 */
export async function triggerNativeContactSave(card: CardData): Promise<{
  method: 'share' | 'ios' | 'intent' | 'download';
  success: boolean;
}> {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
  const isAndroid = /android/i.test(ua);
  const isIOS = /iphone|ipad|ipod/i.test(ua);

  // 1. Android: Abre DIRECTAMENTE la aplicación nativa de contactos sin descargar archivo
  if (isAndroid) {
    try {
      const intentUrl = getAndroidContactIntentUrl(card);
      window.location.href = intentUrl;
      return { method: 'intent', success: true };
    } catch (err) {
      console.warn('Android intent failed, attempting Web Share fallback', err);
    }
  }

  const vcardText = generateVCardString(card);
  const safeName = card.name.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `${safeName}.vcf`;

  // 2. Web Share API Nivel 2 con archivo vCard (abre hoja nativa de Contactos en iOS / navegadores compatibles)
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      const file = new File([vcardText], fileName, { type: 'text/vcard' });
      if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: card.name,
          text: `Contacto de ${card.name}`,
        });
        return { method: 'share', success: true };
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { method: 'share', success: false };
      }
      console.warn('Web Share API failed, trying direct navigation', err);
    }
  }

  // 3. iOS Safari: Mostrar ficha de contacto nativa en pantalla
  if (isIOS) {
    const blob = new Blob([vcardText], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.location.href = url;
    return { method: 'ios', success: true };
  }

  // 4. Desktop / Fallback manual
  downloadVCard(card);
  return { method: 'download', success: true };
}

/**
 * Fallback manual download of .vcf file for Desktop / Outlook
 */
export function downloadVCard(card: CardData): void {
  const vcardText = generateVCardString(card);
  const blob = new Blob([vcardText], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `${card.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_contacto.vcf`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
