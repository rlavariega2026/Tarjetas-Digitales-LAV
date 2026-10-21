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
  | 'business-signature';

export type FontHeadline = 'Outfit' | 'Inter' | 'Playfair Display' | 'Cinzel' | 'Space Grotesk' | 'Montserrat';
export type FontBody = 'Inter' | 'DM Sans' | 'Outfit';
export type ButtonStyle = 'solid' | 'glass' | 'outline' | 'gradient';
export type CardShape = 'rounded-3xl' | 'rounded-2xl' | 'rounded-xl' | 'rounded-none';
export type BackgroundPattern = 'none' | 'dots' | 'mesh' | 'geometric' | 'waves' | 'carbon';
export type AnimationStyle = 'none' | 'subtle-fade' | 'metallic-sheen' | 'tech-scan' | 'floating-glow' | 'liquid-flow' | 'glass-parallax';
export type TemplateCollection = 'elegance-luxury' | 'future-tech' | 'young-creative' | 'minimal-studio' | 'glass-motion' | 'business-signature';

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
  
  // Media configuration
  avatarUrl?: string;
  avatarShape: 'circle' | 'square' | 'squircle';
  avatarBorder: boolean;
  avatarSize: 'sm' | 'md' | 'lg';
  
  logoUrl?: string;
  logoPosition: 'header' | 'above-avatar' | 'top-right' | 'card-top';
  logoWidth: number; // in pixels
  
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
  };
  
  // Dynamic lists
  customButtons: CustomButton[];
  catalog: CatalogItem[];
  gallery: GalleryItem[];
  
  // Embedded Video (YouTube/Vimeo)
  videoUrl?: string;
  videoTitle?: string;

  // Visual design
  design: CardDesign;
}
