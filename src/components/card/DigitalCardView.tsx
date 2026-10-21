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
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Modern official 𝕏 logo
const XIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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
  const currentUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/#card=${card.slug || card.id}`
    : `https://lavdigitalmkt.com/c/${card.slug}`;

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
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // fallback
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

  const isEleganceLuxury = design.theme === 'elegance-luxury' || design.animationStyle === 'metallic-sheen';
  const isFutureTech = design.theme === 'future-tech' || design.animationStyle === 'tech-scan';
  const isGlassMotion = design.theme === 'glass-motion' || design.animationStyle === 'floating-glow' || design.animationStyle === 'glass-parallax';
  const isYoungCreative = design.theme === 'young-creative' || design.animationStyle === 'liquid-flow';
  const isMinimalStudio = design.theme === 'minimal-studio' || design.animationStyle === 'subtle-fade';
  const isBusinessSignature = design.theme === 'business-signature';

  return (
    <div
      className={`relative w-full max-w-[430px] mx-auto overflow-hidden transition-all duration-300 ${
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
        backgroundImage: getPatternBg(),
        ['--beam-color' as any]: design.primaryColor || '#06b6d4',
      }}
    >
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

      {/* Cover Banner */}
      <div
        className={`relative w-full transition-all ${
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
          backgroundImage: design.bannerUrl ? `url('${design.bannerUrl}')` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Subtle gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

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
              aria-label="Compartir enlace"
              className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition shadow-sm border border-white/10"
              title="Copiar enlace"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Card Content */}
      <div className="relative px-6 pb-8" style={{ fontFamily: bodyFontFamily }}>
        {/* Avatar & Logo Row */}
        <div className="flex items-end justify-between -mt-14 mb-4 card-stagger-1">
          <div className="relative group">
            <img
              src={
                design.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
              }
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
            {/* Active status pulse indicator */}
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
          </div>

          {/* Business Logo */}
          {design.logoUrl && (
            <div className="pb-1 max-w-[130px]">
              <img
                src={design.logoUrl}
                alt={card.businessName}
                style={{ width: `${design.logoWidth || 100}px` }}
                className="max-h-12 object-contain"
              />
            </div>
          )}
        </div>

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

        {/* Catalog / Products & Services */}
        {design.showCatalog && card.catalog && card.catalog.length > 0 && (
          <div className="mb-5">
            <h2
              className="text-xs font-bold uppercase tracking-wider mb-2.5 opacity-70"
              style={{ fontFamily: headlineFontFamily }}
            >
              Catálogo & Servicios
            </h2>
            <div className="space-y-2.5">
              {card.catalog.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] items-center"
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
                    <p className="text-xs font-bold text-white truncate">{item.title}</p>
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
                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-white/10 hover:bg-white/20 text-white transition flex-shrink-0"
                    >
                      {item.ctaLabel || 'Ver'}
                    </a>
                  )}
                </div>
              ))}
            </div>
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

        {/* Social Networks Row */}
        {design.showSocials && (
          <div className="flex items-center justify-center gap-2 pt-2 pb-4 flex-wrap">
            {card.socials.instagram && (
              <a
                href={formatSocialUrl('instagram', card.socials.instagram)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                title="Instagram"
                className="w-10 h-10 rounded-full bg-white/[0.08] hover:bg-gradient-to-tr hover:from-amber-500 hover:to-pink-600 border border-white/[0.1] flex items-center justify-center text-white transition hover:scale-110 shadow-sm"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {card.socials.facebook && (
              <a
                href={formatSocialUrl('facebook', card.socials.facebook)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                title="Facebook"
                className="w-10 h-10 rounded-full bg-white/[0.08] hover:bg-blue-600 border border-white/[0.1] flex items-center justify-center text-white transition hover:scale-110 shadow-sm"
              >
                <Facebook className="w-4 h-4" />
              </a>
            )}
            {card.socials.youtube && (
              <a
                href={formatSocialUrl('youtube', card.socials.youtube)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Canal de YouTube"
                title="YouTube"
                className="w-10 h-10 rounded-full bg-white/[0.08] hover:bg-red-600 border border-white/[0.1] flex items-center justify-center text-white transition hover:scale-110 shadow-sm"
              >
                <Youtube className="w-4 h-4" />
              </a>
            )}
            {card.socials.twitter && (
              <a
                href={formatSocialUrl('twitter', card.socials.twitter)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                title="X (Twitter)"
                className="w-10 h-10 rounded-full bg-white/[0.08] hover:bg-black hover:border-slate-400 border border-white/[0.1] flex items-center justify-center text-white transition hover:scale-110 shadow-sm"
              >
                <XIcon className="w-4 h-4" />
              </a>
            )}
            {card.socials.tiktok && (
              <a
                href={formatSocialUrl('tiktok', card.socials.tiktok)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                title="TikTok"
                className="w-10 h-10 rounded-full bg-white/[0.08] hover:bg-black hover:border-pink-500 border border-white/[0.1] flex items-center justify-center text-white transition hover:scale-110 shadow-sm"
              >
                <span className="text-xs font-black">Tk</span>
              </a>
            )}
            {card.socials.linkedin && (
              <a
                href={formatSocialUrl('linkedin', card.socials.linkedin)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
                className="w-10 h-10 rounded-full bg-white/[0.08] hover:bg-sky-600 border border-white/[0.1] flex items-center justify-center text-white transition hover:scale-110 shadow-sm"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {card.socials.telegram && (
              <a
                href={formatSocialUrl('telegram', card.socials.telegram)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                title="Telegram"
                className="w-10 h-10 rounded-full bg-white/[0.08] hover:bg-sky-500 border border-white/[0.1] flex items-center justify-center text-white transition hover:scale-110 shadow-sm"
              >
                <Send className="w-4 h-4" />
              </a>
            )}
          </div>
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
