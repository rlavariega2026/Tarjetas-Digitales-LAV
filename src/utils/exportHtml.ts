import { CardData } from '../types/card';
import { generateVCardString } from './vcard';

/**
 * Generates a self-contained, standalone HTML page ready to host on lavdigitalmkt.com or any server
 */
export function generateStandaloneHtml(card: CardData, publishedUrl?: string): string {
  const vcardEncoded = encodeURIComponent(generateVCardString(card));
  const safeFolder = (value: string) => (value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'tarjeta';
  // Sharing and contact actions must point to the published card, not to the business website.
  const cardUrl = publishedUrl || `https://lavdigitalmkt.com/tarjetas/${encodeURIComponent(safeFolder(card.businessName || card.name || 'cliente'))}/${encodeURIComponent(safeFolder(card.slug || card.name || card.id || 'tarjeta'))}/index.html`;
  // Keep older cards with incomplete design data renderable in both preview and export.
  // Exportar exactamente el tema seleccionado; no sustituirlo por una colección predeterminada.
  const theme = card.design?.theme || '';
  const absolutePublicImage = [card.design.avatarUrl, card.design.logoUrl, card.design.bannerUrl]
    .find((value) => typeof value === 'string' && /^https:\/\//i.test(value) && !value.startsWith('data:'));
  const previewImageUrl = absolutePublicImage || 'https://lavdigitalmkt.com/pwa-512x512.png';
  const previewDescription = (card.bio || card.jobTitle || `Tarjeta digital de ${card.name}`).replace(/\s+/g, ' ').trim().slice(0, 200);
  const whatsappUrl = card.whatsapp
    ? `https://wa.me/${card.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(card.whatsappMessage || `Hola ${card.name}, vi tu tarjeta digital y me gustaría obtener más información.`)}`
    : '';

  // Parse embed video
  let embedVideoUrl = '';
  if (card.videoUrl) {
    const trimmed = card.videoUrl.trim();
    const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    const shortsMatch = trimmed.match(/shorts\/([a-zA-Z0-9_-]{11})/);
    const embedMatch = trimmed.match(/embed\/([a-zA-Z0-9_-]{11})/);
    const vimeoMatch = trimmed.match(/vimeo\.com\/(\d+)/);
    if (shortMatch) embedVideoUrl = `https://www.youtube.com/embed/${shortMatch[1]}`;
    else if (watchMatch) embedVideoUrl = `https://www.youtube.com/embed/${watchMatch[1]}`;
    else if (shortsMatch) embedVideoUrl = `https://www.youtube.com/embed/${shortsMatch[1]}`;
    else if (embedMatch) embedVideoUrl = `https://www.youtube.com/embed/${embedMatch[1]}`;
    else if (vimeoMatch) embedVideoUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  const cleanHandle = (val?: string) => (val || '').trim().replace(/^@/, '');
  const toUrl = (val?: string, prefix = '') => {
    if (!val) return '';
    const trimmed = val.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    return `${prefix}${cleanHandle(trimmed)}`;
  };

  // SVG de marca con geometrías simplificadas y consistentes para que los logotipos
  // se distingan bien en móviles y no dependan de fuentes o librerías externas.
  const socialSvg = (name: string) => {
    const paths: Record<string, string> = {
      Instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="18" cy="6" r="1.15" fill="currentColor" stroke="none"/>',
      Facebook: '<path d="M13.5 21v-8h2.8l.45-3.2H13.5V7.75c0-.93.3-1.55 1.65-1.55h1.75V3.35A23 23 0 0 0 14.35 3c-2.55 0-4.3 1.55-4.3 4.4v2.4H7.2V13h2.85v8z" fill="currentColor" stroke="none"/>',
      YouTube: '<path d="M23 7.1a3 3 0 0 0-2.1-2.12C19.05 4.5 12 4.5 12 4.5s-7.05 0-8.9.48A3 3 0 0 0 1 7.1 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.9 3 3 0 0 0 2.1 2.12c1.85.48 8.9.48 8.9.48s7.05 0 8.9-.48A3 3 0 0 0 23 16.9a31 31 0 0 0 .5-4.9 31 31 0 0 0-.5-4.9Z" fill="currentColor" stroke="none"/><path d="m10 8.8 5.5 3.2-5.5 3.2z" fill="#090d18" stroke="none"/>',
      'X / Twitter': '<path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.9 5.8 22H2.7l7.3-8.4L1.8 2h6.5l4.4 6.6zm-1.1 17.8h1.7L7.3 4.1H5.5z" fill="currentColor" stroke="none"/>',
      TikTok: '<path d="M19.6 8.7a7.4 7.4 0 0 1-4.5-1.5v7.1a6.1 6.1 0 1 1-6.1-6.1c.4 0 .8 0 1.2.1v3.4a2.8 2.8 0 1 0 1.5 2.5V2.2h3.5a4.8 4.8 0 0 0 4.4 4.4z" fill="currentColor" stroke="none"/>',
      LinkedIn: '<path d="M20.4 3H3.6A.6.6 0 0 0 3 3.6v16.8a.6.6 0 0 0 .6.6h16.8a.6.6 0 0 0 .6-.6V3.6a.6.6 0 0 0-.6-.6ZM8.3 18H5.4V9.4h2.9ZM6.85 8.2a1.68 1.68 0 1 1 0-3.36 1.68 1.68 0 0 1 0 3.36ZM18.6 18h-2.9v-4.2c0-1-.02-2.3-1.4-2.3s-1.6 1.1-1.6 2.2V18H9.8V9.4h2.8v1.17h.04a3.1 3.1 0 0 1 2.8-1.54c3 0 3.55 1.97 3.55 4.53z" fill="currentColor" stroke="none"/>',
      Telegram: '<path d="M21.7 3.2 18.5 20c-.24 1.2-.87 1.5-1.77.94l-4.9-3.62-2.36 2.27c-.26.26-.48.48-.98.48l.35-4.98 9.07-8.2c.4-.35-.09-.55-.62-.2L6.1 13.7l-4.77-1.5c-1.04-.33-1.06-1.04.22-1.55L20.2 3.3c.87-.32 1.63.2 1.5-.1Z" fill="currentColor" stroke="none"/>',
      Spotify: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.59 14.42a.75.75 0 0 1-1.03.25c-2.83-1.73-6.39-2.12-10.59-1.16a.75.75 0 1 1-.34-1.46c4.59-1.05 8.52-.59 11.71 1.34.35.21.46.68.25 1.03Zm1.47-3.27a.94.94 0 0 1-1.29.31c-3.24-1.99-8.18-2.56-12.01-1.4a.94.94 0 1 1-.55-1.79c4.38-1.33 9.82-.69 13.54 1.59.44.27.58.85.31 1.29Zm.13-3.4c-3.88-2.3-10.29-2.52-14-.14a1.13 1.13 0 1 1-1.22-1.91c4.26-2.73 11.35-2.2 15.68.37a1.13 1.13 0 0 1-1.16 1.68Z" fill="currentColor" stroke="none"/>'
    };
    return '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (paths[name] || '') + '</svg>';
  };
  const socialLinks = [
    card.socials.instagram && { name: 'Instagram', url: toUrl(card.socials.instagram, 'https://instagram.com/') },
    card.socials.facebook && { name: 'Facebook', url: toUrl(card.socials.facebook, 'https://facebook.com/') },
    card.socials.youtube && { name: 'YouTube', url: toUrl(card.socials.youtube, 'https://youtube.com/@') },
    card.socials.twitter && { name: 'X / Twitter', url: toUrl(card.socials.twitter, 'https://x.com/') },
    card.socials.tiktok && { name: 'TikTok', url: toUrl(card.socials.tiktok, 'https://tiktok.com/@') },
    card.socials.linkedin && { name: 'LinkedIn', url: card.socials.linkedin.startsWith('http') ? card.socials.linkedin : `https://linkedin.com/in/${cleanHandle(card.socials.linkedin)}` },
    card.socials.telegram && { name: 'Telegram', url: toUrl(card.socials.telegram, 'https://t.me/') },
    card.socials.spotify && { name: 'Spotify', url: toUrl(card.socials.spotify, 'https://open.spotify.com/') },
  ].filter(Boolean) as Array<{ name: string; url: string }>;

  // Keep the published HTML visually aligned with the React preview for every premium collection.
  const isEleganceLuxury = ['elegance-luxury','executive-black','champagne-gold','royal-navy','black-gold','platinum-edition','liquid-metal','royal-velvet'].includes(theme) || card.design.animationStyle === 'metallic-sheen';
  const isFutureTech = ['future-tech','cyber-blue','neon-purple','digital-glass','cyber-chrome','neon-grid','digital-orbit','holographic-future','liquid-glass'].includes(theme) || card.design.animationStyle === 'tech-scan';
  const isGlassMotion = ['glass-motion','aurora-glass','frosted-depth','crystal-prism','aurora-flow','prismatic-light','dynamic-layers'].includes(theme) || card.design.animationStyle === 'floating-glow' || card.design.animationStyle === 'glass-parallax';
  const isYoungCreative = ['young-creative','urban-gradient','pop-creative','color-motion','asymmetric-flow','bold-creative','editorial-cover'].includes(theme) || card.design.animationStyle === 'liquid-flow';
  const isMinimalStudio = ['minimal-studio','pure-white','soft-beige','modern-monochrome','swiss-minimal','monochrome-studio','architectural-lines'].includes(theme) || card.design.animationStyle === 'subtle-fade';
  const isBusinessSignature = ['business-signature','corporate-executive','modern-consultant','lawyer-elite','architectural-lines'].includes(theme);
  // Igualar el marco visual del componente DigitalCardView en el HTML publicado.
  const themeBorder = isEleganceLuxury
    ? '1px solid rgba(245,158,11,.30)'
    : isFutureTech
    ? '1px solid rgba(34,211,238,.40)'
    : isGlassMotion
    ? '1px solid rgba(255,255,255,.20)'
    : isYoungCreative
    ? '1px solid rgba(255,255,255,.25)'
    : isMinimalStudio
    ? '1px solid rgba(51,65,85,.60)'
    : isBusinessSignature
    ? '1px solid rgba(59,130,246,.30)'
    : '1px solid rgba(255,255,255,.10)';
  const themeShadow = isEleganceLuxury
    ? '0 20px 50px rgba(217,119,6,.18)'
    : isFutureTech
    ? '0 0 35px rgba(6,182,212,.22)'
    : isGlassMotion || isYoungCreative || isBusinessSignature
    ? '0 25px 50px -12px rgba(0,0,0,.50)'
    : isMinimalStudio
    ? '0 10px 15px -3px rgba(0,0,0,.10)'
    : '0 25px 50px -12px rgba(0,0,0,.50)';
  const themeRadius = card.design.cardShape === 'rounded-3xl'
    ? '32px'
    : card.design.cardShape === 'rounded-2xl'
    ? '16px'
    : card.design.cardShape === 'rounded-xl'
    ? '12px'
    : '0';
  const metallicBackground = 'linear-gradient(115deg,#27272a 0%,#d4d4d8 14%,#71717a 28%,#fef3c7 43%,#a16207 56%,#f8fafc 70%,#52525b 84%,#e5e7eb 100%)';
  const gradientBackground = `linear-gradient(135deg,${card.design.primaryColor || '#06b6d4'},${card.design.secondaryColor || '#7c3aed'},${card.design.accentColor || '#ec4899'})`;
  const patternBackground = (() => {
    switch (card.design.backgroundPattern) {
      case 'dots': return { image: 'radial-gradient(circle, rgba(255,255,255,.24) 1.35px, transparent 1.7px)', size: '22px 22px', repeat: 'repeat', blend: 'overlay' };
      case 'mesh': return { image: 'radial-gradient(at 0% 0%, rgba(99,102,241,.42) 0%, transparent 58%), radial-gradient(at 100% 100%, rgba(236,72,153,.36) 0%, transparent 58%)', size: '100% 100%, 100% 100%', repeat: 'no-repeat, no-repeat', blend: 'overlay, overlay' };
      case 'geometric': return { image: 'repeating-linear-gradient(45deg, rgba(255,255,255,.17) 0px, rgba(255,255,255,.17) 1px, transparent 1px, transparent 18px)', size: 'auto', repeat: 'repeat', blend: 'overlay' };
      case 'carbon': return { image: 'repeating-conic-gradient(from 45deg, rgba(255,255,255,.17) 0% 25%, rgba(15,23,42,.17) 0% 50%)', size: '14px 14px', repeat: 'repeat', blend: 'overlay' };
      case 'waves': return { image: 'repeating-radial-gradient(ellipse at 50% 100%, transparent 0 12px, rgba(255,255,255,.22) 13px 14px, transparent 15px 27px)', size: '100% 100%', repeat: 'no-repeat', blend: 'overlay' };
      case 'grid': return { image: 'linear-gradient(rgba(255,255,255,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.18) 1px, transparent 1px)', size: '28px 28px, 28px 28px', repeat: 'repeat, repeat', blend: 'overlay, overlay' };
      default: return { image: 'none', size: 'auto', repeat: 'no-repeat', blend: 'normal' };
    }
  })();
  const isGradientFinish = card.design.backgroundFinish === 'gradient' || (!card.design.backgroundFinish && ['urban-gradient','color-motion','aurora-glass','soft-gradient','bold-gradient','aurora-flow','prismatic-light','royal-velvet'].includes(theme));
  const isMetallicFinish = card.design.backgroundFinish === 'metallic' || (!card.design.backgroundFinish && ['executive-black','champagne-gold','royal-navy','black-gold','platinum-edition','liquid-metal','lawyer-elite','elegance-luxury','cyber-chrome'].includes(theme));
  // El patrón se superpone al color, degradado, metal o textura seleccionados.
  const cardBaseBackgroundImage = card.design.backgroundFinish === 'gradient'
    ? gradientBackground
    : card.design.backgroundFinish === 'metallic'
    ? metallicBackground
    : card.design.backgroundTextureUrl
    ? `url("${card.design.backgroundTextureUrl}")`
    : card.design.backgroundFinish === 'solid'
    ? 'none'
    : isMetallicFinish
    ? metallicBackground
    : isGradientFinish
    ? gradientBackground
    : 'none';
  const hasActivePattern = card.design.backgroundPattern !== 'none' && patternBackground.image !== 'none';
  const cardBackgroundImage = hasActivePattern
    ? patternBackground.image + (cardBaseBackgroundImage !== 'none' ? ', ' + cardBaseBackgroundImage : '')
    : cardBaseBackgroundImage;
  const cardBackgroundSize = hasActivePattern
    ? patternBackground.size + (cardBaseBackgroundImage !== 'none' ? ', ' + (card.design.backgroundTextureUrl ? 'cover' : 'auto') : '')
    : card.design.backgroundTextureUrl ? 'cover' : 'auto';
  const cardBackgroundRepeat = hasActivePattern
    ? patternBackground.repeat + (cardBaseBackgroundImage !== 'none' ? ', no-repeat' : '')
    : 'no-repeat';
  const cardBackgroundBlendMode = hasActivePattern
    ? patternBackground.blend + (cardBaseBackgroundImage !== 'none' ? ', normal' : '')
    : 'normal';


  // Reproducir en el HTML autónomo la misma composición fotográfica elegida en el editor.
  const avatarUrl = card.design.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500';
  const photoComposition = card.design.photoComposition || 'circle-portrait';
  const photos = [avatarUrl, ...(card.gallery || []).map((item) => item.imageUrl).filter(Boolean)];
  const renderLogo = (position: string) => {
    if (!card.design.logoUrl || (card.design.logoPosition || 'header') !== position) return '';
    const width = Math.max(40, Math.min(260, Number(card.design.logoWidth) || 100));
    return `<img src="${escapeHtml(card.design.logoUrl)}" alt="${escapeHtml(card.businessName || 'Logotipo')}" class="export-logo anim-logo-${card.design.logoAnimation || 'none'} anim-speed-${card.design.logoAnimationSpeed || 'normal'}" style="width:${width}px;max-width:60%;max-height:56px;object-fit:contain">`;
  };
  const photoFrame = (image: string, style: string, extra = '') =>
    `<img src="${escapeHtml(image)}" alt="${escapeHtml(card.name)}" style="${style}" ${extra}>`;
  const avatarSize = card.design.avatarSize === 'lg' ? 96 : card.design.avatarSize === 'sm' ? 64 : 80;
  const avatarRadius = card.design.avatarShape === 'circle' ? '50%' : card.design.avatarShape === 'squircle' ? '16px' : '8px';
  const photoCompositionHtml = (() => {
    const photo = (style: string, extra = '') => photoFrame(avatarUrl, style, extra);
    const logo = renderLogo('header');
    const row = (content: string, style = 'display:flex;align-items:flex-end;justify-content:space-between;gap:14px;margin:-42px 0 16px;position:relative;z-index:2;') => `<div style="${style}">${content}</div>`;
    switch (photoComposition) {
      case 'top-large':
        return `<div style="position:relative;margin:0 -24px 18px;aspect-ratio:4/3;overflow:hidden">${photo('width:100%;height:100%;object-fit:cover')}<div style="position:absolute;inset:0;background:linear-gradient(to top,#020617,transparent 70%)"></div><div style="position:absolute;top:12px;right:12px">${renderLogo('top-right')}</div><div style="position:absolute;bottom:14px;left:16px">${logo}</div></div>`;
      case 'vertical-large':
        return `<div style="position:relative;margin:0 -24px 18px;aspect-ratio:3/4;max-height:480px;overflow:hidden">${photo('width:100%;height:100%;object-fit:cover')}<div style="position:absolute;inset:0;background:linear-gradient(to top,#020617,transparent 65%)"></div><div style="position:absolute;top:16px;left:16px">${logo}</div></div>`;
      case 'card-bg':
        return `<div style="position:relative;margin:0 -24px 18px;height:192px;overflow:hidden">${photo('width:100%;height:100%;object-fit:cover;filter:blur(3px);transform:scale(1.08);opacity:.42')}<div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent,#020617)"></div><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">${photo('width:96px;height:96px;border-radius:16px;object-fit:cover;border:4px solid #ffffff33;box-shadow:0 20px 30px #0008')}</div></div>`;
      case 'bottom-compact':
        return row(logo, 'display:flex;justify-content:flex-end;margin:-24px 0 16px;');
      case 'left-photo':
        return row(`${photo('width:80px;height:80px;border-radius:16px;object-fit:cover;flex-shrink:0') }<div style="flex:1;min-width:0">${renderLogo('above-avatar')}<div style="font-size:11px;font-weight:700">${escapeHtml(card.businessName || 'Profesional')}</div><strong>${escapeHtml(card.name)}</strong><div style="font-size:12px;opacity:.75">${escapeHtml(card.jobTitle || '')}</div></div>${logo}`, 'display:flex;align-items:center;gap:12px;margin:-40px 0 16px;padding:12px;border-radius:16px;background:#ffffff0a;border:1px solid #ffffff1a;position:relative;');
      case 'right-photo':
        return row(`<div style="flex:1;min-width:0">${logo}<div style="font-size:11px;font-weight:700">${escapeHtml(card.businessName || 'Especialista')}</div><strong>${escapeHtml(card.name)}</strong><div style="font-size:12px;opacity:.75">${escapeHtml(card.jobTitle || '')}</div></div>${photo('width:80px;height:80px;border-radius:16px;object-fit:cover;flex-shrink:0')}`, 'display:flex;align-items:center;gap:12px;margin:-40px 0 16px;padding:12px;border-radius:16px;background:#ffffff0a;border:1px solid #ffffff1a;position:relative;');
      case 'panoramic':
        return `<div style="position:relative;margin:-38px -24px 18px;aspect-ratio:16/9;overflow:hidden;border-radius:16px">${photo('width:100%;height:100%;object-fit:cover')}<div style="position:absolute;inset:0;background:linear-gradient(to top,#000c,transparent 65%)"></div><div style="position:absolute;bottom:12px;left:14px;right:14px;display:flex;justify-content:space-between;align-items:center"><strong>${escapeHtml(card.name)}</strong>${logo}</div></div>`;
      case 'elegant-frame':
        return row(`<div style="padding:4px;border-radius:18px;background:linear-gradient(45deg,#f59e0b,#fef3c7,#a16207)">${photo('width:80px;height:80px;border-radius:13px;object-fit:cover;border:3px solid #090d18')}</div>${logo}`);
      case 'rounded-squircle':
        return row(`<div style="padding:4px;border-radius:22px;background:linear-gradient(45deg,${card.design.primaryColor},${card.design.accentColor || card.design.secondaryColor})">${photo('width:80px;height:80px;border-radius:18px;object-fit:cover')}</div>${logo}`);
      case 'asymmetric':
        return row(`<div style="position:relative;transform:rotate(-3deg)"><span style="position:absolute;inset:0;background:#6366f166;border-radius:16px;transform:translate(6px,6px)"></span>${photo('position:relative;width:80px;height:80px;border-radius:16px;object-fit:cover;border:2px solid white')}</div>${logo}`);
      case 'multi-grid':
        return row(`${photo('width:80px;height:80px;border-radius:16px;object-fit:cover;flex-shrink:0')}<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:5px;flex:1;max-width:130px">${photos.slice(1,3).map((p) => photoFrame(p,'width:100%;height:36px;object-fit:cover;border-radius:8px')).join('')}</div>${logo}`, 'display:flex;align-items:center;gap:8px;margin:-42px 0 16px;');
      case 'horizontal-slider':
        return `<div style="display:flex;gap:10px;overflow-x:auto;margin:-30px -24px 16px;padding:0 24px 8px">${photos.map((p,i)=>`<div style="position:relative;flex:0 0 96px;height:96px;overflow:hidden;border-radius:16px;border:1px solid #ffffff22">${photoFrame(p,'width:100%;height:100%;object-fit:cover')}${i===0?'<small style="position:absolute;bottom:4px;left:4px;background:#000b;padding:2px 5px;border-radius:5px">Principal</small>':''}</div>`).join('')}</div>`;
      case 'main-thumbnails':
        return `<div style="margin:-42px 0 16px"><div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:8px">${photo('width:96px;height:96px;border-radius:16px;object-fit:cover')}${logo}</div><div style="display:flex;gap:6px;overflow-x:auto">${photos.map(p=>photoFrame(p,'width:36px;height:36px;object-fit:cover;border-radius:8px;border:1px solid #ffffff33')).join('')}</div></div>`;
      case 'editorial-spread':
        return row(`<div style="flex:1;padding-top:8px"><small style="display:block;letter-spacing:2px;opacity:.65">EDITORIAL · VOL. 1</small>${renderLogo('above-avatar')}</div>${photo('width:96px;height:128px;border-radius:12px;object-fit:cover')}`, 'display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin:-36px 0 16px;');
      case 'overlapping-depth':
        return row(`<div style="padding:5px;border-radius:16px;background:#ffffff20;border:1px solid #ffffff33;box-shadow:0 12px 28px #0008">${photo('width:80px;height:80px;border-radius:12px;object-fit:cover')}</div>${logo}`);
      case 'photo-cards':
        return row(`<div style="padding:6px 6px 16px;border-radius:12px;background:#fff;transform:rotate(-2deg);box-shadow:0 14px 24px #0008">${photo('width:80px;height:80px;border-radius:8px;object-fit:cover')}<div style="color:#1e293b;text-align:center;font-size:9px;font-weight:700">${escapeHtml((card.name || '').split(' ')[0])}</div></div>${logo}`);
      case 'minimal-small':
        return row(`<div style="display:flex;align-items:center;gap:12px">${photo('width:48px;height:48px;border-radius:50%;object-fit:cover')}</div>${logo}`, 'display:flex;align-items:center;justify-content:space-between;margin:-20px 0 12px;');
      case 'geometric-cut':
        return row(`<div style="padding:3px;background:linear-gradient(45deg,#22d3ee,#6366f1);clip-path:polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)">${photo('width:82px;height:82px;object-fit:cover;clip-path:polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)')}</div>${logo}`);
      case 'multi-zone':
        return row(`<div>${renderLogo('above-avatar')}${photo('width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid #6366f1')}</div>${logo}`);
      case 'circle-portrait':
      default:
        return row(`<div>${renderLogo('above-avatar')}${photo(`width:${avatarSize}px;height:${avatarSize}px;border-radius:${avatarRadius};object-fit:cover;${card.design.avatarBorder ? 'border:4px solid '+(card.design.backgroundColor || '#0f172a')+';box-shadow:0 0 0 2px '+card.design.primaryColor : ''}`)}</div>${logo}`);
    }
  })();
  const bottomPhotoHtml = photoComposition === 'bottom-compact'
    ? `<div style="position:relative;margin:0 0 20px;aspect-ratio:16/9;overflow:hidden;border-radius:16px;border:1px solid #ffffff22">${photoFrame(avatarUrl,'width:100%;height:100%;object-fit:cover')}<div style="position:absolute;inset:0;background:linear-gradient(to top,#000c,transparent);display:flex;align-items:flex-end;padding:12px;font-weight:700">${escapeHtml(card.name)}</div></div>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="${escapeHtml(card.name)}">
  <title>${escapeHtml(card.name)} — ${escapeHtml(card.businessName || 'Tarjeta Digital')}</title>
  <meta name="description" content="${escapeHtml(card.bio || `${card.name} - ${card.jobTitle}`)}">
  <meta property="og:type" content="profile">
  <meta property="og:title" content="${escapeHtml(card.name)}${card.businessName ? ' | ' + escapeHtml(card.businessName) : ' | Tarjeta Digital'}">
  <meta property="og:description" content="${escapeHtml(previewDescription)}">
  <meta property="og:url" content="${escapeHtml(cardUrl)}">
  <meta property="og:image" content="${escapeHtml(previewImageUrl)}">
  <meta property="og:image:secure_url" content="${escapeHtml(previewImageUrl)}">
  <meta property="og:image:alt" content="Tarjeta digital de ${escapeHtml(card.name)}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="512">
  <meta property="og:image:height" content="512">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(card.name)} | Tarjeta Digital">
  <meta name="twitter:description" content="${escapeHtml(previewDescription)}">
  <meta name="twitter:image" content="${escapeHtml(previewImageUrl)}">
  <link rel="canonical" href="${escapeHtml(cardUrl)}">
  <meta name="theme-color" content="${card.design.primaryColor}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@400;500;600;700&family=Outfit:wght@400;600;700;800&family=Space+Grotesk:wght@600;700&family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700;800&family=Lora:wght@400;500;600;700&family=Cormorant+Garamond:wght@500;600;700&family=Oswald:wght@400;500;600;700&family=Roboto+Slab:wght@400;500;600;700&family=Raleway:wght@400;500;600;700&family=Bebas+Neue&family=Merriweather:wght@400;700&family=Roboto:wght@400;500;700&family=Lato:wght@400;700&family=Open+Sans:wght@400;600;700&family=Nunito+Sans:wght@400;600;700&family=Source+Sans+3:wght@400;600;700&family=Archivo:wght@400;500;600;700&family=Barlow+Condensed:wght@400;500;600;700&family=DM+Serif+Display&family=Figtree:wght@400;500;600;700&family=Josefin+Sans:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&family=Manrope:wght@400;500;600;700;800&family=Nunito:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&family=Ubuntu:wght@400;500;700&family=Urbanist:wght@400;500;600;700;800&family=Work+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root { --card-text-color: ${/^#[0-9a-fA-F]{6}$/.test(card.design.textColor || '') ? card.design.textColor : '#f8fafc'}; }
    body {
      background-color: ${card.design.backgroundColor};
      color: ${card.design.textColor || '#f8fafc'};
      font-family: '${card.design.fontBody || 'Inter'}', sans-serif;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 16px;
      -webkit-font-smoothing: antialiased;
    }
    .card-container {
      color: var(--card-text-color) !important;
      width: 100%;
      max-width: 440px;
      background-color: ${card.design.backgroundColor};
      background-image: ${cardBackgroundImage};
      background-size: ${cardBackgroundSize};
      background-position: center;
      background-repeat: ${cardBackgroundRepeat};
      background-blend-mode: ${cardBackgroundBlendMode};
      border: ${themeBorder};
      border-radius: ${themeRadius};
      overflow: hidden;
      box-shadow: ${themeShadow};
      backdrop-filter: ${isGlassMotion ? "blur(24px)" : "none"};
      position: relative;
      margin-bottom: 30px;
    }
    /* En móviles, presenta una tarjeta premium independiente, no una página a pantalla completa */
    @media (max-width: 600px) {
      html, body { width: 100%; min-height: 100%; margin: 0; }
      body {
        min-height: 100vh;
        min-height: 100dvh;
        padding: max(18px, env(safe-area-inset-top)) 12px max(24px, env(safe-area-inset-bottom));
        align-items: flex-start;
        justify-content: center;
        overflow-x: hidden;
        background:
          radial-gradient(ellipse at 50% 0%, rgba(56,189,248,.12), transparent 52%),
          radial-gradient(ellipse at 100% 65%, rgba(129,140,248,.08), transparent 42%),
          #070b14;
      }
      .card-container {
        width: 100%;
        max-width: 420px;
        min-height: 0;
        border-radius: 26px;
        background-color: ${card.design.backgroundColor};
        border: 1px solid rgba(255,255,255,.12);
        box-shadow: 0 28px 75px rgba(0,0,0,.52), 0 0 0 1px rgba(255,255,255,.035);
        margin: 0 auto;
        isolation: isolate;
        overflow: hidden;
      }
      .cover-banner { border-radius: 25px 25px 0 0; }
      .footer-brand { font-size: 10px; opacity: .38; }
      .social-section { margin-top: 22px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,.1); }
    .social-section-title { margin: 0 0 12px; text-align: center; color: var(--text-color, #e2e8f0); font: 700 11px/1.3 Arial,sans-serif; letter-spacing: .16em; text-transform: uppercase; opacity: .8; }
    .social-row { gap: 10px; margin: 18px 0 12px; display: flex !important; visibility: visible !important; opacity: 1 !important; flex-wrap: wrap; overflow: visible; }
      .social-icon-btn {
        width: auto !important;
        height: auto !important;
        min-width: 0;
        min-height: 42px;
        flex: 0 1 auto !important;
        padding: 8px 10px;
        gap: 7px;
        border-radius: 12px;
        display: inline-flex !important;
        align-items: center;
        justify-content: center;
        visibility: visible !important;
        opacity: 1 !important;
        -webkit-tap-highlight-color: transparent;
      }
      .social-icon-btn .social-label { display: inline-block !important; font-size: 11px; }
      .social-icon-btn svg { display: block !important; visibility: visible !important; opacity: 1 !important; width: 18px; height: 18px; flex: 0 0 18px; }
      .save-contact-btn, .quick-btn, .custom-link-btn { -webkit-tap-highlight-color: transparent; }
      .content-body { position: relative; z-index: 10; padding: 0 22px 26px; }
      .cover-banner { height: ${card.design.coverHeight === 'none' ? '40px' : card.design.coverHeight === 'sm' ? '112px' : card.design.coverHeight === 'lg' ? '192px' : '144px'}; }
    }

    /* LAV APP SHELL: la tarjeta publicada ocupa la pantalla del móvil, sin marco de página */
    @media (max-width: 600px) {
      html, body { width: 100% !important; min-height: 100% !important; margin: 0 !important; padding: 0 !important; }
      body {
        display: block !important;
        min-height: 100vh !important;
        min-height: 100dvh !important;
        padding: 0 !important;
        align-items: stretch !important;
        justify-content: flex-start !important;
        overflow-x: hidden !important;
        background: ${card.design.backgroundColor} !important;
      }
      .card-container {
        width: 100% !important;
        width: 100vw !important;
        max-width: none !important;
        min-height: 100vh !important;
        min-height: 100dvh !important;
        margin: 0 !important;
        /* Mantener el radio, borde y sombra definidos por el tema seleccionado. */
      }
      .cover-banner { border-radius: 0 !important; }
      .content-body { padding-bottom: max(26px, env(safe-area-inset-bottom)) !important; }
    }
    @media (display-mode: standalone), (display-mode: fullscreen) {
      html, body { margin: 0 !important; padding: 0 !important; min-height: 100vh !important; min-height: 100dvh !important; }
      body { display: block !important; }
      .card-container { width: 100% !important; max-width: none !important; min-height: 100vh !important; min-height: 100dvh !important; margin: 0 !important; border-radius: 0 !important; box-shadow: none !important; }
    }

    /* Premium Animation Keyframes */
    @keyframes shimmer-sweep {
      0% { left: -160%; }
      30%, 100% { left: 160%; }
    }
    @keyframes scanline-pass {
      0% { top: 0%; opacity: 0; }
      15% { opacity: 0.9; }
      85% { opacity: 0.9; }
      100% { top: 100%; opacity: 0; }
    }
    @keyframes float-orb-1 {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(25px, 35px) scale(1.15); }
    }
    @keyframes float-orb-2 {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(-30px, -25px) scale(0.9); }
    }
    @keyframes liquid-flow {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes card-reveal {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .anim-shimmer-sweep {
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(217, 119, 6, 0.35) !important;
      box-shadow: 0 20px 50px rgba(217, 119, 6, 0.18) !important;
    }
    .anim-shimmer-sweep::after {
      content: '';
      position: absolute;
      top: 0;
      left: -160%;
      width: 60%;
      height: 100%;
      background: linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0.03) 75%, transparent 100%);
      transform: skewX(-20deg);
      animation: shimmer-sweep 5.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      pointer-events: none;
    }
    .anim-border-beam {
      border: 1px solid rgba(6, 182, 212, 0.5) !important;
      box-shadow: 0 0 35px rgba(6, 182, 212, 0.25) !important;
    }
    .anim-minimal-frame {
      border: 1px solid rgba(148,163,184,.42) !important;
      box-shadow: 0 22px 58px rgba(0,0,0,.22), inset 0 0 0 1px rgba(255,255,255,.16) !important;
    }
    .anim-business-frame {
      border: 1px solid rgba(96,165,250,.36) !important;
      box-shadow: 0 26px 68px rgba(2,6,23,.38), 0 0 0 1px rgba(255,255,255,.035) !important;
    }
    .theme-glass-motion::before {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: radial-gradient(circle at 12% 8%, ${card.design.primaryColor}22, transparent 35%), radial-gradient(circle at 92% 68%, ${card.design.accentColor}1f, transparent 36%);
      mix-blend-mode: screen;
    }
    .theme-young-creative .cover-banner {
      background-size: 220% 220%;
      animation: liquid-flow 9s ease infinite;
    }
    .anim-scanline {
      position: absolute;
      left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.8), transparent);
      box-shadow: 0 0 12px rgba(6, 182, 212, 0.9);
      animation: scanline-pass 3.8s ease-in-out infinite;
      pointer-events: none;
      z-index: 12;
    }
    .anim-float-orb-1 {
      position: absolute;
      width: 220px; height: 220px;
      border-radius: 50%;
      filter: blur(60px);
      pointer-events: none;
      top: -60px; left: -60px;
      opacity: 0.35;
      animation: float-orb-1 12s ease-in-out infinite alternate;
      background: ${card.design.primaryColor || '#38bdf8'};
    }
    .anim-float-orb-2 {
      position: absolute;
      width: 220px; height: 220px;
      border-radius: 50%;
      filter: blur(60px);
      pointer-events: none;
      top: 50%; right: -60px;
      opacity: 0.3;
      animation: float-orb-2 15s ease-in-out infinite alternate;
      background: ${card.design.accentColor || card.design.secondaryColor || '#818cf8'};
    }
    .anim-liquid-flow {
      background-size: 240% 240% !important;
      animation: liquid-flow 8s ease infinite !important;
    }
    .card-stagger-1 { animation: card-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards; animation-delay: 0.05s; }
    .card-stagger-2 { animation: card-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards; animation-delay: 0.15s; }
    .card-stagger-3 { animation: card-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards; animation-delay: 0.25s; }
    @media (prefers-reduced-motion: reduce) {
      *, ::after, ::before { animation: none !important; transition: none !important; }
    }
    /* Logo Animations */
    @keyframes logo-cinematic {
      0% { opacity: 0; transform: scale(0.6) translateY(14px) rotateX(15deg); filter: blur(6px); }
      70% { transform: scale(1.05) translateY(-2px) rotateX(0deg); filter: blur(0px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes logo-3d-flip {
      0%, 100% { transform: perspective(600px) rotateY(0deg); }
      50% { transform: perspective(600px) rotateY(180deg); }
    }
    @keyframes logo-depth-float {
      0%, 100% { transform: translateY(0) translateZ(0) scale(1); }
      50% { transform: translateY(-7px) translateZ(20px) scale(1.04); }
    }
    @keyframes logo-pulse-glow {
      0%, 100% { filter: drop-shadow(0 0 2px rgba(255,255,255,0.4)); transform: scale(1); }
      50% { filter: drop-shadow(0 0 16px rgba(255,255,255,0.9)); transform: scale(1.04); }
    }
    .anim-logo-cinematic { animation: logo-cinematic 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .anim-logo-3d-flip { animation: logo-3d-flip 6s ease-in-out infinite; transform-style: preserve-3d; }
    .anim-logo-depth-float { animation: logo-depth-float 4s ease-in-out infinite; }
    .anim-logo-pulse-glow { animation: logo-pulse-glow 3s ease-in-out infinite; }
    .anim-speed-slow { animation-duration: 7s !important; }
    .anim-speed-normal { animation-duration: 4s !important; }
    .anim-speed-fast { animation-duration: 2s !important; }

    .cover-banner {
      width: 100%;
      height: ${card.design.coverHeight === 'none' ? '40px' : card.design.coverHeight === 'sm' ? '112px' : card.design.coverHeight === 'lg' ? '192px' : '144px'};
      background: linear-gradient(135deg, ${card.design.primaryColor}, ${card.design.secondaryColor});
      background-image: ${card.design.bannerUrl ? `url("${card.design.bannerUrl}")` : `linear-gradient(135deg,${card.design.primaryColor},${card.design.secondaryColor})`};
      background-size: cover;
      background-position: center;
      position: relative;
    }
    .content-body {
      padding: 0 24px 28px 24px;
      position: relative;
    }
    .avatar-wrapper {
      margin-top: -55px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .avatar {
      width: ${card.design.avatarSize === 'sm' ? '64px' : card.design.avatarSize === 'lg' ? '96px' : '80px'};
      height: ${card.design.avatarSize === 'sm' ? '64px' : card.design.avatarSize === 'lg' ? '96px' : '80px'};
      border-radius: ${card.design.avatarShape === 'circle' ? '50%' : card.design.avatarShape === 'squircle' ? '16px' : '8px'};
      border: 4px solid ${card.design.backgroundColor};
      object-fit: cover;
      background: ${card.design.primaryColor};
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
    }
    .business-logo {
      width: ${Math.max(40, Math.min(260, Number(card.design.logoWidth) || 100))}px;
      max-height: 100px;
      max-width: 65%;
      object-fit: contain;
    }
    .avatar-wrapper { position:relative; align-items:flex-end; gap:12px; }
    .avatar-wrapper.logo-above-avatar { flex-direction:column; align-items:flex-start; justify-content:flex-end; gap:8px; }
    .business-logo { max-height:56px; max-width:60%; flex-shrink:0; }
    .card-top-logo-wrap { position:relative; z-index:4; padding:12px 24px 4px; text-align:center; }
    .card-top-logo { display:inline-block; width:${Math.max(40, Math.min(260, Number(card.design.logoWidth) || 100))}px; max-width:100%; max-height:56px; object-fit:contain; }
    .banner-logo-center { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); z-index:5; width:${Math.max(40, Math.min(260, Number(card.design.logoWidth) || 100))}px; max-width:60%; max-height:56px; object-fit:contain; }
    .banner-logo-top-right { position:absolute; top:14px; left:14px; z-index:5; width:${Math.max(40, Math.min(260, Number(card.design.logoWidth) || 100))}px; max-width:55%; max-height:56px; object-fit:contain; }
    .floating-logo { position:fixed; right:14px; bottom:14px; z-index:30; width:${Math.max(40, Math.min(260, Number(card.design.logoWidth) || 100))}px; max-width:60vw; max-height:56px; object-fit:contain; filter:drop-shadow(0 4px 12px #0008); }
    .module-tools { position:absolute; top:12px; right:12px; z-index:20; display:flex; gap:8px; }
    .module-tool { border:1px solid #ffffff35; border-radius:999px; background:#0009; color:#fff; width:40px; height:40px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; font-size:19px; }
    .module-dialog { display:none; position:fixed; inset:0; z-index:9999; background:#000b; align-items:center; justify-content:center; padding:20px; }
    .module-dialog.open { display:flex; }
    .module-dialog-panel { width:min(340px,100%); padding:22px; border-radius:18px; background:${card.design.backgroundColor}; color:${card.design.textColor || '#fff'}; border:1px solid #ffffff30; text-align:center; box-shadow:0 20px 70px #0009; }
    .module-dialog-panel img { display:block; width:220px; max-width:100%; margin:14px auto; background:white; padding:8px; border-radius:8px; }
    .module-dialog-panel button,.module-dialog-panel a { display:inline-block; margin:5px; border:0; border-radius:9px; padding:10px 14px; background:${card.design.primaryColor}; color:white; text-decoration:none; cursor:pointer; }
    .headline-font {
      font-family: '${card.design.fontHeadline || 'Outfit'}', sans-serif;
    }
    h1 {
      font-size: 26px;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 4px;
      color: ${card.design.textColor || '#ffffff'};
    }
    .company-title {
      font-size: 15px;
      font-weight: 600;
      color: ${card.design.businessNameColor || card.design.accentColor || '#38bdf8'} !important;
      margin-bottom: 2px;
      letter-spacing: 0.5px;
    }
    .category-title {
      font-size: 12px;
      font-weight: 500;
      opacity: .82;
      margin-bottom: 3px;
      color: ${card.design.textColor || '#f8fafc'};
    }
    .job-title {
      font-size: 14px;
      opacity: 0.8;
      margin-bottom: 14px;
    }
    .bio-text {
      font-size: 14px;
      line-height: 1.6;
      opacity: 0.9;
      margin-bottom: 22px;
      background: rgba(255,255,255,0.04);
      padding: 12px 16px;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .action-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }
    .quick-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 12px 6px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      color: #ffffff;
      text-decoration: none;
      font-size: 11px;
      font-weight: 500;
      gap: 6px;
      transition: all 0.2s ease;
    }
    .quick-btn:active {
      transform: scale(0.96);
    }
    .quick-btn.highlight {
      background: ${card.design.primaryColor};
      border-color: ${card.design.primaryColor};
    }
    .save-contact-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 15px;
      background: linear-gradient(135deg, ${card.design.primaryColor}, ${card.design.accentColor});
      color: #ffffff;
      border: none;
      border-radius: 18px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      margin-bottom: 22px;
      box-shadow: 0 10px 20px -5px ${card.design.primaryColor}66;
      text-decoration: none;
    }
    .custom-links {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 24px;
    }
    .custom-link-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      color: #ffffff;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      transition: background 0.2s;
    }
    .section-title {
      font-size: 15px;
      font-weight: 700;
      margin: 20px 0 12px 0;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      opacity: 0.7;
    }
    .catalog-card {
      display: flex;
      gap: 14px;
      padding: 12px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      margin-bottom: 12px;
      align-items: center;
    }
    .catalog-img {
      width: 70px;
      height: 70px;
      border-radius: 12px;
      object-fit: cover;
      background: rgba(255,255,255,0.1);
    }
    .catalog-info {
      flex: 1;
    }
    .catalog-price {
      font-weight: 700;
      color: ${card.design.accentColor || '#38bdf8'};
      font-size: 14px;
    }
    .bank-card {
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 20px;
      padding: 18px;
      margin-bottom: 22px;
    }
    .bank-field-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 10px;
      background: rgba(255,255,255,0.04);
      border-radius: 10px;
      margin-bottom: 8px;
      font-size: 13px;
    }
    .bank-copy-btn {
      background: rgba(255,255,255,0.1);
      border: none;
      color: #fff;
      padding: 4px 8px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 11px;
    }
    .reviews-card {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 18px;
      padding: 16px;
      margin-bottom: 22px;
      text-align: center;
    }
    .paypal-card {
      background: rgba(0, 112, 186, 0.15);
      border: 1px solid rgba(0, 112, 186, 0.4);
      border-radius: 18px;
      padding: 16px;
      margin-bottom: 22px;
      text-align: center;
    }
    .social-row {
      display: flex !important;
      visibility: visible !important;
      opacity: 1 !important;
      position: relative;
      z-index: 5;
      width: 100%;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin: 22px 0;
      flex-wrap: wrap;
      overflow: visible;
    }
    .social-icon-btn {
      min-width: 108px;
      min-height: 44px;
      flex: 0 1 auto;
      padding: 9px 13px;
      gap: 9px;
      border-radius: 13px;
      background: linear-gradient(145deg, rgba(255,255,255,.105), rgba(255,255,255,.045));
      border: 1px solid rgba(255,255,255,.17);
      display: inline-flex !important;
      visibility: visible !important;
      opacity: 1 !important;
      align-items: center;
      justify-content: center;
      color: var(--card-text-color, white) !important;
      text-decoration: none;
      position: relative;
      z-index: 6;
      overflow: hidden;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 5px 14px rgba(0,0,0,.14);
      transition: transform .18s ease, background .18s ease, border-color .18s ease, box-shadow .18s ease;
    }
    .social-icon-btn:hover { transform: translateY(-2px); border-color: rgba(255,255,255,.34); box-shadow: 0 9px 20px rgba(0,0,0,.2); }
    .social-icon-btn:active { transform: scale(.97); }
    .social-icon-btn svg { display: block; width: 20px; height: 20px; flex: 0 0 20px; }
    .social-icon-btn .social-label { display: inline-block; font-size: 12px; line-height: 1; font-weight: 700; letter-spacing: .01em; white-space: nowrap; }
    .social-instagram svg { color: #f4a7c7; }
    .social-facebook svg { color: #7db2ff; }
    .social-youtube svg { color: #ff7777; }
    .social-x-twitter svg, .social-xtwitter svg { color: var(--card-text-color, white); }
    .social-tiktok svg { color: #8ef2e9; }
    .social-linkedin svg { color: #86c8ff; }
    .social-telegram svg { color: #79d2ff; }
    @media (max-width: 600px) {
      .social-row { gap: 8px; }
      .social-icon-btn { min-width: 0; min-height: 42px; padding: 8px 10px; gap: 7px; border-radius: 12px; }
      .social-icon-btn .social-label { font-size: 11px; }
      .social-icon-btn svg { width: 18px; height: 18px; flex-basis: 18px; }
    }
    .footer-brand {
      text-align: center;
      font-size: 11px;
      opacity: 0.5;
      padding-top: 14px;
      border-top: 1px solid rgba(255,255,255,0.08);
    }
    .footer-brand a {
      color: inherit;
      text-decoration: underline;
    }
    #toastNotice {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #10b981;
      color: #ffffff;
      padding: 10px 20px;
      border-radius: 25px;
      font-size: 12px;
      font-weight: 700;
      box-shadow: 0 10px 25px rgba(0,0,0,0.4);
      display: none;
      z-index: 9999;
    }
    /* El color de texto es independiente de la paleta y se aplica a la tarjeta publicada. */
    .card-container :is(div,h1,h2,h3,h4,p,span,strong,em,label,small,li,a,button):not(.social-icon-btn) {
      color: var(--card-text-color) !important;
    }
  </style>
</head>
<body>
  <div class="card-container ${isEleganceLuxury ? 'anim-shimmer-sweep' : ''} ${isFutureTech ? 'anim-border-beam' : ''} ${isMinimalStudio ? 'anim-minimal-frame' : ''} ${isBusinessSignature ? 'anim-business-frame' : ''} ${isGlassMotion ? 'theme-glass-motion' : ''} ${isYoungCreative ? 'theme-young-creative' : ''}">
    ${isGlassMotion ? '<div class="anim-float-orb-1"></div><div class="anim-float-orb-2"></div>' : ''}
    ${isFutureTech ? '<div class="anim-scanline"></div>' : ''}
    ${(card.design.showQrCodeButton || card.design.showNfcButton || card.design.showShareButton) ? `<div class="module-tools">
      ${card.design.showQrCodeButton ? '<button class="module-tool" type="button" onclick="openModuleDialog(\'qrDialog\')" aria-label="Código QR" title="Código QR">▦</button>' : ''}
      ${card.design.showNfcButton ? '<button class="module-tool" type="button" onclick="openModuleDialog(\'nfcDialog\')" aria-label="Tarjeta NFC" title="Tarjeta NFC">⌁</button>' : ''}
      ${card.design.showShareButton ? '<button class="module-tool" type="button" onclick="shareCardLink()" aria-label="Compartir tarjeta" title="Compartir">↗</button>' : ''}
    </div>` : ''}
    ${card.design.logoUrl && card.design.logoPosition === 'card-top' ? `<div class="card-top-logo-wrap"><img class="card-top-logo anim-logo-${card.design.logoAnimation || 'none'} anim-speed-${card.design.logoAnimationSpeed || 'normal'}" src="${card.design.logoUrl}" alt="${escapeHtml(card.businessName || 'Logotipo')}"></div>` : ''}
    ${(card.design.bannerUrl || !['top-large','vertical-large','card-bg'].includes(photoComposition)) ? `<div class="cover-banner ${isYoungCreative && !card.design.bannerUrl ? 'anim-liquid-flow' : ''}">
      ${card.design.logoUrl && card.design.logoPosition === 'center-banner' ? `<img class="banner-logo-center anim-logo-${card.design.logoAnimation || 'none'} anim-speed-${card.design.logoAnimationSpeed || 'normal'}" src="${escapeHtml(card.design.logoUrl)}" alt="${escapeHtml(card.businessName || 'Logotipo')}">` : ''}
      ${card.design.logoUrl && card.design.logoPosition === 'top-right' ? `<img class="banner-logo-top-right anim-logo-${card.design.logoAnimation || 'none'} anim-speed-${card.design.logoAnimationSpeed || 'normal'}" src="${escapeHtml(card.design.logoUrl)}" alt="${escapeHtml(card.businessName || 'Logotipo')}">` : ''}
    </div>` : ''}
    <div class="content-body">
      ${photoCompositionHtml}

      <div class="info-block" style="text-align:${card.design.infoTextAlign || 'left'};">
        ${card.businessName ? `<div class="company-title headline-font card-stagger-2">${escapeHtml(card.businessName)}</div>` : ''}
        ${card.category ? `<div class="category-title card-stagger-2">${escapeHtml(card.category)}</div>` : ''}
        <h1 class="headline-font card-stagger-2">${escapeHtml(card.name)}</h1>
        ${card.jobTitle ? `<div class="job-title card-stagger-2">${escapeHtml(card.jobTitle)}</div>` : ''}
        ${card.bio ? `<div class="bio-text card-stagger-2">${escapeHtml(card.bio)}</div>` : ''}
      </div>
      ${bottomPhotoHtml}

      <!-- Quick Action Grid -->
      <div class="action-grid card-stagger-3">
        ${card.whatsapp ? `<a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="quick-btn highlight"><svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="vertical-align:middle;margin-right:5px;"><path d="M20.52 3.48A11.86 11.86 0 0 0 12.04 0C5.47 0 .12 5.34.12 11.9c0 2.1.55 4.15 1.6 5.96L0 24l6.3-1.65a11.94 11.94 0 0 0 5.73 1.46h.01c6.56 0 11.9-5.34 11.91-11.9a11.82 11.82 0 0 0-3.43-8.43ZM12.04 21.8a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.84 9.84 0 0 1-1.52-5.27c0-5.47 4.46-9.92 9.94-9.92a9.86 9.86 0 0 1 7.02 2.91 9.86 9.86 0 0 1 2.9 7.03c0 5.48-4.46 9.93-9.96 9.93Zm5.45-7.43c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.08-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.5 1.7.64.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z"/></svg> WhatsApp</a>` : ''}
        ${card.phone ? `<a href="tel:${card.phone.replace(/\D/g, '')}" class="quick-btn"><span>📞</span> Llamar</a>` : ''}
        ${card.email ? `<a href="mailto:${card.email}" class="quick-btn"><span>✉️</span> Correo</a>` : ''}
        ${card.design.showMapButton && (card.googleMapsUrl || card.address) ? `<a href="${card.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(card.address)}`}" target="_blank" rel="noopener noreferrer" class="quick-btn"><span>📍</span> Ubicación</a>` : ''}
        ${card.website ? `<a href="${/^https?:\/\//i.test(card.website.trim()) ? card.website.trim() : `https://${card.website.trim()}`}" target="_blank" rel="noopener noreferrer" class="quick-btn" style="text-align:center;"><span>🌐</span><span style="display:block;width:100%;text-align:center;">Página web</span></a>` : ''}
      </div>

      <!-- Compartir contacto (Apertura directa en app de Contactos) -->
      ${card.design.showSaveContactButton ? `
      <button type="button" onclick="compartirContactoDirecto()" class="save-contact-btn headline-font" id="btnCompartirContacto">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:6px;"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
        <span>Compartir contacto</span>
      </button>` : ''}

      <!-- Social Networks -->
      ${socialLinks.length > 0 && card.design.showSocials ? `
      <section class="social-section" aria-labelledby="social-section-title">
        <h2 id="social-section-title" class="social-section-title">Redes sociales</h2>
        <div class="social-row">
          ${socialLinks.map(s => `
            <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="social-icon-btn social-${s.name.toLowerCase().replace(/[^a-z]/g, '')}" title="${s.name}" aria-label="${s.name}">${socialSvg(s.name)}<span class="social-label">${s.name === 'X / Twitter' ? 'X' : s.name}</span></a>
          `).join('')}
        </div>
      </section>` : ''}

      <!-- Custom Buttons -->
      ${card.design.showCustomButtons && card.customButtons && card.customButtons.length > 0 ? `
      <div class="custom-links">
        ${card.customButtons.map(btn => `
          <a href="${btn.url}" target="_blank" class="custom-link-btn">
            <span>${escapeHtml(btn.label)}</span>
            <span>➔</span>
          </a>
        `).join('')}
      </div>` : ''}

      <!-- Google Reviews Module -->
      ${card.googleReviews?.enabled ? `
      <div class="reviews-card">
        <div style="display:flex; justify-content:center; align-items:center; gap:8px; margin-bottom:8px;">
          <span style="font-weight:700; font-size:14px; color:#fff;">${escapeHtml(card.googleReviews.title || 'Reseñas en Google')}</span>
          <span style="color:#f59e0b; font-size:16px;">★★★★★</span>
        </div>
        <a href="${card.googleReviews.placeUrl || card.googleReviews.url || 'https://search.google.com/local/writereview'}" target="_blank" style="display:inline-block; padding:10px 20px; background:#fff; color:#0f172a; border-radius:12px; font-weight:700; font-size:13px; text-decoration:none;">
          ${escapeHtml(card.googleReviews.buttonText || 'Calificar en Google')}
        </a>
      </div>` : ''}

      <!-- Bank Transfer SPEI Module -->
      ${card.bankTransfer?.enabled ? `
      <div class="bank-card">
        <div style="font-weight:800; font-size:14px; color:#34d399; margin-bottom:10px;">🏦 Transferencia SPEI</div>
        ${card.bankTransfer.bankName ? `
        <div class="bank-field-row">
          <span><strong>Banco:</strong> ${escapeHtml(card.bankTransfer.bankName)}</span>
          <button class="bank-copy-btn" onclick="copyText('${escapeHtml(card.bankTransfer.bankName)}', 'Banco')">Copiar</button>
        </div>` : ''}
        ${card.bankTransfer.accountHolder ? `
        <div class="bank-field-row">
          <span><strong>Titular:</strong> ${escapeHtml(card.bankTransfer.accountHolder)}</span>
          <button class="bank-copy-btn" onclick="copyText('${escapeHtml(card.bankTransfer.accountHolder)}', 'Titular')">Copiar</button>
        </div>` : ''}
        ${card.bankTransfer.clabe ? `
        <div class="bank-field-row">
          <span><strong>CLABE:</strong> ${escapeHtml(card.bankTransfer.clabe)}</span>
          <button class="bank-copy-btn" onclick="copyText('${escapeHtml(card.bankTransfer.clabe)}', 'CLABE')">Copiar</button>
        </div>` : ''}
        ${card.bankTransfer.accountNumber ? `
        <div class="bank-field-row">
          <span><strong>Cuenta:</strong> ${escapeHtml(card.bankTransfer.accountNumber)}</span>
          <button class="bank-copy-btn" onclick="copyText('${escapeHtml(card.bankTransfer.accountNumber)}', 'Cuenta')">Copiar</button>
        </div>` : ''}
        ${card.bankTransfer.cardNumber ? `
        <div class="bank-field-row">
          <span><strong>Tarjeta:</strong> ${escapeHtml(card.bankTransfer.cardNumber)}</span>
          <button class="bank-copy-btn" onclick="copyText('${escapeHtml(card.bankTransfer.cardNumber)}', 'Tarjeta')">Copiar</button>
        </div>` : ''}
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px;">
          <button onclick="copyAllBank()" style="padding:10px; background:#1e293b; color:#fff; border:none; border-radius:10px; font-weight:700; font-size:12px; cursor:pointer;">Copiar todo</button>
          <button onclick="shareBankWhatsApp()" style="padding:10px; background:#10b981; color:#fff; border:none; border-radius:10px; font-weight:700; font-size:12px; cursor:pointer;">WhatsApp</button>
        </div>
      </div>` : ''}

      <!-- PayPal: datos editables para recibir cobros -->
      ${card.paypal?.enabled ? `
      <div class="paypal-card">
        <div style="font-weight:800; font-size:14px; color:#fff; margin-bottom:8px;">💳 Recibir pagos con PayPal</div>
        ${card.paypal.businessEmail ? `<div style="font-size:12px; margin:8px 0; color:#fff;">Correo para recibir pagos: <strong>${escapeHtml(card.paypal.businessEmail)}</strong> <button type="button" onclick="copyText(${JSON.stringify(card.paypal.businessEmail)}, 'Correo PayPal')" style="margin-left:6px;padding:5px 9px;background:#1e293b;color:#fff;border:0;border-radius:8px;font-weight:700;cursor:pointer;">Copiar correo</button></div>` : ''}
        ${card.paypal.description ? `<div style="font-size:12px; margin:8px 0; color:#e2e8f0;">Concepto: ${escapeHtml(card.paypal.description)}</div>` : ''}
        ${card.paypal.amount ? `<div style="font-size:18px; font-weight:800; margin:8px 0; color:#fff;">Monto sugerido: ${escapeHtml(card.paypal.currency || 'USD')} ${escapeHtml(card.paypal.amount)}</div>` : ''}
        ${card.paypal.paymentLink ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
          <a href="${card.paypal.paymentLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 18px;background:#0070ba;color:#fff;border-radius:12px;font-weight:700;font-size:13px;text-decoration:none;">${escapeHtml(card.paypal.buttonText || card.paypal.buttonLabel || 'Pagarme por PayPal')}</a>
          <button type="button" onclick="copyText(${JSON.stringify(card.paypal.paymentLink)}, 'Enlace de cobro PayPal')" style="padding:12px 14px;background:#1e293b;color:#fff;border:0;border-radius:12px;font-weight:700;font-size:12px;cursor:pointer;">Copiar enlace de cobro</button>
        </div>` : (card.paypal.businessEmail ? '<p style="font-size:12px;color:#e2e8f0;margin-top:8px;">Puedes enviar el pago al correo de PayPal mostrado arriba.</p>' : '<p style="font-size:12px;color:#e2e8f0;margin-top:8px;">Configura el correo receptor o el enlace de cobro de PayPal en el editor.</p>')}
      </div>` : ''}

      <!-- Embedded Video (YouTube / Shorts) -->
      ${embedVideoUrl ? `
      <div style="margin-bottom: 22px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 12px; overflow: hidden;">
        ${card.videoTitle ? `<div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">▶️ ${escapeHtml(card.videoTitle)}</div>` : ''}
        <div style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0; border-radius: 12px; overflow: hidden; background: #000;">
          <iframe src="${embedVideoUrl}" title="${escapeHtml(card.videoTitle || 'Video')}" style="position: absolute; top:0; left:0; width:100%; height:100%; border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      </div>` : ''}

      <!-- Gallery / Portfolio -->
      ${card.design.showGallery ? (card.gallery && card.gallery.length > 0 ? `
      <div class="section-title">Portafolio &amp; Galería de Fotos</div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:20px;">
        ${card.gallery.map(item => `
          <figure style="margin:0;overflow:hidden;border-radius:12px;background:rgba(255,255,255,.05);">
            ${item.imageUrl ? `<img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.title || 'Foto')}" loading="lazy" style="display:block;width:100%;aspect-ratio:1/1;object-fit:cover;">` : '<div style="display:flex;align-items:center;justify-content:center;width:100%;aspect-ratio:1/1;color:#94a3b8;font-size:12px;background:rgba(255,255,255,.04);">Foto pendiente</div>'}
            ${item.title || item.caption ? `<figcaption style="padding:8px;font-size:12px;color:#fff;">${escapeHtml(item.title || '')}${item.caption ? `<div style="opacity:.75;margin-top:3px;">${escapeHtml(item.caption)}</div>` : ''}</figcaption>` : ''}
          </figure>
        `).join('')}
      </div>` : `<div class="section-title">Portafolio &amp; Galería de Fotos</div><div style="margin-bottom:20px;padding:14px;border:1px dashed rgba(255,255,255,.2);border-radius:14px;color:#94a3b8;font-size:12px;text-align:center;">Añade fotos desde la pestaña Galería del editor.</div>`) : ''}

      <!-- Catalog -->
      ${card.design.showCatalog ? (card.catalog && card.catalog.length > 0 ? `
      <div class="section-title">Productos & Servicios</div>
      <div>
        ${card.catalog.map(item => `
          <div class="catalog-card">
            ${item.imageUrl ? `<img src="${escapeHtml(item.imageUrl)}" class="catalog-img" alt="${escapeHtml(item.title)}">` : ''}
            <div class="catalog-info">
              <div style="font-weight:600; font-size:14px;">${escapeHtml(item.title)}</div>
              <div style="font-size:12px; opacity:0.8; margin:2px 0 4px 0;">${escapeHtml(item.description || '')}</div>
              ${item.price ? `<div class="catalog-price">${escapeHtml(item.price)}</div>` : ''}
            </div>
            ${item.ctaLink ? `<a href="${escapeHtml(item.ctaLink)}" target="_blank" rel="noopener noreferrer" style="padding:6px 12px; background:rgba(255,255,255,0.1); border-radius:10px; color:#fff; text-decoration:none; font-size:11px; font-weight:600;">${escapeHtml(item.ctaLabel || 'Ver')}</a>` : ''}
          </div>
        `).join('')}
      </div>` : `<div class="section-title">Productos &amp; Servicios</div><div style="margin-bottom:20px;padding:14px;border:1px dashed rgba(255,255,255,.2);border-radius:14px;color:#94a3b8;font-size:12px;text-align:center;">Añade productos o servicios desde la pestaña Catálogo del editor.</div>`) : ''}

      <!-- Business Hours: compact native disclosure button -->
      ${card.design.showHours && ((Array.isArray(card.schedule) && card.schedule.length > 0) || card.businessHours?.trim()) ? `
      <details style="margin-bottom:18px;border:1px solid rgba(255,255,255,.10);border-radius:14px;background:rgba(255,255,255,.04);overflow:hidden;">
        <summary style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 15px;cursor:pointer;list-style:none;font-size:13px;font-weight:700;color:#fff;">
          <span style="display:flex;align-items:center;gap:9px;"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>Horarios de atención</span>
          <span aria-hidden="true" style="opacity:.7;">⌄</span>
        </summary>
        <div style="padding:0 15px 12px;font-size:13px;opacity:.9;">
          ${Array.isArray(card.schedule) && card.schedule.length ? card.schedule.map(day => `<div style="display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-top:1px solid rgba(255,255,255,.06);"><strong>${escapeHtml(day.day)}</strong><span>${day.closed ? 'Cerrado' : escapeHtml(day.open || '') + ' – ' + escapeHtml(day.close || '')}</span></div>`).join('') : escapeHtml(card.businessHours || '')}
        </div>
      </details>` : ''}


    </div>
  </div>
  ${card.design.logoUrl && card.design.logoPosition === 'floating' ? `<img class="floating-logo anim-logo-${card.design.logoAnimation || 'none'}" src="${card.design.logoUrl}" alt="${escapeHtml(card.businessName || 'Logotipo')}">` : ''}
  ${card.design.showQrCodeButton ? `<div id="qrDialog" class="module-dialog" role="dialog" aria-modal="true" aria-label="Código QR"><div class="module-dialog-panel"><h2>Código QR de tu tarjeta</h2><img src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&amp;data=${encodeURIComponent(cardUrl)}" alt="Código QR para abrir la tarjeta"><p style="font-size:12px;overflow-wrap:anywhere;">${escapeHtml(cardUrl)}</p><a href="https://api.qrserver.com/v1/create-qr-code/?size=600x600&amp;data=${encodeURIComponent(cardUrl)}" target="_blank" rel="noopener noreferrer">Abrir / descargar QR</a><button type="button" onclick="closeModuleDialogs()">Cerrar</button></div></div>` : ''}
  ${card.design.showNfcButton ? `<div id="nfcDialog" class="module-dialog" role="dialog" aria-modal="true" aria-label="Tarjeta NFC"><div class="module-dialog-panel"><h2>Tarjeta NFC</h2><p>Enlaza tu etiqueta o tarjeta NFC con esta dirección para abrir esta tarjeta digital.</p><p style="font-size:12px;overflow-wrap:anywhere;">${escapeHtml(cardUrl)}</p><button type="button" onclick="copyCardUrl()">Copiar enlace NFC</button><button type="button" onclick="closeModuleDialogs()">Cerrar</button></div></div>` : ''}
  <div id="toastNotice"></div>

  <script>
    function openModuleDialog(id) { var el=document.getElementById(id); if(el) el.classList.add('open'); }
    function closeModuleDialogs() { document.querySelectorAll('.module-dialog').forEach(function(el){el.classList.remove('open');}); }
    function shareCardLink() {
      if (navigator.share) navigator.share({title: document.title, url: ${JSON.stringify(cardUrl)}}).catch(function(){});
      else copyCardUrl();
    }
    function copyCardUrl() {
      var value = ${JSON.stringify(cardUrl)};
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(value).then(function(){showToast('Enlace copiado');}).catch(function(){window.prompt('Copia el enlace de la tarjeta',value);});
      else window.prompt('Copia el enlace de la tarjeta',value);
    }
    document.addEventListener('click', function(e) { if(e.target.classList && e.target.classList.contains('module-dialog')) e.target.classList.remove('open'); });
    function showToast(msg) {
      var t = document.getElementById('toastNotice');
      if (!t) return;
      t.innerText = msg;
      t.style.display = 'block';
      setTimeout(function() { t.style.display = 'none'; }, 2500);
    }

    function copyText(val, label) {
      var text = String(val == null ? '' : val);
      if (!text) { showToast('No hay datos para copiar'); return; }
      function fallbackCopy() {
        var field = document.createElement('textarea');
        field.value = text;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        field.style.left = '-9999px';
        document.body.appendChild(field);
        field.select();
        field.setSelectionRange(0, field.value.length);
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(field);
        showToast(ok ? '¡' + label + ' copiado!' : 'No se pudo copiar; mantén presionado el dato para copiarlo');
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function() {
          showToast('¡' + label + ' copiado!');
        }).catch(fallbackCopy);
      } else {
        fallbackCopy();
      }
    }

    function copyAllBank() {
      var lines = [
        'DATOS BANCARIOS PARA TRANSFERENCIA SPEI',
        CARD_DATA.business ? 'Empresa: ' + CARD_DATA.business : '',
        ${JSON.stringify(card.bankTransfer?.accountHolder ? `Titular: ${card.bankTransfer.accountHolder}` : '')},
        ${JSON.stringify(card.bankTransfer?.bankName ? `Banco: ${card.bankTransfer.bankName}` : '')},
        ${JSON.stringify(card.bankTransfer?.clabe ? `CLABE: ${card.bankTransfer.clabe}` : '')},
        ${JSON.stringify(card.bankTransfer?.accountNumber ? `Cuenta: ${card.bankTransfer.accountNumber}` : '')},
        ${JSON.stringify(card.bankTransfer?.cardNumber ? `Tarjeta: ${card.bankTransfer.cardNumber}` : '')},
        ${JSON.stringify(card.bankTransfer?.reference ? `Referencia: ${card.bankTransfer.reference}` : '')},
        ${JSON.stringify(card.bankTransfer?.instructions ? `Concepto: ${card.bankTransfer.instructions}` : '')}
      ].filter(Boolean).join('\\n');
      copyText(lines, 'Todos los datos bancarios');
    }

    function shareBankWhatsApp() {
      var lines = [
        '*DATOS BANCARIOS PARA TRANSFERENCIA SPEI*',
        CARD_DATA.business ? '*Empresa:* ' + CARD_DATA.business : '',
        ${JSON.stringify(card.bankTransfer?.accountHolder ? `*Titular:* ${card.bankTransfer.accountHolder}` : '')},
        ${JSON.stringify(card.bankTransfer?.bankName ? `*Banco:* ${card.bankTransfer.bankName}` : '')},
        ${JSON.stringify(card.bankTransfer?.clabe ? `*CLABE:* ${card.bankTransfer.clabe}` : '')},
        ${JSON.stringify(card.bankTransfer?.accountNumber ? `*Cuenta:* ${card.bankTransfer.accountNumber}` : '')},
        ${JSON.stringify(card.bankTransfer?.cardNumber ? `*Tarjeta:* ${card.bankTransfer.cardNumber}` : '')},
        ${JSON.stringify(card.bankTransfer?.reference ? `*Referencia:* ${card.bankTransfer.reference}` : '')},
        ${JSON.stringify(card.bankTransfer?.instructions ? `*Concepto:* ${card.bankTransfer.instructions}` : '')}
      ].filter(Boolean).join('\\n');
      window.open('https://wa.me/?text=' + encodeURIComponent(lines), '_blank');
    }

    const CARD_DATA = {
      name: ${JSON.stringify(card.name)},
      business: ${JSON.stringify(card.businessName || '')},
      job: ${JSON.stringify(card.jobTitle || '')},
      phone: ${JSON.stringify(card.phone || card.whatsapp || '')},
      email: ${JSON.stringify(card.email || '')},
      website: ${JSON.stringify(card.website || '')},
      address: ${JSON.stringify(card.address || '')},
      notes: ${JSON.stringify((card.bio || '') + (card.website ? ' | Web: ' + card.website : ''))},
      vcard: ${JSON.stringify(generateVCardString(card))}
    };

    function compartirContactoDirecto() {
      // Descarga inmediata del vCard desde el gesto del usuario.
      // No depender de intents, fetch/HEAD ni Web Share, que pueden bloquearse en móviles.
      const safeName = (CARD_DATA.name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'contacto');
      const blob = new Blob([CARD_DATA.vcard], { type: 'text/vcard;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = safeName + '.vcf';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(function() { URL.revokeObjectURL(url); }, 60000);
    }
  </script>
  <style id="lav-install-ui-css">
    #lavInstallButton{position:fixed;z-index:9997;top:max(12px,env(safe-area-inset-top));right:12px;border:1px solid rgba(255,255,255,.28);border-radius:999px;padding:10px 14px;background:rgba(10,15,28,.92);color:#fff;font:700 12px/1.2 Arial,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.25);backdrop-filter:blur(12px)}
    #lavInstallDialog{position:fixed;inset:0;z-index:9998;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.74);backdrop-filter:blur(8px);font-family:Arial,sans-serif}
    #lavInstallDialog.open{display:flex}
    #lavInstallPanel{position:relative;width:min(100%,380px);padding:24px;border-radius:22px;background:#101827;color:#f8fafc;border:1px solid rgba(255,255,255,.14);font-size:14px;line-height:1.55}
    #lavInstallPanel h2{margin:0 30px 12px 0;font-size:20px;color:#fff}
    #lavInstallPanel p{margin:8px 0;color:#e2e8f0}
    #lavInstallClose{position:absolute;top:8px;right:12px;border:0;background:transparent;color:#fff;font-size:26px}
    @media(display-mode:standalone),(display-mode:fullscreen){#lavInstallButton,#lavInstallDialog{display:none!important}}
  </style>
  <button id="lavInstallButton" type="button">Abrir como app</button>
  <div id="lavInstallDialog" role="dialog" aria-modal="true" aria-labelledby="lavInstallTitle">
    <div id="lavInstallPanel"><button id="lavInstallClose" type="button" aria-label="Cerrar">×</button><h2 id="lavInstallTitle">Usa esta tarjeta como una app</h2><p id="lavInstallInstructions">Agrega esta tarjeta a la pantalla de inicio para abrirla sin la barra del navegador.</p></div>
  </div>
  <script id="lav-install-ui-js">
    (function(){
      var button=document.getElementById('lavInstallButton'),dialog=document.getElementById('lavInstallDialog'),instructions=document.getElementById('lavInstallInstructions'),close=document.getElementById('lavInstallClose'),promptEvent=null;
      var ua=navigator.userAgent||'',ios=/iphone|ipad|ipod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
      var standalone=window.matchMedia('(display-mode: standalone)').matches||window.matchMedia('(display-mode: fullscreen)').matches||navigator.standalone===true;
      if(standalone&&button)button.style.display='none';
      window.addEventListener('beforeinstallprompt',function(event){event.preventDefault();promptEvent=event;});
      window.addEventListener('appinstalled',function(){if(button)button.style.display='none';if(dialog)dialog.classList.remove('open');});
      if(button)button.addEventListener('click',async function(){
        if(promptEvent){promptEvent.prompt();try{await promptEvent.userChoice;}catch(e){}promptEvent=null;return;}
        if(instructions)instructions.textContent=ios
          ? 'En Safari, pulsa Compartir y después “Añadir a pantalla de inicio”. Si aparece “Abrir como app”, actívalo y pulsa Añadir. Si abriste este enlace desde WhatsApp, primero ábrelo en Safari.'
          : (/android/i.test(ua)
            ? 'En Chrome, abre el menú ⋮ y selecciona “Instalar aplicación” o “Añadir a pantalla de inicio”. Si el enlace se abrió dentro de WhatsApp, usa “Abrir en Chrome” primero.'
            : 'Abre este enlace en Chrome o Edge y elige “Instalar aplicación” en el menú del navegador.');
        if(dialog)dialog.classList.add('open');
      });
      if(close)close.addEventListener('click',function(){dialog.classList.remove('open');});
      if(dialog)dialog.addEventListener('click',function(event){if(event.target===dialog)dialog.classList.remove('open');});
    })();
  </script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Downloads the card as a standalone index.html file
 */
export function downloadStandaloneHtmlFile(card: CardData): void {
  const htmlContent = generateStandaloneHtml(card);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tarjeta_${card.slug || 'digital'}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
