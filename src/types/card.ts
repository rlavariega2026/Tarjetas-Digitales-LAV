export interface CustomButton {
  id: string;
  label: string;
  url: string;
  icon?: string;
  style?: 'primary' | 'secondary' | 'accent' | 'outline' | 'glass';
}

export interface CatalogItem {
  id: string;
  title: string;
  description: string;
  price?: string;
  imageUrl?: string;
  badge?: string;
  ctaLabel?: string;
  ctaLink?: string;
  category?: string; // e.g. Entradas, Platos Fuertes, Bebidas, Postres
  isAvailable?: boolean;
}

export interface GalleryItem {
  id: string;
  title?: string;
  imageUrl: string;
  caption?: string;
}

export type CardTheme = 
  | 'dark-luxury' 
  | 'modern-clean' 
  | 'bold-gradient' 
  | 'minimalist' 
  | 'editorial' 
  | 'neon-tech' 
  | 'warm-organic'
  | 'elegance-luxury'
  | 'future-tech'
  | 'young-creative'
  | 'minimal-studio'
  | 'glass-motion'
  | 'business-signature'
  // 22 New Template Themes
  | 'cyber-chrome'
  | 'neon-grid'
  | 'digital-orbit'
  | 'holographic-future'
  | 'black-gold'
  | 'platinum-edition'
  | 'liquid-metal'
  | 'royal-velvet'
  | 'swiss-minimal'
  | 'editorial-cover'
  | 'architectural-lines'
  | 'monochrome-studio'
  | 'aurora-flow'
  | 'liquid-glass'
  | 'prismatic-light'
  | 'soft-gradient'
  | 'asymmetric-flow'
  | 'dynamic-layers'
  | 'bold-creative'
  | 'gastro-menu'
  | 'google-reviews-pro'
  | 'bank-transfer-direct';

export type FontHeadline = 'Outfit' | 'Inter' | 'Playfair Display' | 'Cinzel' | 'Space Grotesk' | 'Montserrat';
export type FontBody = 'Inter' | 'DM Sans' | 'Outfit';
export type ButtonStyle = 'solid' | 'glass' | 'outline' | 'gradient';
export type CardShape = 'rounded-3xl' | 'rounded-2xl' | 'rounded-xl' | 'rounded-none';
export type BackgroundPattern = 'none' | 'dots' | 'mesh' | 'geometric' | 'waves' | 'carbon';
export type AnimationStyle = 'none' | 'subtle-fade' | 'metallic-sheen' | 'tech-scan' | 'floating-glow' | 'liquid-flow' | 'glass-parallax';
export type TemplateCollection = 
  | 'elegance-luxury' 
  | 'future-tech' 
  | 'young-creative' 
  | 'minimal-studio' 
  | 'glass-motion' 
  | 'business-signature'
  | 'special-restaurant'
  | 'special-reviews'
  | 'special-banking'
  | 'new-22';

// 20 Photo Composition Variants
export type PhotoComposition =
  | 'top-large'           // 1. Fotografía principal grande en la parte superior
  | 'bottom-compact'      // 2. Fotografía principal en la parte inferior
  | 'left-photo'          // 3. Fotografía a la izquierda y datos a la derecha
  | 'right-photo'         // 4. Fotografía a la derecha y datos a la izquierda
  | 'circle-portrait'     // 5. Retrato circular centrado
  | 'panoramic'           // 6. Fotografía panorámica de ancho completo
  | 'card-bg'             // 7. Fotografía como fondo de la tarjeta con velo
  | 'elegant-frame'       // 8. Fotografía dentro de un marco elegante con filo metálico
  | 'rounded-squircle'    // 9. Fotografía con esquinas redondeadas
  | 'asymmetric'          // 10. Composición asimétrica moderna
  | 'multi-grid'          // 11. Varias fotografías en una cuadrícula
  | 'horizontal-slider'   // 12. Galería horizontal deslizable con snap
  | 'main-thumbnails'     // 13. Fotografía principal acompañada de miniaturas
  | 'editorial-spread'    // 14. Composición editorial con texto e imágenes alternados
  | 'overlapping-depth'   // 15. Fotografías superpuestas con profundidad visual
  | 'photo-cards'         // 16. Varias fotografías en tarjetas independientes
  | 'minimal-small'       // 17. Composición minimalista con una fotografía pequeña
  | 'vertical-large'      // 18. Fotografía vertical de gran tamaño
  | 'geometric-cut'       // 19. Fotografía recortada en formas geométricas (hexagonal/corte)
  | 'multi-zone';         // 20. Varias fotografías distribuidas en distintas zonas

// 12 Logo Modern Animations (+ none)
export type LogoAnimation =
  | 'none'                 // Desactivada
  | 'cinematic-entrance'   // Entrada cinematográfica
  | '3d-flip'              // Giro tridimensional
  | 'depth-float'          // Movimiento suave en profundidad
  | 'light-reflection'     // Reflejo de luz
  | 'shimmer-sweep'        // Barrido luminoso
  | 'sparkle-burst'        // Destellos y partículas
  | 'holographic-glitch'   // Efectos holográficos
  | 'pulse-glow'           // Pulso de iluminación
  | 'fade-scale'           // Aparición progresiva
  | 'orbital-drift'        // Movimiento orbital
  | 'metallic-shine'       // Efecto metálico
  | 'subtle-parallax';     // Parallax sutil

export interface GoogleReviewsConfig {
  enabled: boolean;
  url?: string;
  placeUrl?: string;
  title?: string;
  buttonText: string;
  badgeText?: string;
  rating?: number;
  reviewCount?: string;
  showGoogleLogo?: boolean;
}

export interface BankTransferConfig {
  enabled: boolean;
  bankName?: string;
  accountHolder?: string;
  clabe?: string;
  accountNumber?: string;
  cardNumber?: string;
  reference?: string;
  instructions?: string;
  title?: string;
}

export interface PayPalConfig {
  enabled: boolean;
  mode?: 'link' | 'sdk';
  paymentLink?: string;
  businessEmail?: string;
  clientId?: string;
  currency?: string;
  defaultAmount?: string;
  amount?: string;
  description?: string;
  buttonLabel?: string;
  buttonText?: string;
}

export interface CardDesign {
  theme: CardTheme;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  backgroundPattern: BackgroundPattern;
  fontHeadline: FontHeadline;
  fontBody: FontBody;
  cardShape: CardShape;
  buttonStyle: ButtonStyle;
  
  // Premium animation & collection
  animationStyle?: AnimationStyle;
  collection?: TemplateCollection;

  // Real Photo Composition Variant
  photoComposition?: PhotoComposition;
  
  // Media configuration
  avatarUrl?: string;
  avatarShape: 'circle' | 'square' | 'squircle';
  avatarBorder: boolean;
  avatarSize: 'sm' | 'md' | 'lg';
  
  // Business Logo Management & Advanced Animations
  logoUrl?: string;
  logoPosition: 'header' | 'above-avatar' | 'top-right' | 'card-top' | 'center-banner' | 'floating';
  logoWidth: number; // in pixels
  logoAnimation?: LogoAnimation;
  logoAnimationSpeed?: 'slow' | 'normal' | 'fast';
  
  bannerUrl?: string;
  coverHeight: 'sm' | 'md' | 'lg' | 'none';
  
  // Toggles
  showSaveContactButton: boolean;
  showQrCodeButton: boolean;
  showShareButton: boolean;
  showNfcButton: boolean;
  showCatalog: boolean;
  showGallery: boolean;
  showHours: boolean;
  showSocials: boolean;
  showCustomButtons: boolean;
  showMapButton: boolean;
  showVideo?: boolean;

  // Physical Card Front & Back for print
  physicalCard: {
    enabled: boolean;
    orientation: 'vertical' | 'horizontal';
    backBackgroundColor: string;
    backTextColor: string;
    showBackLogo: boolean;
    showBackQr: boolean;
    backSlogan: string;
    backWebsite: string;
    backPhone: string;
    showBleedGuides: boolean;
  };
}

export interface ContactClicksBreakdown {
  whatsapp: number;
  call: number;
  email: number;
  saveContact: number;
  map: number;
  total: number;
}


export type ListingKind = 'real-estate' | 'vehicle';

export interface ListingDetails {
  kind?: ListingKind;
  operation?: string;
  price?: string;
  currency?: string;
  propertyType?: string;
  areaM2?: string;
  builtAreaM2?: string;
  bedrooms?: string;
  bathrooms?: string;
  parkingSpaces?: string;
  landUse?: string;
  titleStatus?: string;
  make?: string;
  model?: string;
  version?: string;
  year?: string;
  mileage?: string;
  transmission?: string;
  fuel?: string;
  engine?: string;
  exteriorColor?: string;
  condition?: string;
  features?: string[];
  marketplaceUrl?: string;
  mercadoLibreUrl?: string;
  coverImageUrl?: string;
  showDetails?: boolean;
}

export interface CardData {
  id: string;
  slug: string;
  name: string;
  businessName: string;
  jobTitle: string;
  bio: string;
  category: string;
  clientId?: string;
  clientName?: string;
  status: 'published' | 'draft' | 'archived';
  viewsCount: number;
  contactClicks?: number;
  contactBreakdown?: ContactClicksBreakdown;
  createdAt: string;
  updatedAt: string;
  
  // Contact details
  phone: string;
  whatsapp: string;
  whatsappMessage: string;
  email: string;
  website: string;
  address: string;
  googleMapsUrl: string;
  businessHours: string;
  
  // Social networks
  socials: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    tiktok?: string;
    youtube?: string;
    twitter?: string;
    telegram?: string;
    spotify?: string;
  };
  
  // Dynamic lists
  customButtons: CustomButton[];
  catalog: CatalogItem[];
  gallery: GalleryItem[];
  
  // Embedded Video (YouTube/Vimeo)
  videoUrl?: string;
  videoTitle?: string;

  // Google Reviews Integration
  googleReviews?: GoogleReviewsConfig;

  // Bank Transfers Module (Copiar individual, Copiar todo, WhatsApp)
  bankTransfer?: BankTransferConfig;

  // Real PayPal Integration
  paypal?: PayPalConfig;

  // Optional real-estate / vehicle listing data
  listing?: ListingDetails;

  // Visual design
  design: CardDesign;
}
