import type { CardTemplate } from './templates';
import type {
  CardData,
  CardTheme,
  PhotoComposition,
  FontHeadline,
  FontBody,
  AnimationStyle,
  TemplateCollection,
  BackgroundPattern,
} from '../types/card';

type ReferenceDesign = {
  id: string;
  name: string;
  description: string;
  theme: CardTheme;
  collection: TemplateCollection;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  finish: 'solid' | 'gradient' | 'metallic';
  pattern: BackgroundPattern;
  headline: FontHeadline;
  body: FontBody;
  shape: 'rounded-3xl' | 'rounded-2xl' | 'rounded-xl' | 'rounded-none';
  button: 'solid' | 'glass' | 'outline' | 'gradient';
  photo: PhotoComposition;
  animation: AnimationStyle;
  align: 'left' | 'center' | 'right';
  thumbnail: string;
};

const DESIGNS: ReferenceDesign[] = [
  { id: 'noir-gold', name: 'Executive Noir', description: 'Negro profundo, acentos oro y retrato enmarcado para una presencia ejecutiva de alto nivel.', theme: 'executive-black', collection: 'elegance-luxury', primary: '#d6ad60', secondary: '#8b6a35', accent: '#f5d78e', background: '#090909', text: '#fffaf0', finish: 'metallic', pattern: 'carbon', headline: 'Cinzel', body: 'Montserrat', shape: 'rounded-2xl', button: 'glass', photo: 'top-large', animation: 'metallic-sheen', align: 'center', thumbnail: 'from-zinc-950 via-neutral-900 to-amber-500' },
  { id: 'scarlet-edge', name: 'Scarlet Edge', description: 'Rojo intenso con bloques blancos y composición asimétrica de fuerte contraste.', theme: 'bold-creative', collection: 'young-creative', primary: '#ef233c', secondary: '#b5172b', accent: '#ffbe0b', background: '#180b12', text: '#fff7f7', finish: 'gradient', pattern: 'geometric', headline: 'Oswald', body: 'Inter', shape: 'rounded-xl', button: 'solid', photo: 'bottom-compact', animation: 'liquid-flow', align: 'left', thumbnail: 'from-red-700 via-rose-600 to-zinc-950' },
  { id: 'cobalt-pro', name: 'Cobalt Pro', description: 'Azul cobalto corporativo, líneas limpias y jerarquía profesional.', theme: 'corporate-executive', collection: 'business-signature', primary: '#2563eb', secondary: '#0e7490', accent: '#67e8f9', background: '#071a35', text: '#f8fbff', finish: 'gradient', pattern: 'grid', headline: 'Manrope', body: 'Inter', shape: 'rounded-2xl', button: 'solid', photo: 'left-photo', animation: 'subtle-fade', align: 'left', thumbnail: 'from-blue-950 via-blue-700 to-cyan-400' },
  { id: 'emerald-line', name: 'Emerald Line', description: 'Verde esmeralda, detalles claros y retrato vertical para perfiles de servicios.', theme: 'business-signature', collection: 'business-signature', primary: '#10b981', secondary: '#047857', accent: '#a7f3d0', background: '#06271f', text: '#ecfdf5', finish: 'gradient', pattern: 'waves', headline: 'DM Serif Display', body: 'DM Sans', shape: 'rounded-3xl', button: 'glass', photo: 'right-photo', animation: 'subtle-fade', align: 'center', thumbnail: 'from-emerald-950 via-emerald-700 to-teal-400' },
  { id: 'violet-glass', name: 'Violet Glass', description: 'Capas de cristal violeta, transparencias y halo luminoso alrededor del perfil.', theme: 'digital-glass', collection: 'glass-motion', primary: '#a78bfa', secondary: '#6d28d9', accent: '#e9d5ff', background: '#100b25', text: '#faf5ff', finish: 'gradient', pattern: 'mesh', headline: 'Plus Jakarta Sans', body: 'Inter', shape: 'rounded-3xl', button: 'glass', photo: 'circle-portrait', animation: 'glass-parallax', align: 'center', thumbnail: 'from-violet-950 via-purple-800 to-fuchsia-500' },
  { id: 'neon-cyan', name: 'Neon Cyan', description: 'Fondo negro, acentos cian eléctricos y estética tecnológica de alto impacto.', theme: 'neon-grid', collection: 'future-tech', primary: '#22d3ee', secondary: '#0891b2', accent: '#67e8f9', background: '#020b12', text: '#ecfeff', finish: 'solid', pattern: 'grid', headline: 'Space Grotesk', body: 'DM Sans', shape: 'rounded-2xl', button: 'outline', photo: 'panoramic', animation: 'tech-scan', align: 'center', thumbnail: 'from-slate-950 via-cyan-950 to-cyan-400' },
  { id: 'aurora-flow', name: 'Aurora Flow', description: 'Degradado turquesa y violeta con formas fluidas y sensación luminosa.', theme: 'aurora-flow', collection: 'glass-motion', primary: '#2dd4bf', secondary: '#7c3aed', accent: '#c4b5fd', background: '#10152b', text: '#f8fafc', finish: 'gradient', pattern: 'mesh', headline: 'Outfit', body: 'Nunito Sans', shape: 'rounded-3xl', button: 'gradient', photo: 'card-bg', animation: 'floating-glow', align: 'center', thumbnail: 'from-teal-500 via-indigo-700 to-violet-950' },
  { id: 'pure-paper', name: 'Pure Paper', description: 'Blanco editorial, tipografía negra y acentos discretos para una imagen limpia.', theme: 'pure-white', collection: 'minimal-studio', primary: '#111827', secondary: '#475569', accent: '#2563eb', background: '#f8fafc', text: '#111827', finish: 'solid', pattern: 'none', headline: 'Libre Baskerville', body: 'Inter', shape: 'rounded-xl', button: 'outline', photo: 'elegant-frame', animation: 'subtle-fade', align: 'left', thumbnail: 'from-white via-slate-100 to-blue-100' },
  { id: 'beige-editorial', name: 'Beige Editorial', description: 'Tonos arena, composición de revista y fotografía protagonista con elegancia cálida.', theme: 'soft-beige', collection: 'minimal-studio', primary: '#8b5e3c', secondary: '#c19a6b', accent: '#d97706', background: '#f2e8d8', text: '#29231d', finish: 'solid', pattern: 'waves', headline: 'Cormorant Garamond', body: 'Lora', shape: 'rounded-2xl', button: 'solid', photo: 'rounded-squircle', animation: 'subtle-fade', align: 'left', thumbnail: 'from-amber-100 via-stone-200 to-orange-200' },
  { id: 'swiss-grid', name: 'Swiss Grid', description: 'Retícula geométrica, blanco y negro y distribución precisa de información.', theme: 'swiss-minimal', collection: 'minimal-studio', primary: '#111827', secondary: '#64748b', accent: '#e11d48', background: '#f1f5f9', text: '#0f172a', finish: 'solid', pattern: 'grid', headline: 'Archivo', body: 'Inter', shape: 'rounded-none', button: 'outline', photo: 'asymmetric', animation: 'subtle-fade', align: 'left', thumbnail: 'from-slate-100 via-white to-slate-300' },
  { id: 'magazine-portrait', name: 'Magazine Portrait', description: 'Portada editorial con retrato grande, tipografía protagonista y bloques superpuestos.', theme: 'editorial-cover', collection: 'young-creative', primary: '#f97316', secondary: '#be123c', accent: '#facc15', background: '#211018', text: '#fff7ed', finish: 'gradient', pattern: 'none', headline: 'Bebas Neue', body: 'Montserrat', shape: 'rounded-xl', button: 'solid', photo: 'multi-grid', animation: 'liquid-flow', align: 'left', thumbnail: 'from-orange-500 via-rose-700 to-zinc-950' },
  { id: 'pop-spectrum', name: 'Pop Spectrum', description: 'Colores vivos, acentos contrastantes y retrato enmarcado con una composición divertida.', theme: 'pop-creative', collection: 'young-creative', primary: '#ec4899', secondary: '#7c3aed', accent: '#facc15', background: '#21103c', text: '#fff7ff', finish: 'gradient', pattern: 'geometric', headline: 'Poppins', body: 'Nunito', shape: 'rounded-3xl', button: 'gradient', photo: 'horizontal-slider', animation: 'liquid-flow', align: 'center', thumbnail: 'from-pink-500 via-violet-700 to-yellow-400' },
  { id: 'urban-gradient', name: 'Urban Gradient', description: 'Degradado azul y magenta con formas diagonales y perfil de estilo contemporáneo.', theme: 'urban-gradient', collection: 'young-creative', primary: '#3b82f6', secondary: '#db2777', accent: '#f0abfc', background: '#111827', text: '#ffffff', finish: 'gradient', pattern: 'geometric', headline: 'Urbanist', body: 'Manrope', shape: 'rounded-2xl', button: 'gradient', photo: 'main-thumbnails', animation: 'liquid-flow', align: 'left', thumbnail: 'from-blue-600 via-violet-700 to-pink-500' },
  { id: 'champagne-luxe', name: 'Champagne Luxe', description: 'Champagne y oro satinado con detalles metálicos y retrato circular.', theme: 'champagne-gold', collection: 'elegance-luxury', primary: '#c49a52', secondary: '#8b6b35', accent: '#f3d9a4', background: '#21190e', text: '#fff8e8', finish: 'metallic', pattern: 'none', headline: 'Playfair Display', body: 'Montserrat', shape: 'rounded-2xl', button: 'glass', photo: 'editorial-spread', animation: 'metallic-sheen', align: 'center', thumbnail: 'from-amber-950 via-yellow-700 to-amber-200' },
  { id: 'platinum-silver', name: 'Platinum Silver', description: 'Plata fría, grises pulidos y estética de metal cepillado para una tarjeta premium.', theme: 'platinum-edition', collection: 'elegance-luxury', primary: '#cbd5e1', secondary: '#64748b', accent: '#f8fafc', background: '#111827', text: '#f8fafc', finish: 'metallic', pattern: 'carbon', headline: 'Montserrat', body: 'Inter', shape: 'rounded-2xl', button: 'outline', photo: 'overlapping-depth', animation: 'metallic-sheen', align: 'left', thumbnail: 'from-slate-950 via-slate-600 to-slate-200' },
  { id: 'royal-navy', name: 'Royal Navy', description: 'Azul marino profundo, acentos dorados y jerarquía clásica para dirección y consultoría.', theme: 'royal-navy', collection: 'elegance-luxury', primary: '#d4af37', secondary: '#1e3a5f', accent: '#93c5fd', background: '#071426', text: '#f8fafc', finish: 'metallic', pattern: 'waves', headline: 'Cinzel', body: 'Lato', shape: 'rounded-2xl', button: 'glass', photo: 'photo-cards', animation: 'metallic-sheen', align: 'left', thumbnail: 'from-slate-950 via-blue-950 to-amber-500' },
  { id: 'frosted-crystal', name: 'Frosted Crystal', description: 'Cristal esmerilado, superficies translúcidas y acentos fríos de apariencia ligera.', theme: 'frosted-depth', collection: 'glass-motion', primary: '#7dd3fc', secondary: '#818cf8', accent: '#e0f2fe', background: '#10253b', text: '#f0f9ff', finish: 'gradient', pattern: 'mesh', headline: 'Plus Jakarta Sans', body: 'Inter', shape: 'rounded-3xl', button: 'glass', photo: 'minimal-small', animation: 'glass-parallax', align: 'center', thumbnail: 'from-sky-100 via-blue-300 to-indigo-700' },
  { id: 'holographic-prism', name: 'Holographic Prism', description: 'Reflejos iridiscentes, capas prismáticas y acentos de color en movimiento.', theme: 'holographic-future', collection: 'future-tech', primary: '#67e8f9', secondary: '#c084fc', accent: '#f9a8d4', background: '#100d22', text: '#ffffff', finish: 'gradient', pattern: 'geometric', headline: 'Space Grotesk', body: 'DM Sans', shape: 'rounded-3xl', button: 'glass', photo: 'vertical-large', animation: 'floating-glow', align: 'center', thumbnail: 'from-cyan-400 via-fuchsia-500 to-violet-900' },
  { id: 'earth-organic', name: 'Earth Organic', description: 'Verdes botánicos y tonos tierra con fotografía amplia y sensación natural.', theme: 'warm-organic', collection: 'minimal-studio', primary: '#476b4d', secondary: '#a3a380', accent: '#d6a96c', background: '#17251c', text: '#f5f5e9', finish: 'solid', pattern: 'waves', headline: 'Lora', body: 'Nunito Sans', shape: 'rounded-3xl', button: 'solid', photo: 'geometric-cut', animation: 'subtle-fade', align: 'left', thumbnail: 'from-green-950 via-emerald-800 to-amber-300' },
  { id: 'magenta-pulse', name: 'Magenta Pulse', description: 'Negro y magenta neón con botones luminosos y estética digital atrevida.', theme: 'neon-purple', collection: 'future-tech', primary: '#e879f9', secondary: '#9333ea', accent: '#22d3ee', background: '#10051b', text: '#fdf4ff', finish: 'solid', pattern: 'grid', headline: 'Space Grotesk', body: 'Manrope', shape: 'rounded-2xl', button: 'gradient', photo: 'multi-zone', animation: 'tech-scan', align: 'center', thumbnail: 'from-fuchsia-950 via-purple-800 to-cyan-400' },
];

const createTemplate = (preset: ReferenceDesign, index: number): CardTemplate => {
  const id = `ref-${preset.id}`;
  const now = '2026-11-02T00:00:00.000Z';
  const cardData: CardData = {
    id: `card-${id}`,
    slug: `tarjeta-${preset.id}`,
    name: 'Tu Nombre Profesional',
    businessName: 'Tu Empresa o Marca',
    jobTitle: 'Profesional / Especialista',
    bio: 'Presenta aquí tu experiencia, servicios y propuesta de valor.',
    category: 'Diseños premium',
    status: 'draft',
    viewsCount: 0,
    createdAt: now,
    updatedAt: now,
    phone: '+52 55 0000 0000',
    whatsapp: '+52 55 0000 0000',
    whatsappMessage: 'Hola, vi tu tarjeta digital y me gustaría conocer tus servicios.',
    email: 'contacto@tuempresa.com',
    website: 'https://tuempresa.com',
    address: '',
    googleMapsUrl: '',
    businessHours: 'Lun - Vie: 9:00 AM - 6:00 PM',
    socials: { instagram: 'tuempresa', facebook: 'tuempresa', linkedin: 'tuempresa' },
    customButtons: [{ id: 'btn-contact', label: 'Contactar ahora', url: 'https://wa.me/525500000000', style: 'primary' }],
    catalog: [],
    gallery: [],
    design: {
      theme: preset.theme,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
      backgroundColor: preset.background,
      textColor: preset.text,
      backgroundFinish: preset.finish,
      backgroundPattern: preset.pattern,
      fontHeadline: preset.headline,
      fontBody: preset.body,
      cardShape: preset.shape,
      buttonStyle: preset.button,
      animationStyle: preset.animation,
      collection: preset.collection,
      photoComposition: preset.photo,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500',
      avatarShape: (['square','squircle','circle'] as const)[index % 3],
      avatarBorder: true,
      avatarSize: (['sm','md','lg'] as const)[index % 3],
      logoPosition: (['header','top-right','above-avatar','card-top','center-banner','floating'] as const)[index % 6],
      logoWidth: 110,
      bannerUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1000',
      coverHeight: 'md',
      showSaveContactButton: true,
      showQrCodeButton: true,
      showShareButton: true,
      showNfcButton: true,
      showCatalog: false,
      showGallery: false,
      showHours: true,
      showSocials: true,
      showCustomButtons: true,
      showMapButton: true,
      showVideo: false,
      infoTextAlign: preset.align,
      businessNameColor: preset.accent,
      physicalCard: {
        enabled: true,
        orientation: 'horizontal',
        backBackgroundColor: preset.background,
        backTextColor: preset.text,
        showBackLogo: true,
        showBackQr: true,
        backSlogan: 'Tu presencia profesional, con una imagen que destaca.',
        backWebsite: 'lavdigitalmkt.com',
        backPhone: '+52 55 0000 0000',
        showBleedGuides: true,
      },
    },
  };

  return {
    id,
    name: preset.name,
    category: 'Diseños de referencia',
    description: preset.description,
    thumbnailGradient: preset.thumbnail,
    collection: preset.collection,
    badge: 'Nuevo diseño',
    animationPreview: 'Composición visual basada en las referencias del catálogo LAV',
    cardData,
  };
};

export const REFERENCE_INSPIRED_TEMPLATES: CardTemplate[] = DESIGNS.map(createTemplate);
