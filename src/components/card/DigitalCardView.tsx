import React, { useState } from 'react';
import { CardData } from '../../types/card';
import {
  downloadVCard,
  getSmartContactHref,
  getDirectVCardUrl,
  getAndroidContactIntentUrl,
  triggerNativeContactSave,
  generateVCardString,
} from '../../utils/vcard';
import { generateQrPng, downloadQr } from '../../utils/qr';
import { checkNFCSupport, writeNfcTag } from '../../utils/nfc';
import { recordCardContactClick } from '../../utils/storage';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  QrCode,
  Share2,
  ExternalLink,
  Download,
  UserPlus,
  Wifi,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Twitter,
  Spotify,
  MessageCircle,
  Check,
  Copy,
  ChevronRight,
  Layers,
  Sparkles,
  Play,
  Send,
  Smartphone,
  Bell,
  ArrowDown,
  X,
  Star,
  Building2,
  CreditCard,
  Landmark,
  ThumbsUp,
  Utensils,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Modern official 𝕏 logo
const XIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Official Google "G" logo
export const GoogleGIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"/>
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
  </svg>
);

// Official PayPal logo
export const PayPalIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="#003087" d="M20.067 8.478c-.492 4.148-3.265 6.208-7.397 6.208h-2.193l-1.077 6.828c-.062.387-.393.673-.784.673H4.76c-.495 0-.87-.442-.8-.934L6.96 2.67c.07-.446.45-.77.9-.77h6.728c3.084 0 5.24 1.488 4.98 4.698-.24 1.88-1.2 3.13-2.9 3.84 2.2.49 3.08 1.94 2.4 4.04z"/>
    <path fill="#0079C1" d="M18.57 6.09c-.27 2.1-1.34 3.48-3.23 4.28-2.43 1.03-5.32.74-5.32.74l-1.4 8.87h-2.7c-.44 0-.77-.39-.71-.83L7.9 2.67c.06-.4.4-.7.81-.7h6.73c2.75 0 4.67 1.33 4.44 4.12z"/>
  </svg>
);

// Parses YouTube, Shorts, and Vimeo URLs into responsive embed URLs
export const getEmbedVideoUrl = (url?: string): string | null => {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  const shortsMatch = trimmed.match(/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  const embedMatch = trimmed.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return `https://www.youtube.com/embed/${embedMatch[1]}`;
  const vimeoMatch = trimmed.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
};

// Formats social platform links safely avoiding @@ and missing domains
export const formatSocialUrl = (
  platform: 'instagram' | 'facebook' | 'linkedin' | 'tiktok' | 'youtube' | 'twitter' | 'telegram',
  val?: string
): string => {
  if (!val) return '';
  const trimmed = val.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const clean = trimmed.replace(/^@/, '');
  switch (platform) {
    case 'instagram':
      return `https://instagram.com/${clean}`;
    case 'facebook':
      return `https://facebook.com/${clean}`;
    case 'linkedin':
      return clean.includes('/') ? `https://linkedin.com/${clean}` : `https://linkedin.com/in/${clean}`;
    case 'tiktok':
      return `https://tiktok.com/@${clean}`;
    case 'youtube':
      return `https://youtube.com/@${clean}`;
    case 'twitter':
      return `https://x.com/${clean}`;
    case 'telegram':
      return `https://t.me/${clean}`;
    default:
      return trimmed;
  }
};

interface DigitalCardViewProps {
  card: CardData;
  isStandalone?: boolean;
  isPhysicalCardPreview?: boolean;
  activeFace?: 'front' | 'back';
}

export const DigitalCardView: React.FC<DigitalCardViewProps> = ({
  card,
  isStandalone = false,
  isPhysicalCardPreview = false,
  activeFace = 'front',
}) => {
  const [showQrModal, setShowQrModal] = useState(false);
  const [showNfcModal, setShowNfcModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [nfcWriting, setNfcWriting] = useState(false);
  const [nfcStatusText, setNfcStatusText] = useState('');
  const [nfcSuccess, setNfcSuccess] = useState<boolean | null>(null);
  const [showContactSaveModal, setShowContactSaveModal] = useState(false);

  const design = card.design;
  const toSafeCardSlug = (value?: string) => (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  const publishedCardUrl = `https://lavdigitalmkt.com/tarjetas/${encodeURIComponent(toSafeCardSlug(card.businessName || card.name || 'cliente'))}/${encodeURIComponent(toSafeCardSlug(card.slug || card.id || 'tarjeta'))}/index.html`;
  const currentUrl = typeof window !== 'undefined' && window.location.pathname.startsWith('/tarjetas/')
    ? (window.location.pathname.endsWith('/') ? window.location.origin + window.location.pathname + 'index.html' : window.location.href)
    : (card.website && /^https:\/\/lavdigitalmkt\.com\/tarjetas\//i.test(card.website)
      ? card.website
      : publishedCardUrl);

  const whatsappClean = card.whatsapp ? card.whatsapp.replace(/\D/g, '') : '';
  const phoneClean = card.phone ? card.phone.replace(/\D/g, '') : '';
  const whatsappUrl = whatsappClean
    ? `https://wa.me/${whatsappClean}?text=${encodeURIComponent(
        card.whatsappMessage || `Hola ${card.name}, vi tu tarjeta digital y me gustaría obtener información.`
      )}`
    : '';

  const contactHref = getSmartContactHref(card);
  const directVCardUrl = getDirectVCardUrl(card);
  const androidIntentUrl = getAndroidContactIntentUrl(card, directVCardUrl);

  const handleOpenQr = async () => {
    try {
      const dataUrl = await generateQrPng(currentUrl, {
        colorDark: design.primaryColor || '#0f172a',
        colorLight: '#ffffff',
        width: 380,
      });
      setQrDataUrl(dataUrl);
      setShowQrModal(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenContactSave = async () => {
    recordCardContactClick(card.id, 'saveContact');
    confetti({ particleCount: 45, spread: 75, origin: { y: 0.7 } });

    const ua = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
    const isAndroid = /android/i.test(ua);
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const inIframe = typeof window !== 'undefined' && window.self !== window.top;

    // Si estamos en un teléfono real fuera del visor web/iframe, activamos la app de contactos nativa
    if ((isAndroid || isIOS) && !inIframe) {
      await triggerNativeContactSave(card);
      return;
    }

    // Si estamos en computadora o dentro de un iframe/visor, generamos el QR para pruebas en celular y abrimos el modal
    try {
      const dataUrl = await generateQrPng(currentUrl, {
        colorDark: design.primaryColor || '#0f172a',
        colorLight: '#ffffff',
        width: 380,
      });
      setQrDataUrl(dataUrl);
    } catch (e) {
      console.error(e);
    }

    setShowContactSaveModal(true);
    await triggerNativeContactSave(card);
  };

  const handleCopyLink = async () => {
    const shareData = {
      title: `${card.name} | ${card.businessName || 'Tarjeta Digital'}`,
      text: `Te comparto la tarjeta digital de ${card.name}${card.businessName ? ` de ${card.businessName}` : ''}.`,
      url: currentUrl,
    };

    // En teléfonos abre el menú nativo para compartir directamente a WhatsApp, Mensajes, etc.
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        // Si el navegador no puede compartir, se usa la copia del enlace como respaldo.
      }
    }

    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // El portapapeles puede estar bloqueado por permisos del navegador.
    }
  };

  const handleNfcWrite = async () => {
    setNfcWriting(true);
    setNfcStatusText('Acerca tu chip o tarjeta NFC a la parte trasera de tu teléfono...');
    const res = await writeNfcTag(currentUrl, (msg) => setNfcStatusText(msg));
    setNfcWriting(false);
    setNfcStatusText(res.message);
    setNfcSuccess(res.success);
    if (res.success) {
      confetti({ particleCount: 60, spread: 80, origin: { y: 0.5 } });
    }
  };

  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<string>('Todos');
  const [activeThumbnailIndex, setActiveThumbnailIndex] = useState<number>(0);

  const handleCopyBankField = async (label: string, value?: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopyToast(`¡${label} copiado con éxito!`);
      setTimeout(() => setCopyToast(null), 2500);
    } catch {
      // fallback
    }
  };

  const handleCopyAllBankData = async () => {
    const bt = card.bankTransfer;
    if (!bt) return;
    const lines: string[] = ['DATOS BANCARIOS PARA TRANSFERENCIA SPEI'];
    if (card.businessName) lines.push(`Empresa / Negocio: ${card.businessName}`);
    if (bt.accountHolder) lines.push(`Titular: ${bt.accountHolder}`);
    if (bt.bankName) lines.push(`Banco: ${bt.bankName}`);
    if (bt.clabe) lines.push(`CLABE Interbancaria: ${bt.clabe}`);
    if (bt.accountNumber) lines.push(`Número de Cuenta: ${bt.accountNumber}`);
    if (bt.cardNumber) lines.push(`Número de Tarjeta: ${bt.cardNumber}`);
    if (bt.reference) lines.push(`Referencia: ${bt.reference}`);
    if (bt.instructions) lines.push(`Concepto / Notas: ${bt.instructions}`);

    const textToCopy = lines.join('\n');
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopyToast('¡Todos los datos bancarios copiados al portapapeles!');
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
      setTimeout(() => setCopyToast(null), 3000);
    } catch {
      // fallback
    }
  };

  const handleShareBankWhatsApp = () => {
    const bt = card.bankTransfer;
    if (!bt) return;
    const lines: string[] = ['*DATOS BANCARIOS PARA TRANSFERENCIA SPEI*'];
    if (card.businessName) lines.push(`*Empresa / Negocio:* ${card.businessName}`);
    if (bt.accountHolder) lines.push(`*Titular:* ${bt.accountHolder}`);
    if (bt.bankName) lines.push(`*Banco:* ${bt.bankName}`);
    if (bt.clabe) lines.push(`*CLABE:* ${bt.clabe}`);
    if (bt.accountNumber) lines.push(`*Cuenta:* ${bt.accountNumber}`);
    if (bt.cardNumber) lines.push(`*Tarjeta:* ${bt.cardNumber}`);
    if (bt.reference) lines.push(`*Referencia:* ${bt.reference}`);
    if (bt.instructions) lines.push(`*Concepto / Notas:* ${bt.instructions}`);

    const waText = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/?text=${waText}`, '_blank');
  };

  const handleOpenPayPal = () => {
    if (!card.paypal?.enabled) return;
    if (card.paypal.paymentLink) {
      window.open(card.paypal.paymentLink, '_blank');
    } else if (card.paypal.businessEmail) {
      const handle = card.paypal.businessEmail.replace(/@.*$/, '');
      window.open(`https://www.paypal.com/paypalme/${handle}`, '_blank');
    } else {
      window.open('https://paypal.me', '_blank');
    }
  };

  // Font family styles
  const headlineFontFamily = `"${design.fontHeadline}", sans-serif`;
  const bodyFontFamily = `"${design.fontBody}", sans-serif`;

  // Pattern overlays
  const getPatternBg = () => {
    switch (design.backgroundPattern) {
      case 'dots':
        return 'radial-gradient(circle, rgba(255,255,255,0.08) 1.5px, transparent 1.5px) 0 0 / 20px 20px';
      case 'mesh':
        return 'radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.25) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(236, 72, 153, 0.2) 0px, transparent 50%)';
      case 'geometric':
        return 'repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 10px, transparent 10px, transparent 20px)';
      case 'carbon':
        return 'radial-gradient(black 15%, transparent 16%) 0 0, radial-gradient(black 15%, transparent 16%) 8px 8px, radial-gradient(rgba(255,255,255,.05) 15%, transparent 20%) 0 1px, radial-gradient(rgba(255,255,255,.05) 15%, transparent 20%) 8px 9px';
      default:
        return 'none';
    }
  };

  // Physical Card Print Preview Mode (Front or Back)
  if (isPhysicalCardPreview) {
    if (activeFace === 'back') {
      return (
        <div
          className="relative w-full aspect-[1.75/1] max-w-[420px] mx-auto rounded-xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden border border-white/10"
          style={{
            backgroundColor: design.physicalCard.backBackgroundColor || '#0f172a',
            color: design.physicalCard.backTextColor || '#f8fafc',
            fontFamily: headlineFontFamily,
          }}
        >
          {design.physicalCard.showBleedGuides && (
            <div className="absolute inset-1.5 border border-dashed border-red-500/40 rounded-lg pointer-events-none z-10 flex items-start justify-end p-1">
              <span className="text-[9px] bg-red-500/80 text-white px-1 rounded">Guía de corte 3mm</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            {design.logoUrl ? (
              <img
                src={design.logoUrl}
                alt="Logo"
                style={{ width: `${design.logoWidth || 100}px` }}
                className="max-h-12 object-contain"
              />
            ) : (
              <div className="text-xl font-black tracking-wider uppercase" style={{ color: design.accentColor }}>
                {card.businessName || 'LAV DIGITAL'}
              </div>
            )}
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center p-1.5">
              <Wifi className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="text-center my-auto py-2">
            <p className="text-base font-medium italic opacity-90">
              "{design.physicalCard.backSlogan || 'Conectando el presente con el futuro digital.'}"
            </p>
          </div>

          <div className="flex items-end justify-between text-xs opacity-80 pt-2 border-t border-white/10">
            <div>
              <p className="font-semibold">{design.physicalCard.backWebsite || card.website || 'lavdigitalmkt.com'}</p>
              <p>{design.physicalCard.backPhone || card.phone}</p>
            </div>
            {design.physicalCard.showBackQr && (
              <div className="bg-white p-1 rounded-md shadow">
                <QrCode className="w-8 h-8 text-slate-900" />
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  // Cada colección nueva debe activar su lenguaje visual también en la vista previa.
  const isEleganceLuxury = ['elegance-luxury','executive-black','champagne-gold','royal-navy','black-gold','platinum-edition','liquid-metal','royal-velvet'].includes(design.theme) || design.animationStyle === 'metallic-sheen';
  const isFutureTech = ['future-tech','cyber-blue','neon-purple','digital-glass','cyber-chrome','neon-grid','digital-orbit','holographic-future','liquid-glass'].includes(design.theme) || design.animationStyle === 'tech-scan';
  const isGlassMotion = ['glass-motion','aurora-glass','frosted-depth','crystal-prism','aurora-flow','prismatic-light','dynamic-layers'].includes(design.theme) || design.animationStyle === 'floating-glow' || design.animationStyle === 'glass-parallax';
  const isYoungCreative = ['young-creative','urban-gradient','pop-creative','color-motion','asymmetric-flow','bold-creative','editorial-cover'].includes(design.theme) || design.animationStyle === 'liquid-flow';
  const isMinimalStudio = ['minimal-studio','pure-white','soft-beige','modern-monochrome','swiss-minimal','monochrome-studio','architectural-lines'].includes(design.theme) || design.animationStyle === 'subtle-fade';
  const isBusinessSignature = ['business-signature','corporate-executive','modern-consultant','lawyer-elite','architectural-lines'].includes(design.theme);
  const isGradientFinish = design.backgroundFinish === 'gradient' || (!design.backgroundFinish && ['urban-gradient','color-motion','aurora-glass','soft-gradient','bold-gradient','aurora-flow','prismatic-light','royal-velvet'].includes(design.theme));
  const isMetallicFinish = design.backgroundFinish === 'metallic' || (!design.backgroundFinish && ['executive-black','champagne-gold','royal-navy','black-gold','platinum-edition','liquid-metal','lawyer-elite','elegance-luxury','cyber-chrome'].includes(design.theme));
  // El acabado elegido tiene prioridad y las texturas no bloquean los controles.
  const cardBackgroundImage = design.backgroundFinish === 'gradient'
    ? `linear-gradient(135deg,${design.primaryColor || '#06b6d4'},${design.secondaryColor || '#7c3aed'},${design.accentColor || '#ec4899'})`
    : design.backgroundFinish === 'metallic'
    ? 'linear-gradient(115deg,#27272a 0%,#d4d4d8 14%,#71717a 28%,#fef3c7 43%,#a16207 56%,#f8fafc 70%,#52525b 84%,#e5e7eb 100%)'
    : design.backgroundTextureUrl
    ? `url("${design.backgroundTextureUrl}")`
    : design.backgroundFinish === 'solid'
    ? getPatternBg()
    : isMetallicFinish
    ? 'linear-gradient(115deg,#27272a 0%,#d4d4d8 14%,#71717a 28%,#fef3c7 43%,#a16207 56%,#f8fafc 70%,#52525b 84%,#e5e7eb 100%)'
    : isGradientFinish
    ? `linear-gradient(135deg,${design.primaryColor || '#06b6d4'},${design.secondaryColor || '#7c3aed'},${design.accentColor || '#ec4899'})`
    : getPatternBg();

  const avatarUrl = design.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500';
  const photoComp = design.photoComposition || 'circle-portrait';
  const allPhotos = [
    avatarUrl,
    ...(card.gallery && card.gallery.length > 0
      ? card.gallery.map((g) => g.imageUrl)
      : [
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500',
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500',
        ]),
  ].filter(Boolean);

  // Business logo renderer with 12 animations and positions
  const renderLogo = (targetPosition: 'card-top' | 'center-banner' | 'top-right' | 'above-avatar' | 'floating' | 'header') => {
    if (!design.logoUrl) return null;
    const currentPosition = design.logoPosition || 'header';
    if (currentPosition !== targetPosition) return null;

    const animClass = design.logoAnimation && design.logoAnimation !== 'none'
      ? `anim-logo-${design.logoAnimation} anim-speed-${design.logoAnimationSpeed || 'normal'}`
      : '';

    return (
      <div className={`inline-flex items-center justify-center ${animClass}`}>
        <img
          src={design.logoUrl}
          alt={card.businessName || 'Logo'}
          style={{ width: `${design.logoWidth || 100}px` }}
          className="max-h-14 object-contain filter drop-shadow-md"
        />
      </div>
    );
  };

  // 20 Distinct Photo Composition Variants
  const renderPhotoComposition = () => {
    switch (photoComp) {
      case 'top-large':
        return (
          <div className="relative -mx-6 -mt-0 mb-4 overflow-hidden aspect-[4/3] bg-slate-900 group">
            <img
              src={avatarUrl}
              alt={card.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              {renderLogo('top-right')}
            </div>
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
              {renderLogo('header')}
            </div>
          </div>
        );

      case 'vertical-large':
        return (
          <div className="relative -mx-6 mb-4 overflow-hidden aspect-[3/4] bg-slate-900 group">
            <img
              src={avatarUrl}
              alt={card.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />
            <div className="absolute top-4 left-4 z-10">
              {renderLogo('header')}
            </div>
          </div>
        );

      case 'card-bg':
        return (
          <div className="relative -mx-6 mb-4 overflow-hidden h-48 bg-slate-900">
            <img
              src={avatarUrl}
              alt={card.name}
              className="w-full h-full object-cover filter blur-sm scale-110 opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950" />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt={card.name}
                  className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white/20 shadow-2xl"
                />
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
              </div>
            </div>
          </div>
        );

      case 'bottom-compact':
        return (
          <div className="flex items-center justify-between -mt-10 mb-4 card-stagger-1">
            {renderLogo('header')}
          </div>
        );

      case 'left-photo':
        return (
          <div className="flex items-center gap-3.5 -mt-10 mb-4 p-3 rounded-2xl bg-white/[0.04] border border-white/10 card-stagger-1 backdrop-blur-md">
            <div className="relative flex-shrink-0">
              <img
                src={avatarUrl}
                alt={card.name}
                className="w-20 h-20 rounded-2xl object-cover shadow-xl ring-2 ring-white/10"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
            </div>
            <div className="flex-1 min-w-0">
              {renderLogo('above-avatar')}
              <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 truncate">
                {card.businessName || 'Profesional'}
              </p>
              <h2 className="text-base font-extrabold text-white truncate" style={{ fontFamily: headlineFontFamily }}>
                {card.name}
              </h2>
              <p className="text-xs text-slate-300 truncate">{card.jobTitle}</p>
            </div>
            {renderLogo('header')}
          </div>
        );

      case 'right-photo':
        return (
          <div className="flex items-center justify-between gap-3.5 -mt-10 mb-4 p-3 rounded-2xl bg-white/[0.04] border border-white/10 card-stagger-1 backdrop-blur-md">
            <div className="flex-1 min-w-0">
              {renderLogo('header')}
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400 truncate">
                {card.businessName || 'Especialista'}
              </p>
              <h2 className="text-base font-extrabold text-white truncate" style={{ fontFamily: headlineFontFamily }}>
                {card.name}
              </h2>
              <p className="text-xs text-slate-300 truncate">{card.jobTitle}</p>
            </div>
            <div className="relative flex-shrink-0">
              <img
                src={avatarUrl}
                alt={card.name}
                className="w-20 h-20 rounded-2xl object-cover shadow-xl ring-2 ring-white/10"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
            </div>
          </div>
        );

      case 'panoramic':
        return (
          <div className="relative -mx-6 -mt-10 mb-4 overflow-hidden rounded-2xl border border-white/10 shadow-2xl aspect-[16/9] bg-slate-900 group">
            <img
              src={avatarUrl}
              alt={card.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
              <span className="text-xs font-bold text-white tracking-wide drop-shadow">
                {card.name}
              </span>
              {renderLogo('header')}
            </div>
          </div>
        );

      case 'elegant-frame':
        return (
          <div className="flex items-end justify-between -mt-14 mb-4 card-stagger-1">
            <div className="relative p-1 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 shadow-2xl">
              <div className="p-0.5 rounded-[14px] bg-slate-950">
                <img
                  src={avatarUrl}
                  alt={card.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-400 ring-2 ring-slate-950 flex items-center justify-center text-[8px] font-black text-slate-950">
                ★
              </span>
            </div>
            {renderLogo('header')}
          </div>
        );

      case 'rounded-squircle':
        return (
          <div className="flex items-end justify-between -mt-14 mb-4 card-stagger-1">
            <div className="relative group">
              <div
                className="absolute -inset-1 rounded-3xl blur-md opacity-60 group-hover:opacity-100 transition duration-500"
                style={{
                  background: `linear-gradient(45deg, ${design.primaryColor}, ${design.accentColor || design.secondaryColor})`,
                }}
              />
              <img
                src={avatarUrl}
                alt={card.name}
                className="relative w-20 h-20 rounded-2xl object-cover bg-slate-900 shadow-2xl ring-2 ring-white/20"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-slate-950 z-10" />
            </div>
            {renderLogo('header')}
          </div>
        );

      case 'asymmetric':
        return (
          <div className="flex items-end justify-between -mt-14 mb-4 card-stagger-1">
            <div className="relative rotate-[-3deg] hover:rotate-0 transition-transform duration-300">
              <div className="absolute inset-0 bg-indigo-500/40 rounded-2xl translate-x-1.5 translate-y-1.5" />
              <img
                src={avatarUrl}
                alt={card.name}
                className="relative w-20 h-20 rounded-2xl object-cover bg-slate-900 shadow-2xl ring-2 ring-white"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
            </div>
            {renderLogo('header')}
          </div>
        );

      case 'multi-grid':
        return (
          <div className="flex items-center gap-2 -mt-12 mb-4 card-stagger-1">
            <img
              src={avatarUrl}
              alt={card.name}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-white/20 shadow-xl flex-shrink-0"
            />
            <div className="grid grid-cols-2 gap-1.5 flex-1 max-w-[130px]">
              {allPhotos.slice(1, 3).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="Thumb"
                  className="w-full h-9 rounded-lg object-cover opacity-80 hover:opacity-100 transition border border-white/10"
                />
              ))}
            </div>
            <div className="ml-auto">{renderLogo('header')}</div>
          </div>
        );

      case 'horizontal-slider':
        return (
          <div className="relative -mx-6 -mt-8 mb-4">
            <div className="flex gap-2.5 overflow-x-auto px-6 pb-2 no-scrollbar">
              {allPhotos.map((img, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shadow-lg relative group bg-slate-800"
                >
                  <img
                    src={img}
                    alt={`Photo ${i}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 text-[9px] bg-black/70 text-emerald-400 font-bold px-1.5 py-0.5 rounded">
                      Principal
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'main-thumbnails':
        return (
          <div className="-mt-12 mb-4 space-y-2 card-stagger-1">
            <div className="flex items-end justify-between">
              <div className="relative">
                <img
                  src={allPhotos[activeThumbnailIndex] || avatarUrl}
                  alt={card.name}
                  className="w-24 h-24 rounded-2xl object-cover shadow-2xl ring-3 ring-white/20 transition-all duration-300"
                />
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
              </div>
              {renderLogo('header')}
            </div>
            {/* Thumbnails row */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {allPhotos.map((photo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveThumbnailIndex(idx)}
                  className={`w-9 h-9 rounded-lg overflow-hidden border transition flex-shrink-0 ${
                    activeThumbnailIndex === idx ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-white/20 opacity-60'
                  }`}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        );

      case 'editorial-spread':
        return (
          <div className="flex items-start justify-between -mt-10 mb-4 card-stagger-1">
            <div className="flex-1 pr-3 pt-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                Editorial &bull; Vol. 1
              </span>
              {renderLogo('above-avatar')}
            </div>
            <div className="relative flex-shrink-0">
              <img
                src={avatarUrl}
                alt={card.name}
                className="w-24 h-32 rounded-xl object-cover shadow-2xl ring-1 ring-white/30"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/20 rounded-xl pointer-events-none" />
            </div>
          </div>
        );

      case 'overlapping-depth':
        return (
          <div className="flex items-end justify-between -mt-14 mb-4 card-stagger-1">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-lg opacity-40 group-hover:opacity-75 transition" />
              <div className="relative p-1 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <img
                  src={avatarUrl}
                  alt={card.name}
                  className="w-20 h-20 rounded-xl object-cover shadow-2xl"
                />
              </div>
              <div className="absolute -bottom-2 -left-2 px-2 py-0.5 rounded-full bg-slate-900/90 border border-emerald-500/40 text-[9px] font-bold text-emerald-400 shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Disponible</span>
              </div>
            </div>
            {renderLogo('header')}
          </div>
        );

      case 'photo-cards':
        return (
          <div className="flex items-end justify-between -mt-14 mb-4 card-stagger-1">
            <div className="bg-white p-1.5 pb-4 rounded-xl shadow-2xl rotate-[-2deg] hover:rotate-0 transition duration-300">
              <img
                src={avatarUrl}
                alt={card.name}
                className="w-20 h-20 rounded-lg object-cover bg-slate-200"
              />
              <p className="text-[9px] font-bold text-slate-800 text-center mt-1 truncate max-w-[80px]">
                {card.name.split(' ')[0]}
              </p>
            </div>
            {renderLogo('header')}
          </div>
        );

      case 'minimal-small':
        return (
          <div className="flex items-center justify-between -mt-6 mb-3 card-stagger-1">
            <div className="flex items-center gap-3">
              <img
                src={avatarUrl}
                alt={card.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white/20 shadow-md"
              />

            </div>
            {renderLogo('header')}
          </div>
        );

      case 'geometric-cut':
        return (
          <div className="flex items-end justify-between -mt-14 mb-4 card-stagger-1">
            <div className="relative">
              <div className="w-22 h-22 p-0.5 bg-gradient-to-tr from-cyan-400 to-indigo-500 clip-hexagon">
                <img
                  src={avatarUrl}
                  alt={card.name}
                  className="w-20 h-20 object-cover clip-hexagon"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-cyan-400 ring-2 ring-slate-950" />
            </div>
            {renderLogo('header')}
          </div>
        );

      case 'multi-zone':
        return (
          <div className="flex items-end justify-between -mt-14 mb-4 card-stagger-1">
            <div className="relative">
              {renderLogo('above-avatar')}
              <img
                src={avatarUrl}
                alt={card.name}
                className="w-20 h-20 rounded-full object-cover shadow-2xl ring-4 ring-slate-900 border-2 border-indigo-500"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
            </div>
            {renderLogo('header')}
          </div>
        );

      case 'circle-portrait':
      default:
        return (
          <div className="flex items-end justify-between -mt-14 mb-4 card-stagger-1">
            <div className="relative group">
              {renderLogo('above-avatar')}
              <img
                src={avatarUrl}
                alt={card.name}
                className={`object-cover bg-slate-800 shadow-xl transition-transform ${
                  design.avatarSize === 'lg' ? 'w-24 h-24' : design.avatarSize === 'sm' ? 'w-16 h-16' : 'w-20 h-20'
                } ${
                  design.avatarShape === 'circle'
                    ? 'rounded-full'
                    : design.avatarShape === 'squircle'
                    ? 'rounded-2xl'
                    : 'rounded-lg'
                } ${design.avatarBorder ? 'ring-4' : ''}`}
                style={{
                  boxShadow: design.avatarBorder ? `0 0 0 4px ${design.backgroundColor || '#0f172a'}` : undefined,
                  borderColor: design.primaryColor,
                }}
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
            </div>
            {renderLogo('header')}
          </div>
        );
    }
  };

  return (
    <div
      className={`lav-card-preview relative w-full max-w-[430px] mx-auto overflow-hidden transition-all duration-300 ${
        isEleganceLuxury
          ? 'anim-shimmer-sweep border border-amber-500/30 shadow-[0_20px_50px_rgba(217,119,6,0.18)]'
          : isFutureTech
          ? 'anim-border-beam border border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.22)]'
          : isGlassMotion
          ? 'border border-white/20 backdrop-blur-2xl shadow-2xl'
          : isYoungCreative
          ? 'border border-white/25 shadow-2xl'
          : isMinimalStudio
          ? 'border border-slate-700/60 shadow-lg'
          : isBusinessSignature
          ? 'border border-blue-500/30 shadow-2xl'
          : 'border border-white/10 shadow-2xl'
      } ${
        design.cardShape === 'rounded-3xl'
          ? 'rounded-[32px]'
          : design.cardShape === 'rounded-2xl'
          ? 'rounded-2xl'
          : design.cardShape === 'rounded-xl'
          ? 'rounded-xl'
          : 'rounded-none'
      }`}
      style={{
        backgroundColor: design.backgroundColor || '#0f172a',
        color: design.textColor || '#f8fafc',
        backgroundImage: cardBackgroundImage,
        backgroundSize: design.backgroundTextureUrl ? 'cover' : 'auto',
        backgroundPosition: 'center',
        ['--beam-color' as any]: design.primaryColor || '#06b6d4',
        ['--card-text-color' as any]: /^#[0-9a-fA-F]{6}$/.test(design.textColor || '') ? design.textColor : '#f8fafc',
      }}
    >
      <style>{`
        .lav-card-preview :is(h1,h2,h3,h4,p,span,strong,em,label,small,li,a,button):not(.social-icon-btn):not(.text-emerald-400):not(.text-amber-400) {
          color: var(--card-text-color);
        }
      `}</style>
      {/* Background Ambient Floating Orbs for Glass & Motion */}
      {isGlassMotion && (
        <>
          <div
            className="absolute -top-16 -left-16 w-56 h-56 rounded-full blur-3xl opacity-35 pointer-events-none anim-float-orb-1"
            style={{ backgroundColor: design.primaryColor || '#38bdf8' }}
          />
          <div
            className="absolute top-1/2 -right-16 w-56 h-56 rounded-full blur-3xl opacity-30 pointer-events-none anim-float-orb-2"
            style={{ backgroundColor: design.accentColor || design.secondaryColor || '#818cf8' }}
          />
        </>
      )}

      {/* Cyber Scanline effect for Future Tech */}
      {isFutureTech && (
        <div className="absolute inset-0 pointer-events-none anim-scanline overflow-hidden z-20 opacity-70" />
      )}

      {/* Optional Card Top Logo */}
      {renderLogo('card-top') && (
        <div className="pt-3 px-6 pb-1 text-center z-10 relative">
          {renderLogo('card-top')}
        </div>
      )}

      {/* Cover Banner: render the uploaded cover as a real image so theme CSS cannot hide it. */}
      {(!!design.bannerUrl || (photoComp !== 'top-large' && photoComp !== 'vertical-large' && photoComp !== 'card-bg')) && (
        <div
          className={`relative w-full overflow-hidden transition-all ${
            isYoungCreative && !design.bannerUrl ? 'anim-liquid-flow' : ''
          } ${
            design.coverHeight === 'sm'
              ? 'h-28'
              : design.coverHeight === 'lg'
              ? 'h-48'
              : design.coverHeight === 'none'
              ? 'h-10'
              : 'h-36'
          }`}
          style={{
            background: `linear-gradient(135deg, ${design.primaryColor}, ${design.secondaryColor})`,
          }}
        >
          {design.bannerUrl && (
            <img
              src={design.bannerUrl}
              alt={`Portada de ${card.name || card.businessName || 'la tarjeta'}`}
              className="absolute inset-0 z-0 h-full w-full object-cover"
              style={{ objectPosition: 'center' }}
            />
          )}
          {/* Subtle gradient vignette */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Centered Banner Logo */}
          {renderLogo('center-banner') && (
            <div className="absolute inset-0 flex items-center justify-center p-3 z-10 pointer-events-none">
              {renderLogo('center-banner')}
            </div>
          )}

          {/* Top-Right Logo */}
          {renderLogo('top-right') && (
            <div className="absolute top-3 left-4 z-10">
              {renderLogo('top-right')}
            </div>
          )}

          {/* Top Floating Action Icons */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
            {design.showQrCodeButton && (
              <button
                onClick={handleOpenQr}
                aria-label="Código QR"
                className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition shadow-sm border border-white/10"
                title="Ver Código QR"
              >
                <QrCode className="w-4 h-4" />
              </button>
            )}
            {design.showNfcButton && (
              <button
                onClick={() => setShowNfcModal(true)}
                aria-label="Tarjeta NFC"
                className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition shadow-sm border border-white/10"
                title="Programar Tarjeta NFC"
              >
                <Wifi className="w-4 h-4" />
              </button>
            )}
            {design.showShareButton && (
              <button
                onClick={handleCopyLink}
                aria-label="Compartir tarjeta"
                className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition shadow-sm border border-white/10"
                title="Compartir tarjeta"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Card Content */}
      <div className="relative px-6 pb-8" style={{ fontFamily: bodyFontFamily }}>
        {/* Render Selected Photo Composition (1 of 20 variants) */}
        {renderPhotoComposition()}

        {/* Company & Name */}
        <div className="mb-3 card-stagger-2">
          {card.businessName && (
            <p
              className="text-xs font-bold tracking-wider uppercase mb-0.5"
              style={{ color: design.accentColor || '#38bdf8', fontFamily: headlineFontFamily }}
            >
              {card.businessName}
            </p>
          )}
          <h1
            className="text-2xl font-extrabold tracking-tight text-white leading-tight"
            style={{ fontFamily: headlineFontFamily }}
          >
            {card.name || 'Nombre Completo'}
          </h1>
          {card.jobTitle && (
            <p className="text-sm font-medium opacity-80 mt-0.5">{card.jobTitle}</p>
          )}
        </div>

        {/* Bio description */}
        {card.bio && (
          <p className="text-xs leading-relaxed opacity-85 mb-5 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] card-stagger-2">
            {card.bio}
          </p>
        )}

        {/* Bottom Compact Photo (When photoComposition === 'bottom-compact') */}
        {photoComp === 'bottom-compact' && (
          <div className="mb-5 rounded-2xl overflow-hidden border border-white/10 shadow-lg relative aspect-[16/9] group bg-slate-800">
            <img
              src={avatarUrl}
              alt={card.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
              <span className="text-xs font-bold text-white drop-shadow">{card.name}</span>
            </div>
          </div>
        )}

        {/* Quick Action Matrix (WhatsApp, Call, Email, Location) */}
        <div className="grid grid-cols-4 gap-2 mb-4 card-stagger-3">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => recordCardContactClick(card.id, 'whatsapp')}
              className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl transition group active:scale-95 shadow-sm text-center"
              style={{
                backgroundColor: design.primaryColor,
                color: '#ffffff',
              }}
            >
              <MessageCircle className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-semibold">WhatsApp</span>
            </a>
          )}

          {phoneClean && (
            <a
              href={`tel:${phoneClean}`}
              onClick={() => recordCardContactClick(card.id, 'call')}
              className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] transition text-white group active:scale-95 border border-white/[0.08] text-center"
            >
              <Phone className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-semibold">Llamar</span>
            </a>
          )}

          {card.email && (
            <a
              href={`mailto:${card.email}`}
              onClick={() => recordCardContactClick(card.id, 'email')}
              className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] transition text-white group active:scale-95 border border-white/[0.08] text-center"
            >
              <Mail className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-semibold">Correo</span>
            </a>
          )}

          {(card.googleMapsUrl || card.address) && (
            <a
              href={card.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(card.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => recordCardContactClick(card.id, 'map')}
              className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] transition text-white group active:scale-95 border border-white/[0.08] text-center"
            >
              <MapPin className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-semibold">Mapa</span>
            </a>
          )}
        </div>

        {/* Primary Call to Action: Guardar Contacto (Apertura directa de la app de Contactos de Android / iPhone) */}
        {design.showSaveContactButton && (
          <div className="space-y-2 mb-5 card-stagger-3">
            <button
              type="button"
              onClick={handleOpenContactSave}
              className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg active:scale-[0.98] transition duration-200 text-white cursor-pointer no-underline text-center"
              style={{
                background: `linear-gradient(135deg, ${design.primaryColor}, ${design.accentColor || design.secondaryColor})`,
                fontFamily: headlineFontFamily,
              }}
            >
              <UserPlus className="w-4 h-4" />
              <span>Compartir contacto</span>
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  recordCardContactClick(card.id, 'saveContact');
                  downloadVCard(card);
                }}
                className="text-[10px] text-white/50 hover:text-white/80 transition underline inline-flex items-center gap-1"
                title="Descargar archivo .vcf manual para Outlook, Gmail o PC"
              >
                <Download className="w-3 h-3" />
                <span>¿En computadora? Descargar archivo .vcf</span>
              </button>
            </div>
          </div>
        )}

        {/* Custom Buttons */}
        {design.showCustomButtons && card.customButtons && card.customButtons.length > 0 && (
          <div className="space-y-2 mb-5">
            {card.customButtons.map((btn) => (
              <a
                key={btn.id}
                href={btn.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl flex items-center justify-between text-xs font-bold transition duration-200 group active:scale-[0.99] border"
                style={{
                  backgroundColor:
                    btn.style === 'primary'
                      ? design.primaryColor
                      : btn.style === 'accent'
                      ? design.accentColor
                      : 'rgba(255, 255, 255, 0.06)',
                  color: '#ffffff',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  fontFamily: headlineFontFamily,
                }}
              >
                <span>{btn.label}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform opacity-70" />
              </a>
            ))}
          </div>
        )}

        {/* Embedded Video (YouTube / Shorts / Vimeo Player) */}
        {card.videoUrl && (() => {
          const embedUrl = getEmbedVideoUrl(card.videoUrl);
          if (!embedUrl) return null;
          return (
            <div className="mb-5 rounded-2xl overflow-hidden bg-white/[0.04] border border-white/[0.1] p-3 shadow-lg">
              <div className="flex items-center justify-between gap-2 mb-2 px-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                    <Play className="w-2.5 h-2.5 text-white fill-white ml-0.5" />
                  </div>
                  <h3
                    className="text-xs font-bold text-white tracking-wide truncate"
                    style={{ fontFamily: headlineFontFamily }}
                  >
                    {card.videoTitle || 'Video de Presentación'}
                  </h3>
                </div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-red-400 bg-red-950/60 border border-red-800/60 px-1.5 py-0.5 rounded">
                  YouTube
                </span>
              </div>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-inner bg-black">
                <iframe
                  src={embedUrl}
                  title={card.videoTitle || 'Video de YouTube'}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          );
        })()}

        {/* Catalog / Products, Services & Restaurant Gastro Menu */}
        {design.showCatalog && card.catalog && card.catalog.length > 0 && (() => {
          const categories = ['Todos', ...Array.from(new Set(card.catalog.map(c => c.category).filter(Boolean) as string[]))];
          const filteredItems = selectedCatalogCategory === 'Todos'
            ? card.catalog
            : card.catalog.filter(c => c.category === selectedCatalogCategory);

          return (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2.5">
                <h2
                  className="text-xs font-bold uppercase tracking-wider opacity-75 flex items-center gap-1.5"
                  style={{ fontFamily: headlineFontFamily }}
                >
                  <Utensils className="w-3.5 h-3.5 text-amber-400" />
                  <span>{design.theme === 'gastro-menu' ? 'Menú & Carta Digital' : 'Catálogo & Servicios'}</span>
                </h2>
                <span className="text-[10px] text-slate-400 font-medium">
                  {filteredItems.length} {filteredItems.length === 1 ? 'opción' : 'opciones'}
                </span>
              </div>

              {/* Category Filter Tabs for Menu / Catalog */}
              {categories.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2.5 no-scrollbar">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCatalogCategory(cat)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition ${
                        selectedCatalogCategory === cat
                          ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                          : 'bg-white/[0.06] text-white/70 hover:bg-white/[0.12] hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-2.5">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] items-center hover:bg-white/[0.07] transition"
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-16 h-16 rounded-xl object-cover bg-slate-800 flex-shrink-0"
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${design.primaryColor}22` }}
                      >
                        <Sparkles className="w-6 h-6" style={{ color: design.accentColor }} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-white truncate">{item.title}</p>
                        {item.category && item.category !== 'General' && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
                            {item.category}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-[11px] opacity-75 line-clamp-2 mt-0.5">{item.description}</p>
                      )}
                      {item.price && (
                        <p
                          className="text-xs font-extrabold mt-1"
                          style={{ color: design.accentColor || '#38bdf8' }}
                        >
                          {item.price}
                        </p>
                      )}
                    </div>
                    {item.ctaLink && (
                      <a
                        href={item.ctaLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-white/10 hover:bg-white/20 text-white transition flex-shrink-0 shadow-sm"
                      >
                        {item.ctaLabel || 'Pedir'}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Google Reviews Module */}
        {card.googleReviews?.enabled && (
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <GoogleGIcon className="w-5 h-5 flex-shrink-0" />
                <span className="text-xs font-bold text-white tracking-wide" style={{ fontFamily: headlineFontFamily }}>
                  {card.googleReviews.title || 'Déjanos tu opinión en Google'}
                </span>
              </div>
              <div className="flex items-center gap-0.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
              Tu recomendación es muy valiosa para nosotros y ayuda a más personas a conocer nuestro trabajo.
            </p>

            <a
              href={card.googleReviews.placeUrl || 'https://search.google.com/local/writereview'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-md active:scale-[0.99]"
            >
              <GoogleGIcon className="w-4 h-4" />
              <span>{card.googleReviews.buttonText || 'Calificar en Google'}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60 ml-auto" />
            </a>
          </div>
        )}

        {/* Bank Transfer / SPEI Module */}
        {card.bankTransfer?.enabled && (
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-850/90 border border-emerald-500/30 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-white" style={{ fontFamily: headlineFontFamily }}>
                    Transferencia Bancaria / SPEI
                  </h3>
                  <p className="text-[10px] text-emerald-400 font-semibold">Depósitos y transferencias directas</p>
                </div>
              </div>
              <span className="text-[9px] uppercase tracking-wider font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full">
                SPEI
              </span>
            </div>

            <div className="space-y-2 text-xs mb-4">
              {card.bankTransfer.bankName && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Banco:</span>
                    <span className="text-white font-bold">{card.bankTransfer.bankName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyBankField('Banco', card.bankTransfer?.bankName)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition"
                    title="Copiar Banco"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {card.bankTransfer.accountHolder && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Beneficiario / Titular:</span>
                    <span className="text-white font-bold">{card.bankTransfer.accountHolder}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyBankField('Titular', card.bankTransfer?.accountHolder)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition"
                    title="Copiar Titular"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {card.bankTransfer.clabe && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/20">
                  <div>
                    <span className="text-[10px] text-emerald-400 block font-bold">CLABE Interbancaria (18 dígitos):</span>
                    <span className="text-emerald-300 font-mono font-bold tracking-wider">{card.bankTransfer.clabe}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyBankField('CLABE', card.bankTransfer?.clabe)}
                    className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
                    title="Copiar CLABE"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {card.bankTransfer.accountNumber && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Número de Cuenta:</span>
                    <span className="text-white font-mono font-bold">{card.bankTransfer.accountNumber}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyBankField('Cuenta', card.bankTransfer?.accountNumber)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition"
                    title="Copiar Cuenta"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {card.bankTransfer.cardNumber && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Tarjeta de Débito (16 dígitos):</span>
                    <span className="text-white font-mono font-bold">{card.bankTransfer.cardNumber}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyBankField('Tarjeta', card.bankTransfer?.cardNumber)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition"
                    title="Copiar Tarjeta"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {card.bankTransfer.reference && (
                <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[11px]">
                  <span className="text-slate-400 block font-medium">Referencia / Concepto:</span>
                  <span className="text-white font-semibold">{card.bankTransfer.reference}</span>
                </div>
              )}

              {card.bankTransfer.instructions && (
                <p className="text-[10px] text-slate-400 italic px-1">
                  Nota: {card.bankTransfer.instructions}
                </p>
              )}
            </div>

            {/* Quick Action Buttons for Bank Data */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyAllBankData}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar todos los datos</span>
              </button>

              <button
                type="button"
                onClick={handleShareBankWhatsApp}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md shadow-emerald-600/30"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Enviar por WhatsApp</span>
              </button>
            </div>
          </div>
        )}

        {/* PayPal Real Checkout & Payment Link Module */}
        {card.paypal?.enabled && (
          <div className="mb-5 p-4 rounded-2xl bg-[#003087]/20 border border-[#0079C1]/40 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <PayPalIcon className="w-6 h-6" />
                <div>
                  <h3 className="text-xs font-black text-white" style={{ fontFamily: headlineFontFamily }}>
                    Pago Seguro con PayPal
                  </h3>
                  <p className="text-[10px] text-sky-300 font-semibold">Tarjetas de crédito, débito o saldo PayPal</p>
                </div>
              </div>
              {card.paypal.amount && (
                <span className="text-xs font-black text-white bg-[#003087] px-2.5 py-1 rounded-lg border border-[#0079C1]/60">
                  {card.paypal.currency || 'USD'} ${card.paypal.amount}
                </span>
              )}
            </div>

            {card.paypal.description && (
              <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
                {card.paypal.description}
              </p>
            )}

            <button
              type="button"
              onClick={handleOpenPayPal}
              className="w-full py-3 px-4 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-[#003087]/40 active:scale-[0.98]"
            >
              <PayPalIcon className="w-4 h-4" />
              <span>{card.paypal.buttonText || 'Pagar con PayPal'}</span>
            </button>
          </div>
        )}

        {/* Gallery / Portfolio */}
        {design.showGallery && card.gallery && card.gallery.length > 0 && (
          <div className="mb-5">
            <h2
              className="text-xs font-bold uppercase tracking-wider mb-2.5 opacity-70"
              style={{ fontFamily: headlineFontFamily }}
            >
              Portafolio & Trabajos
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {card.gallery.map((g) => (
                <div key={g.id} className="relative rounded-xl overflow-hidden aspect-square group bg-slate-800">
                  <img
                    src={g.imageUrl}
                    alt={g.title || 'Foto'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {g.title && (
                    <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent text-[10px] font-medium text-white truncate">
                      {g.title}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Business Hours */}
        {design.showHours && card.businessHours && (
          <div className="mb-5 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold block text-white">Horarios de Atención:</span>
              <span className="opacity-80 text-[11px]">{card.businessHours}</span>
            </div>
          </div>
        )}

        {/* Physical Address */}
        {card.address && (
          <div className="mb-5 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold block text-white">Dirección:</span>
              <span className="opacity-80 text-[11px]">{card.address}</span>
            </div>
          </div>
        )}

        {/* Social Networks Section */}
        {design.showSocials && Object.values(card.socials || {}).some((value) => typeof value === 'string' && value.trim()) && (
          <section className="mt-5 pt-4 border-t border-white/[0.08]" aria-labelledby="digital-card-social-title">
            <h3 id="digital-card-social-title" className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">Redes sociales</h3>
            <div className="flex items-center justify-center gap-2.5 pb-4 flex-wrap" aria-label="Redes sociales">
            {card.socials.instagram && (
              <a href={formatSocialUrl('instagram', card.socials.instagram)} target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram" className="inline-flex items-center gap-2 min-h-10 px-3 rounded-xl bg-white/[0.08] hover:bg-pink-500/15 border border-white/[0.14] hover:border-pink-400/50 text-white transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
                <Instagram className="w-[18px] h-[18px] text-pink-300 flex-shrink-0" /><span className="text-xs font-semibold tracking-wide">Instagram</span>
              </a>
            )}
            {card.socials.facebook && (
              <a href={formatSocialUrl('facebook', card.socials.facebook)} target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook" className="inline-flex items-center gap-2 min-h-10 px-3 rounded-xl bg-white/[0.08] hover:bg-blue-500/15 border border-white/[0.14] hover:border-blue-400/50 text-white transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
                <Facebook className="w-[18px] h-[18px] text-blue-300 flex-shrink-0" /><span className="text-xs font-semibold tracking-wide">Facebook</span>
              </a>
            )}
            {card.socials.youtube && (
              <a href={formatSocialUrl('youtube', card.socials.youtube)} target="_blank" rel="noopener noreferrer" aria-label="Canal de YouTube" title="YouTube" className="inline-flex items-center gap-2 min-h-10 px-3 rounded-xl bg-white/[0.08] hover:bg-red-500/15 border border-white/[0.14] hover:border-red-400/50 text-white transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
                <Youtube className="w-[18px] h-[18px] text-red-300 flex-shrink-0" /><span className="text-xs font-semibold tracking-wide">YouTube</span>
              </a>
            )}
            {card.socials.twitter && (
              <a href={formatSocialUrl('twitter', card.socials.twitter)} target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" title="X" className="inline-flex items-center gap-2 min-h-10 px-3 rounded-xl bg-white/[0.08] hover:bg-white/10 border border-white/[0.14] hover:border-white/35 text-white transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
                <XIcon className="w-[18px] h-[18px] flex-shrink-0" /><span className="text-xs font-semibold tracking-wide">X</span>
              </a>
            )}
            {card.socials.tiktok && (
              <a href={formatSocialUrl('tiktok', card.socials.tiktok)} target="_blank" rel="noopener noreferrer" aria-label="TikTok" title="TikTok" className="inline-flex items-center gap-2 min-h-10 px-3 rounded-xl bg-white/[0.08] hover:bg-cyan-500/10 border border-white/[0.14] hover:border-cyan-300/40 text-white transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
                <span className="w-[18px] h-[18px] flex items-center justify-center text-sm font-black text-cyan-200 flex-shrink-0">♪</span><span className="text-xs font-semibold tracking-wide">TikTok</span>
              </a>
            )}
            {card.socials.linkedin && (
              <a href={formatSocialUrl('linkedin', card.socials.linkedin)} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn" className="inline-flex items-center gap-2 min-h-10 px-3 rounded-xl bg-white/[0.08] hover:bg-sky-500/15 border border-white/[0.14] hover:border-sky-400/50 text-white transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
                <Linkedin className="w-[18px] h-[18px] text-sky-300 flex-shrink-0" /><span className="text-xs font-semibold tracking-wide">LinkedIn</span>
              </a>
            )}
            {card.socials.telegram && (
              <a href={formatSocialUrl('telegram', card.socials.telegram)} target="_blank" rel="noopener noreferrer" aria-label="Telegram" title="Telegram" className="inline-flex items-center gap-2 min-h-10 px-3 rounded-xl bg-white/[0.08] hover:bg-sky-500/15 border border-white/[0.14] hover:border-sky-400/50 text-white transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
                <Send className="w-[18px] h-[18px] text-sky-300 flex-shrink-0" /><span className="text-xs font-semibold tracking-wide">Telegram</span>
              </a>
            )}
            {card.socials.spotify && (
              <a href={formatSocialUrl('spotify', card.socials.spotify)} target="_blank" rel="noopener noreferrer" aria-label="Spotify" title="Spotify" className="inline-flex items-center gap-2 min-h-10 px-3 rounded-xl bg-white/[0.08] hover:bg-emerald-500/15 border border-white/[0.14] hover:border-emerald-400/50 text-white transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
                <Spotify className="w-[18px] h-[18px] text-emerald-300 flex-shrink-0" /><span className="text-xs font-semibold tracking-wide">Spotify</span>
              </a>
            )}
            </div>
          </section>
        )}

        {/* Agency Footer Badge */}
        <div className="pt-4 border-t border-white/[0.08] text-center">
          <p className="text-[10px] tracking-wider uppercase opacity-50 font-medium">
            Diseñada con <span className="text-white font-bold">LAV Digital Marketing</span> &bull;{' '}
            <a href="https://lavdigitalmkt.com" target="_blank" rel="noreferrer" className="underline hover:text-white">
              lavdigitalmkt.com
            </a>
          </p>
        </div>
      </div>

      {/* Floating Copy Toast Notification */}
      {copyToast && (
        <div className="fixed bottom-6 inset-x-0 z-50 flex items-center justify-center px-4 pointer-events-none">
          <div className="py-2.5 px-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-2xl border border-emerald-400/40 pointer-events-auto animate-bounce">
            <Check className="w-4 h-4 text-emerald-200" />
            <span>{copyToast}</span>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-center text-white">
            <h3 className="text-lg font-bold mb-1" style={{ fontFamily: headlineFontFamily }}>
              Escanea para abrir en el celular
            </h3>
            <p className="text-xs text-slate-400 mb-4">Código QR dinámico vinculado a esta tarjeta</p>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-inner mb-4">
              {qrDataUrl && <img src={qrDataUrl} alt="QR Code" className="w-56 h-56 mx-auto" />}
            </div>

            <div className="flex items-center justify-center gap-2 mb-4">
              <button
                onClick={() => downloadQr(currentUrl, card.slug, 'png', { colorDark: design.primaryColor })}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
              >
                Descargar PNG
              </button>
              <button
                onClick={() => downloadQr(currentUrl, card.slug, 'svg', { colorDark: design.primaryColor })}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
              >
                Descargar SVG
              </button>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* NFC Tag Programming Modal */}
      {showNfcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold">Tarjeta o Llavero NFC</h3>
                <p className="text-xs text-slate-400">Programa un chip físico con la URL de tu tarjeta</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 mb-4 text-xs space-y-2">
              <p className="text-slate-300 font-medium">
                URL a escribir: <span className="text-indigo-400 select-all font-mono break-all">{currentUrl}</span>
              </p>
              <div className="text-[11px] text-slate-400">
                {checkNFCSupport().message}
              </div>
            </div>

            {/* Direct Web NFC Write (Android Chrome) */}
            {checkNFCSupport().supported ? (
              <button
                onClick={handleNfcWrite}
                disabled={nfcWriting}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 mb-3 shadow-lg"
              >
                <Wifi className="w-4 h-4 animate-pulse" />
                <span>{nfcWriting ? 'Esperando tarjeta NFC...' : 'Escribir en tarjeta NFC ahora'}</span>
              </button>
            ) : null}

            {nfcStatusText && (
              <p
                className={`text-xs p-3 rounded-xl mb-3 ${
                  nfcSuccess
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                    : 'bg-amber-950/60 text-amber-300 border border-amber-800'
                }`}
              >
                {nfcStatusText}
              </p>
            )}

            {/* Instructions for Android & iPhone */}
            <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-400 space-y-1.5">
              <p className="font-semibold text-slate-200">¿Cómo programar con la app gratuita NFC Tools?</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Descarga "NFC Tools" (Google Play o App Store).</li>
                <li>Abre la app y entra en <strong>Escribir</strong> &gt; <strong>Añadir un registro</strong>.</li>
                <li>Selecciona <strong>URL / Enlace</strong> y pega el enlace copiado.</li>
                <li>Toca <strong>Escribir</strong> y acerca tu tarjeta o sticker NFC al teléfono. ¡Listo!</li>
              </ol>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCopyLink}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copiar Enlace</span>
              </button>
              <button
                onClick={() => setShowNfcModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Save Modal & Native App Guide */}
      {showContactSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-emerald-500/30 p-5 sm:p-6 shadow-2xl text-white space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Compartir Contacto</h3>
                  <p className="text-xs text-emerald-400 font-semibold">{card.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowContactSaveModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Answer to the user's question about preview mode */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-indigo-300 font-bold">
                <Smartphone className="w-4 h-4 flex-shrink-0 text-indigo-400" />
                <span>¿Por qué no se abrió la agenda en esta pantalla?</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Estás visualizando la tarjeta desde una <strong>computadora</strong> o dentro del <strong>visor de previsualización (iframe)</strong>.
              </p>
              <ul className="text-slate-300 text-[11px] space-y-1 list-disc pl-4 leading-relaxed">
                <li>Las computadoras no cuentan con la aplicación nativa de Contactos de Android o iOS.</li>
                <li>Los navegadores web bloquean llamadas a aplicaciones externas del teléfono dentro de visores por seguridad.</li>
                <li>
                  <strong className="text-emerald-300">En tu celular real o en tu sitio (Hostinger):</strong> Al pulsar <em>"Compartir contacto"</em> se abre inmediatamente la app de Contactos de Google/Samsung en Android o Apple Contacts en iPhone.
                </li>
              </ul>
            </div>

            {/* Real-time QR Code to test on real phone right now */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center text-center space-y-2.5">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                <span>Pruébalo en vivo con tu celular</span>
              </span>
              <p className="text-[11px] text-slate-400">
                Apunta la cámara de tu teléfono a este código para abrir la tarjeta directamente en tu celular:
              </p>
              {qrDataUrl && (
                <div className="p-2.5 bg-white rounded-2xl shadow-lg">
                  <img src={qrDataUrl} alt="Código QR de la tarjeta" className="w-32 h-32 object-contain" />
                </div>
              )}
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline pt-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>O abrir tarjeta en nueva ventana del navegador</span>
              </a>
            </div>

            {/* Direct Native Testing Buttons */}
            <div className="space-y-2">
              <a
                href={androidIntentUrl}
                target="_top"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition text-center"
              >
                <Smartphone className="w-4 h-4" />
                <span>Probar Intent de Android (Google / Samsung)</span>
              </a>

              <a
                href={directVCardUrl}
                target="_top"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition text-center"
              >
                <Share2 className="w-4 h-4" />
                <span>Probar Ficha de Contactos de iPhone (Apple)</span>
              </a>

              <button
                type="button"
                onClick={() => downloadVCard(card)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar archivo .vcf para computadora (Outlook/Gmail)</span>
              </button>
            </div>

            <button
              onClick={() => setShowContactSaveModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
