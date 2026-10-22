import { CardData } from '../types/card';
import { generateVCardString } from './vcard';

/**
 * Generates a self-contained, standalone HTML page ready to host on lavdigitalmkt.com or any server
 */
export function generateStandaloneHtml(card: CardData): string {
  const vcardEncoded = encodeURIComponent(generateVCardString(card));
  const cardUrl = card.website || `https://lavdigitalmkt.com/c/${card.slug}`;
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

  const socialSvg = (name: string) => {
    const paths: Record<string, string> = {
      Instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="18" cy="6" r="1" fill="currentColor" stroke="none"/>',
      Facebook: '<path d="M14 21v-8h3l.5-4H14V7c0-1.2.4-2 2-2h2V1.5C17.3 1.3 16.3 1.2 15 1.2 11.8 1.2 10 3.1 10 6.7V9H7v4h3v8z" fill="currentColor" stroke="none"/>',
      YouTube: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none"/>',
      'X / Twitter': '<path d="M4 3h4.5l11.5 18h-4.5z" fill="currentColor" stroke="none"/><path d="M20 3 4 21" />',
      TikTok: '<path d="M14 3v11.2a4.3 4.3 0 1 1-3.5-4.2v3.6a1 1 0 1 0-.5 1V3h4c.3 2.4 1.6 3.8 4 4v3.6c-1.5 0-2.9-.5-4-1.4"/>',
      LinkedIn: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7M7 7v.1M11 17v-7h3v1c.6-1 4-1.5 4 2v4M11 13c0-2 4-2 4 0" />',
      Telegram: '<path d="m22 2-7 20-4-8-8-4z"/><path d="m11 14 5-5"/>'
    };
    return '<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (paths[name] || '') + '</svg>';
  };
  const socialLinks = [
    card.socials.instagram && { name: 'Instagram', url: toUrl(card.socials.instagram, 'https://instagram.com/') },
    card.socials.facebook && { name: 'Facebook', url: toUrl(card.socials.facebook, 'https://facebook.com/') },
    card.socials.youtube && { name: 'YouTube', url: toUrl(card.socials.youtube, 'https://youtube.com/@') },
    card.socials.twitter && { name: 'X / Twitter', url: toUrl(card.socials.twitter, 'https://x.com/') },
    card.socials.tiktok && { name: 'TikTok', url: toUrl(card.socials.tiktok, 'https://tiktok.com/@') },
    card.socials.linkedin && { name: 'LinkedIn', url: card.socials.linkedin.startsWith('http') ? card.socials.linkedin : `https://linkedin.com/in/${cleanHandle(card.socials.linkedin)}` },
    card.socials.telegram && { name: 'Telegram', url: toUrl(card.socials.telegram, 'https://t.me/') },
  ].filter(Boolean) as Array<{ name: string; url: string }>;

  const isEleganceLuxury = card.design.theme === 'elegance-luxury' || card.design.animationStyle === 'metallic-sheen';
  const isFutureTech = card.design.theme === 'future-tech' || card.design.animationStyle === 'tech-scan';
  const isGlassMotion = card.design.theme === 'glass-motion' || card.design.animationStyle === 'floating-glow' || card.design.animationStyle === 'glass-parallax';
  const isYoungCreative = card.design.theme === 'young-creative' || card.design.animationStyle === 'liquid-flow';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${escapeHtml(card.name)} — ${escapeHtml(card.businessName || 'Tarjeta Digital')}</title>
  <meta name="description" content="${escapeHtml(card.bio || `${card.name} - ${card.jobTitle}`)}">
  <meta property="og:title" content="${escapeHtml(card.name)} | ${escapeHtml(card.businessName)}">
  <meta property="og:description" content="${escapeHtml(card.bio || card.jobTitle)}">
  <meta name="theme-color" content="${card.design.primaryColor}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@400;500;600;700&family=Outfit:wght@400;600;700;800&family=Space+Grotesk:wght@600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
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
      width: 100%;
      max-width: 440px;
      background: ${card.design.backgroundColor};
      border-radius: 28px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08);
      position: relative;
      margin-bottom: 30px;
    }

    /* En móviles, presenta una tarjeta premium independiente, no una página a pantalla completa */
    @media (max-width: 600px) {
      html, body { width: 100%; min-height: 100%; margin: 0; }
      body {
        min-height: 100vh;
        min-height: 100dvh;
        padding: 16px 12px;
        align-items: center;
        justify-content: center;
        overflow-x: hidden;
        background: #090d18;
      }
      .card-container {
        width: 100%;
        max-width: 440px;
        min-height: 0;
        border-radius: 28px;
        box-shadow: 0 24px 70px rgba(0,0,0,.42), 0 0 0 1px rgba(255,255,255,.12);
        margin: 0 auto;
      }
      .content-body { padding: 0 22px 26px; }
      .cover-banner { height: ${card.design.coverHeight === 'sm' ? '110px' : card.design.coverHeight === 'lg' ? '170px' : '135px'}; }
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
      height: ${card.design.coverHeight === 'sm' ? '120px' : card.design.coverHeight === 'lg' ? '200px' : '150px'};
      background: linear-gradient(135deg, ${card.design.primaryColor}, ${card.design.secondaryColor});
      background-image: ${card.design.bannerUrl ? `url('${card.design.bannerUrl}')` : 'none'};
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
      width: 100px;
      height: 100px;
      border-radius: ${card.design.avatarShape === 'circle' ? '50%' : card.design.avatarShape === 'squircle' ? '24px' : '12px'};
      border: 4px solid ${card.design.backgroundColor};
      object-fit: cover;
      background: ${card.design.primaryColor};
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
    }
    .business-logo {
      max-height: 48px;
      max-width: 130px;
      object-fit: contain;
    }
    .headline-font {
      font-family: '${card.design.fontHeadline || 'Outfit'}', sans-serif;
    }
    h1 {
      font-size: 26px;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 4px;
      color: #ffffff;
    }
    .company-title {
      font-size: 15px;
      font-weight: 600;
      color: ${card.design.accentColor || '#38bdf8'};
      margin-bottom: 2px;
      letter-spacing: 0.5px;
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
      display: flex;
      justify-content: center;
      gap: 12px;
      margin: 22px 0;
      flex-wrap: wrap;
    }
    .social-icon-btn {
      width: 48px;
      height: 48px;
      border-radius: 16px;
      background: linear-gradient(145deg, rgba(255,255,255,.12), rgba(255,255,255,.035));
      border: 1px solid rgba(255,255,255,.16);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      text-decoration: none;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 8px 20px rgba(0,0,0,.16);
      transition: transform .18s ease, background .18s ease;
    }
    .social-icon-btn:active { transform: scale(.94); }
    .social-icon-btn svg { display: block; }
    .social-instagram { color: #f4a7c7; }
    .social-facebook { color: #7db2ff; }
    .social-youtube { color: #ff7777; }
    .social-x-twitter { color: #fff; }
    .social-tiktok { color: #8ef2e9; }
    .social-linkedin { color: #86c8ff; }
    .social-telegram { color: #79d2ff; }
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
  </style>
</head>
<body>
  <div class="card-container ${isEleganceLuxury ? 'anim-shimmer-sweep' : ''} ${isFutureTech ? 'anim-border-beam' : ''}">
    ${isGlassMotion ? '<div class="anim-float-orb-1"></div><div class="anim-float-orb-2"></div>' : ''}
    ${isFutureTech ? '<div class="anim-scanline"></div>' : ''}
    <div class="cover-banner ${isYoungCreative && !card.design.bannerUrl ? 'anim-liquid-flow' : ''}"></div>
    <div class="content-body">
      <div class="avatar-wrapper card-stagger-1">
        <img class="avatar" src="${card.design.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}" alt="${escapeHtml(card.name)}">
        ${card.design.logoUrl ? `<img class="business-logo anim-logo-${card.design.logoAnimation || 'none'} anim-speed-${card.design.logoAnimationSpeed || 'normal'}" src="${card.design.logoUrl}" alt="${escapeHtml(card.businessName)}">` : ''}
      </div>

      <div class="company-title headline-font card-stagger-2">${escapeHtml(card.businessName || '')}</div>
      <h1 class="headline-font card-stagger-2">${escapeHtml(card.name)}</h1>
      <div class="job-title card-stagger-2">${escapeHtml(card.jobTitle || '')}</div>

      ${card.bio ? `<div class="bio-text card-stagger-2">${escapeHtml(card.bio)}</div>` : ''}

      <!-- Quick Action Grid -->
      <div class="action-grid card-stagger-3">
        ${card.whatsapp ? `<a href="${whatsappUrl}" target="_blank" class="quick-btn highlight"><span>💬</span> WhatsApp</a>` : ''}
        ${card.phone ? `<a href="tel:${card.phone.replace(/\D/g, '')}" class="quick-btn"><span>📞</span> Llamar</a>` : ''}
        ${card.email ? `<a href="mailto:${card.email}" class="quick-btn"><span>✉️</span> Correo</a>` : ''}
        ${card.googleMapsUrl || card.address ? `<a href="${card.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(card.address)}`}" target="_blank" class="quick-btn"><span>📍</span> Ubicación</a>` : ''}
      </div>

      <!-- Compartir contacto (Apertura directa en app de Contactos) -->
      ${card.design.showSaveContactButton ? `
      <button type="button" onclick="compartirContactoDirecto()" class="save-contact-btn headline-font" id="btnCompartirContacto">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:6px;"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
        <span>Compartir contacto</span>
      </button>` : ''}

      <!-- Custom Buttons -->
      ${card.customButtons && card.customButtons.length > 0 ? `
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

      <!-- PayPal Module -->
      ${card.paypal?.enabled ? `
      <div class="paypal-card">
        <div style="font-weight:800; font-size:14px; color:#fff; margin-bottom:8px;">💳 Pago con PayPal</div>
        <a href="${card.paypal.paymentLink || 'https://paypal.me'}" target="_blank" style="display:inline-block; padding:12px 24px; background:#0070ba; color:#fff; border-radius:14px; font-weight:700; font-size:13px; text-decoration:none;">
          ${escapeHtml(card.paypal.buttonText || card.paypal.buttonLabel || 'Pagar con PayPal')}
        </a>
      </div>` : ''}

      <!-- Embedded Video (YouTube / Shorts) -->
      ${embedVideoUrl ? `
      <div style="margin-bottom: 22px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 12px; overflow: hidden;">
        ${card.videoTitle ? `<div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">▶️ ${escapeHtml(card.videoTitle)}</div>` : ''}
        <div style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0; border-radius: 12px; overflow: hidden; background: #000;">
          <iframe src="${embedVideoUrl}" title="${escapeHtml(card.videoTitle || 'Video')}" style="position: absolute; top:0; left:0; width:100%; height:100%; border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      </div>` : ''}

      <!-- Catalog -->
      ${card.catalog && card.catalog.length > 0 ? `
      <div class="section-title">Productos & Servicios</div>
      <div>
        ${card.catalog.map(item => `
          <div class="catalog-card">
            ${item.imageUrl ? `<img src="${item.imageUrl}" class="catalog-img" alt="${escapeHtml(item.title)}">` : ''}
            <div class="catalog-info">
              <div style="font-weight:600; font-size:14px;">${escapeHtml(item.title)}</div>
              <div style="font-size:12px; opacity:0.8; margin:2px 0 4px 0;">${escapeHtml(item.description || '')}</div>
              ${item.price ? `<div class="catalog-price">${escapeHtml(item.price)}</div>` : ''}
            </div>
            ${item.ctaLink ? `<a href="${item.ctaLink}" target="_blank" style="padding:6px 12px; background:rgba(255,255,255,0.1); border-radius:10px; color:#fff; text-decoration:none; font-size:11px; font-weight:600;">${escapeHtml(item.ctaLabel || 'Ver')}</a>` : ''}
          </div>
        `).join('')}
      </div>` : ''}

      <!-- Business Hours -->
      ${card.businessHours ? `
      <div class="section-title">Horarios de Atención</div>
      <div style="font-size:13px; opacity:0.85; margin-bottom:18px; padding:12px; background:rgba(255,255,255,0.03); border-radius:12px; border:1px solid rgba(255,255,255,0.06);">
        🕒 ${escapeHtml(card.businessHours)}
      </div>` : ''}

      <!-- Social Networks -->
      ${socialLinks.length > 0 ? `
      <div class="social-row">
        ${socialLinks.map(s => `
          <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="social-icon-btn social-${s.name.toLowerCase().replace(/[^a-z]/g, '')}" title="${s.name}" aria-label="${s.name}">${socialSvg(s.name)}</a>
        `).join('')}
      </div>` : ''}

      <div class="footer-brand">
        Diseñado con <strong>LAV Digital Marketing</strong> &bull; <a href="https://lavdigitalmkt.com" target="_blank">lavdigitalmkt.com</a>
      </div>
    </div>
  </div>
  <div id="toastNotice"></div>

  <script>
    function showToast(msg) {
      var t = document.getElementById('toastNotice');
      if (!t) return;
      t.innerText = msg;
      t.style.display = 'block';
      setTimeout(function() { t.style.display = 'none'; }, 2500);
    }

    function copyText(val, label) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(val).then(function() {
          showToast('¡' + label + ' copiado!');
        }).catch(function() {
          showToast('¡' + label + ' copiado!');
        });
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
      if (navigator.clipboard) {
        navigator.clipboard.writeText(lines).then(function() {
          showToast('¡Todos los datos copiados!');
        });
      }
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

    async function compartirContactoDirecto() {
      const ua = (navigator.userAgent || '').toLowerCase();
      const isAndroid = /android/i.test(ua);
      const isIOS = /iphone|ipad|ipod/i.test(ua);

      // 1. Android: Abre DIRECTAMENTE la aplicación de Contactos (Google / Samsung) pre-llenada sin descargar archivo
      if (isAndroid) {
        const cleanPhone = (CARD_DATA.phone || '').replace(/[^\\d+]/g, '');
        const intentParts = [
          'action=android.intent.action.INSERT',
          'type=vnd.android.cursor.dir/contact',
          'S.name=' + encodeURIComponent(CARD_DATA.name)
        ];
        if (cleanPhone) intentParts.push('S.phone=' + encodeURIComponent(cleanPhone));
        if (CARD_DATA.email) intentParts.push('S.email=' + encodeURIComponent(CARD_DATA.email));
        if (CARD_DATA.business) intentParts.push('S.company=' + encodeURIComponent(CARD_DATA.business));
        if (CARD_DATA.job) intentParts.push('S.job_title=' + encodeURIComponent(CARD_DATA.job));
        if (CARD_DATA.address) intentParts.push('S.postal=' + encodeURIComponent(CARD_DATA.address));
        if (CARD_DATA.notes) intentParts.push('S.notes=' + encodeURIComponent(CARD_DATA.notes));

        const intentUrl = 'intent:#Intent;' + intentParts.join(';') + ';end';
        window.location.href = intentUrl;
        return;
      }

      // 2. Web Share API Nivel 2 con archivo vCard en memoria (abre la hoja nativa con opción directa a "Contactos")
      if (navigator.share && window.File) {
        try {
          const file = new File([CARD_DATA.vcard], (CARD_DATA.name.replace(/[^a-zA-Z0-9]/g, '_') || 'contacto') + '.vcf', {
            type: 'text/vcard;charset=utf-8'
          });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: CARD_DATA.name,
              text: 'Contacto de ' + CARD_DATA.name
            });
            return;
          }
        } catch (e) {
          if (e.name === 'AbortError') return;
        }
      }

      // 3. iOS Safari: Abre directamente la ficha de contacto en pantalla sin descargar archivos sueltos
      if (isIOS) {
        const blob = new Blob([CARD_DATA.vcard], { type: 'text/vcard;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        window.location.href = blobUrl;
        return;
      }

      // 4. Fallback PC / Navegador de escritorio: Descarga el archivo para Outlook / Gmail
      const blob = new Blob([CARD_DATA.vcard], { type: 'text/vcard;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (CARD_DATA.name.replace(/[^a-zA-Z0-9]/g, '_') || 'contacto') + '.vcf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
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
