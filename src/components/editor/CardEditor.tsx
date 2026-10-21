import React, { useState } from 'react';
import {
  CardData,
  CardTheme,
  AnimationStyle,
  FontHeadline,
  FontBody,
  ButtonStyle,
  CardShape,
  BackgroundPattern,
  CustomButton,
  CatalogItem,
  GalleryItem,
} from '../../types/card';
import { DigitalCardView, getEmbedVideoUrl, formatSocialUrl } from '../card/DigitalCardView';
import { HostingerExportModal } from '../card/HostingerExportModal';
import { downloadStandaloneHtmlFile } from '../../utils/exportHtml';
import { downloadQr } from '../../utils/qr';
import { saveOrUpdateCard, getStoredClients } from '../../utils/storage';
import { optimizeImageFile } from '../../utils/imageOptimizer';
import {
  Smartphone,
  Tablet,
  Monitor,
  RotateCw,
  Palette,
  User,
  Image as ImageIcon,
  Link as LinkIcon,
  ShoppingBag,
  Sparkles,
  Save,
  Globe,
  Share2,
  Download,
  CreditCard,
  Plus,
  Trash2,
  Check,
  Wand2,
  Layers,
  ArrowLeft,
  Eye,
  Sliders,
  Youtube,
  Video,
  Play,
  ExternalLink,
  Send,
  Camera,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const XIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface CardEditorProps {
  initialCard: CardData;
  onSave: (savedCard: CardData) => void;
  onBack: () => void;
  onPreviewStandalone: (card: CardData) => void;
}

export const CardEditor: React.FC<CardEditorProps> = ({
  initialCard,
  onSave,
  onBack,
  onPreviewStandalone,
}) => {
  const [card, setCard] = useState<CardData>(initialCard);
  const [activeTab, setActiveTab] = useState<
    'info' | 'socials' | 'design' | 'media' | 'buttons' | 'catalog' | 'gallery' | 'physical' | 'ai'
  >('info');
  const [viewportMode, setViewportMode] = useState<'mobile' | 'tablet' | 'desktop' | 'physical'>('mobile');
  const [activeFace, setActiveFace] = useState<'front' | 'back'>('front');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiPromptCategory, setAiPromptCategory] = useState(card.category || '');
  const [clients] = useState(getStoredClients());
  const [showHostingerModal, setShowHostingerModal] = useState(false);
  const [mobileMode, setMobileMode] = useState<'editor' | 'preview'>('editor');

  // Deep update helper
  const updateCardField = <K extends keyof CardData>(field: K, value: CardData[K]) => {
    setCard((prev) => ({ ...prev, [field]: value }));
  };

  const updateDesignField = <K extends keyof CardData['design']>(field: K, value: CardData['design'][K]) => {
    setCard((prev) => ({
      ...prev,
      design: { ...prev.design, [field]: value },
    }));
  };

  const updatePhysicalField = <K extends keyof CardData['design']['physicalCard']>(
    field: K,
    value: CardData['design']['physicalCard'][K]
  ) => {
    setCard((prev) => ({
      ...prev,
      design: {
        ...prev.design,
        physicalCard: {
          ...prev.design.physicalCard,
          [field]: value,
        },
      },
    }));
  };

  // Image upload handling with automatic compression, transparency and aspect ratio preservation
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'avatar' | 'logo' | 'banner'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setAiError('La imagen supera los 8 MB. Por favor elige una imagen más ligera.');
      return;
    }

    try {
      const maxDim = target === 'avatar' ? 400 : target === 'logo' ? 500 : 1000;
      const optimizedDataUrl = await optimizeImageFile(file, maxDim, maxDim, 0.88);

      if (target === 'avatar') updateDesignField('avatarUrl', optimizedDataUrl);
      if (target === 'logo') updateDesignField('logoUrl', optimizedDataUrl);
      if (target === 'banner') updateDesignField('bannerUrl', optimizedDataUrl);
    } catch (err) {
      console.error('Error optimizing image:', err);
    }
  };

  // Save Card
  const handleSave = () => {
    setIsSaving(true);
    saveOrUpdateCard(card);
    onSave(card);
    setIsSaving(false);
    setSaveSuccess(true);
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Add Custom Button
  const handleAddButton = () => {
    const newBtn: CustomButton = {
      id: `btn-${Date.now()}`,
      label: 'Nuevo Enlace o Botón',
      url: 'https://',
      style: 'primary',
    };
    setCard((prev) => ({
      ...prev,
      customButtons: [...(prev.customButtons || []), newBtn],
    }));
  };

  const handleUpdateButton = (id: string, field: keyof CustomButton, val: string) => {
    setCard((prev) => ({
      ...prev,
      customButtons: prev.customButtons.map((b) => (b.id === id ? { ...b, [field]: val } : b)),
    }));
  };

  const handleDeleteButton = (id: string) => {
    setCard((prev) => ({
      ...prev,
      customButtons: prev.customButtons.filter((b) => b.id !== id),
    }));
  };

  // Add Catalog Item
  const handleAddCatalogItem = () => {
    const newItem: CatalogItem = {
      id: `cat-${Date.now()}`,
      title: 'Producto o Servicio',
      description: 'Breve descripción de las características principales.',
      price: '$500 MXN',
      ctaLabel: 'Consultar',
      ctaLink: card.whatsapp ? `https://wa.me/${card.whatsapp.replace(/\D/g, '')}` : '',
    };
    setCard((prev) => ({
      ...prev,
      catalog: [...(prev.catalog || []), newItem],
    }));
  };

  const handleUpdateCatalogItem = (id: string, field: keyof CatalogItem, val: string) => {
    setCard((prev) => ({
      ...prev,
      catalog: prev.catalog.map((c) => (c.id === id ? { ...c, [field]: val } : c)),
    }));
  };

  const handleDeleteCatalogItem = (id: string) => {
    setCard((prev) => ({
      ...prev,
      catalog: prev.catalog.filter((c) => c.id !== id),
    }));
  };

  // Add Gallery Item
  const handleAddGalleryItem = () => {
    const newItem: GalleryItem = {
      id: `gal-${Date.now()}`,
      title: 'Fotografía o Trabajo',
      imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600',
      caption: '',
    };
    setCard((prev) => ({
      ...prev,
      gallery: [...(prev.gallery || []), newItem],
    }));
  };

  const handleUpdateGalleryItem = (id: string, field: keyof GalleryItem, val: string) => {
    setCard((prev) => ({
      ...prev,
      gallery: (prev.gallery || []).map((g) => (g.id === id ? { ...g, [field]: val } : g)),
    }));
  };

  const handleDeleteGalleryItem = (id: string) => {
    setCard((prev) => ({
      ...prev,
      gallery: (prev.gallery || []).filter((g) => g.id !== id),
    }));
  };

  // AI Design Suggestion via server-side Gemini API
  const handleAiSuggest = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const response = await fetch('/api/ai/suggest-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: aiPromptCategory || card.category,
          businessName: card.businessName,
          profession: card.jobTitle,
        }),
      });
      const data = await response.json();
      if (data.suggestion) {
        const s = data.suggestion;
        setCard((prev) => ({
          ...prev,
          bio: s.bio || prev.bio,
          design: {
            ...prev.design,
            primaryColor: s.primaryColor || prev.design.primaryColor,
            secondaryColor: s.secondaryColor || prev.design.secondaryColor,
            accentColor: s.accentColor || prev.design.accentColor,
            backgroundColor: s.backgroundColor || prev.design.backgroundColor,
            fontHeadline: (s.fontHeadline as FontHeadline) || prev.design.fontHeadline,
            fontBody: (s.fontBody as FontBody) || prev.design.fontBody,
            buttonStyle: (s.buttonStyle as ButtonStyle) || prev.design.buttonStyle,
            theme: (s.cardTheme as CardTheme) || prev.design.theme,
            physicalCard: {
              ...prev.design.physicalCard,
              backSlogan: s.slogan || prev.design.physicalCard.backSlogan,
            },
          },
        }));
        confetti({ particleCount: 50, spread: 80, origin: { y: 0.6 } });
      }
    } catch (err: any) {
      console.error(err);
      setAiError('No se pudo conectar con el asistente de IA. Intenta de nuevo.');
    } finally {
      setAiLoading(false);
    }
  };

  // AI Copywriting enhance
  const handleAiEnhanceText = async (type: 'bio' | 'slogan') => {
    setAiLoading(true);
    try {
      const textToEnhance = type === 'bio' ? card.bio : card.design.physicalCard.backSlogan;
      const response = await fetch('/api/ai/enhance-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToEnhance,
          type,
          businessName: card.businessName,
          category: card.category,
        }),
      });
      const data = await response.json();
      if (data.enhancedText) {
        if (type === 'bio') updateCardField('bio', data.enhancedText);
        if (type === 'slogan') updatePhysicalField('backSlogan', data.enhancedText);
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  // Pre-built color palettes
  const colorPalettes = [
    { name: 'Executive Gold', primary: '#f59e0b', secondary: '#b45309', accent: '#fbbf24', bg: '#09090b' },
    { name: 'Royal Navy Luxury', primary: '#3b82f6', secondary: '#1e3a8a', accent: '#f59e0b', bg: '#030712' },
    { name: 'Cyber Blue (Tech)', primary: '#06b6d4', secondary: '#2563eb', accent: '#22d3ee', bg: '#030712' },
    { name: 'Neon Purple (Tech)', primary: '#a855f7', secondary: '#ec4899', accent: '#c084fc', bg: '#0a0518' },
    { name: 'Urban Sunset (Creative)', primary: '#f97316', secondary: '#ec4899', accent: '#fbbf24', bg: '#0f0914' },
    { name: 'Aurora Glass', primary: '#38bdf8', secondary: '#818cf8', accent: '#f472b6', bg: '#070b19' },
    { name: 'Corporate Blue (Signature)', primary: '#2563eb', secondary: '#1d4ed8', accent: '#60a5fa', bg: '#090d16' },
    { name: 'Soft Beige Studio', primary: '#44403c', secondary: '#78716c', accent: '#d97706', bg: '#fdfbf7', text: '#1c1917' },
    { name: 'Minimalista Blanco', primary: '#18181b', secondary: '#3f3f46', accent: '#2563eb', bg: '#ffffff', text: '#09090b' },
    { name: 'Carmesí Gourmet', primary: '#e11d48', secondary: '#be123c', accent: '#fb7185', bg: '#18181b' },
  ];

  return (
    <div className="flex flex-col h-screen h-[100dvh] bg-slate-950 text-slate-100 overflow-hidden">
      {/* Editor Top Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between z-30 flex-shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex-shrink-0"
            title="Volver a mis diseños"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-bold text-xs sm:text-sm text-white truncate max-w-[110px] sm:max-w-[220px]">
                {card.name || 'Nueva Tarjeta'}
              </span>
              <span
                className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0 ${
                  card.status === 'published'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {card.status === 'published' ? 'Publicada' : 'Borrador'}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 hidden md:block truncate">
              Slug: /c/{card.slug} &bull; {card.businessName || 'Sin empresa'}
            </p>
          </div>
        </div>

        {/* Mobile View Switcher (Editor / Previa) on smaller screens */}
        <div className="flex md:hidden bg-slate-800/90 p-0.5 rounded-xl border border-slate-700/60 flex-shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setMobileMode('editor')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              mobileMode === 'editor'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => setMobileMode('preview')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              mobileMode === 'preview'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Previa
          </button>
        </div>

        {/* Action Buttons: Guardar button is always prioritized and never pushed out */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Quick status toggle */}
          <button
            onClick={() => updateCardField('status', card.status === 'published' ? 'draft' : 'published')}
            className={`hidden sm:inline-flex px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              card.status === 'published'
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {card.status === 'published' ? 'Despublicar' : 'Publicar'}
          </button>

          {/* Standalone HTML export for lavdigitalmkt.com */}
          <button
            onClick={() => setShowHostingerModal(true)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition"
            title="Publicar en Hostinger (lavdigitalmkt.com)"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>Publicar en Hostinger</span>
          </button>

          {/* QR code download */}
          <button
            onClick={() =>
              downloadQr(`${window.location.origin}/#card=${card.slug}`, card.slug, 'png', {
                colorDark: card.design.primaryColor,
              })
            }
            className="hidden sm:inline-flex p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Descargar Código QR PNG"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Fullscreen Preview */}
          <button
            onClick={() => onPreviewStandalone(card)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Ver pantalla completa"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Primary Top Save Button - Always prominent, non-shrinkable */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex-shrink-0 active:scale-95 cursor-pointer ring-1 ring-white/20"
            title="Guardar cambios de la tarjeta"
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                <span>¡Guardado!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Guardar</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Studio Body: Left Controls + Right Live Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT TOOLBOX */}
        <aside className={`w-full md:w-[460px] lg:w-[480px] bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 z-10 ${mobileMode === 'editor' ? 'flex' : 'hidden md:flex'}`}>
          {/* Tabs Navigation */}
          <div className="flex items-center border-b border-slate-800 bg-slate-950/50 overflow-x-auto no-scrollbar px-2 py-1.5 gap-1">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'info'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Info</span>
            </button>
            <button
              onClick={() => setActiveTab('socials')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'socials'
                  ? 'bg-gradient-to-r from-red-600 to-indigo-600 text-white shadow-sm'
                  : 'text-indigo-300 hover:text-white hover:bg-indigo-950/40 bg-indigo-950/20 border border-indigo-500/20'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Redes & Video</span>
            </button>
            <button
              onClick={() => setActiveTab('design')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'design'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Diseño</span>
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'media'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Logos & Fotos</span>
            </button>
            <button
              onClick={() => setActiveTab('buttons')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'buttons'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Botones</span>
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'catalog'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Catálogo</span>
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'gallery'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Galería</span>
            </button>
            <button
              onClick={() => setActiveTab('physical')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'physical'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Física / Impresión</span>
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'ai'
                  ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-sm'
                  : 'text-pink-400 hover:text-pink-300 hover:bg-pink-950/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-300 animate-pulse" />
              <span>LAV AI</span>
            </button>
          </div>

          {/* Tab Content Panel (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
            {/* TAB: INFO */}
            {activeTab === 'info' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                    Información Personal & Profesional
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Nombre Completo *</label>
                      <input
                        type="text"
                        value={card.name}
                        onChange={(e) => updateCardField('name', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="Ej. Dr. Roberto Mendoza"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Empresa / Negocio</label>
                        <input
                          type="text"
                          value={card.businessName}
                          onChange={(e) => updateCardField('businessName', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          placeholder="Ej. Clínica Dental Sonrisas"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Giro / Categoría</label>
                        <input
                          type="text"
                          value={card.category}
                          onChange={(e) => updateCardField('category', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          placeholder="Ej. Salud y Odontología"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Cargo o Profesión</label>
                      <input
                        type="text"
                        value={card.jobTitle}
                        onChange={(e) => updateCardField('jobTitle', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="Ej. Cirujano Dentista & Especialista"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-slate-400">Descripción Breve / Bio</label>
                        <button
                          onClick={() => handleAiEnhanceText('bio')}
                          disabled={aiLoading}
                          className="text-[10px] text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-1"
                        >
                          <Wand2 className="w-3 h-3" /> Mejorar con IA
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={card.bio}
                        onChange={(e) => updateCardField('bio', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="Describe los servicios clave o propuesta de valor que te distingue."
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                    Canales de Contacto Directo
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Teléfono Móvil</label>
                        <input
                          type="text"
                          value={card.phone}
                          onChange={(e) => updateCardField('phone', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          placeholder="+52 55 1234 5678"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">WhatsApp</label>
                        <input
                          type="text"
                          value={card.whatsapp}
                          onChange={(e) => updateCardField('whatsapp', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          placeholder="+52 55 1234 5678"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Mensaje Inicial de WhatsApp</label>
                      <input
                        type="text"
                        value={card.whatsappMessage}
                        onChange={(e) => updateCardField('whatsappMessage', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="Hola, vi tu tarjeta digital y me gustaría agendar una cita."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Correo Electrónico</label>
                        <input
                          type="email"
                          value={card.email}
                          onChange={(e) => updateCardField('email', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          placeholder="contacto@empresa.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Sitio Web</label>
                        <input
                          type="url"
                          value={card.website}
                          onChange={(e) => updateCardField('website', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          placeholder="https://empresa.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Dirección Física</label>
                      <input
                        type="text"
                        value={card.address}
                        onChange={(e) => updateCardField('address', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="Av. Principal 123, Col. Centro"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Enlace de Google Maps</label>
                      <input
                        type="url"
                        value={card.googleMapsUrl}
                        onChange={(e) => updateCardField('googleMapsUrl', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="https://maps.app.goo.gl/..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Horarios de Atención</label>
                      <input
                        type="text"
                        value={card.businessHours}
                        onChange={(e) => updateCardField('businessHours', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="Lun - Vie: 9:00 AM - 7:00 PM | Sáb: 10:00 AM - 2:00 PM"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Media & Video Highlighted Section */}
                <div className="border-t border-slate-800 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Redes Sociales & Enlaces</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Espacios directos para tus enlaces de YouTube, 𝕏, Instagram y más.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('socials')}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-200 hover:text-white text-[11px] font-bold transition flex items-center gap-1"
                    >
                      <span>Panel Completo</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  {/* YouTube Social Link Card */}
                  <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/25 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-red-600 flex items-center justify-center text-white">
                          <Youtube className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-white">Canal de YouTube (Icono en Tarjeta)</span>
                      </div>
                      {card.socials.youtube && (
                        <button
                          onClick={() => setCard((prev) => ({ ...prev, socials: { ...prev.socials, youtube: '' } }))}
                          className="text-[10px] text-rose-400 hover:underline"
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={card.socials.youtube || ''}
                      onChange={(e) =>
                        setCard((prev) => ({
                          ...prev,
                          socials: { ...prev.socials, youtube: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                      placeholder="https://youtube.com/@micanal o @micanal"
                    />
                    {card.socials.youtube && (
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                        <span className="truncate max-w-[280px]">
                          Enlace resultante: <strong className="text-red-400">{formatSocialUrl('youtube', card.socials.youtube)}</strong>
                        </span>
                        <a
                          href={formatSocialUrl('youtube', card.socials.youtube)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-red-400 hover:underline flex items-center gap-0.5 flex-shrink-0"
                        >
                          <span>Probar</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* X / Twitter Link Card */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-black border border-slate-700 flex items-center justify-center text-white">
                          <XIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-white">X / Twitter (@usuario o enlace)</span>
                      </div>
                      {card.socials.twitter && (
                        <button
                          onClick={() => setCard((prev) => ({ ...prev, socials: { ...prev.socials, twitter: '' } }))}
                          className="text-[10px] text-rose-400 hover:underline"
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={card.socials.twitter || ''}
                      onChange={(e) =>
                        setCard((prev) => ({
                          ...prev,
                          socials: { ...prev.socials, twitter: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="https://x.com/micuenta o @micuenta"
                    />
                    {card.socials.twitter && (
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                        <span className="truncate max-w-[280px]">
                          Enlace resultante: <strong className="text-sky-400">{formatSocialUrl('twitter', card.socials.twitter)}</strong>
                        </span>
                        <a
                          href={formatSocialUrl('twitter', card.socials.twitter)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-400 hover:underline flex items-center gap-0.5 flex-shrink-0"
                        >
                          <span>Probar</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Other Social Networks 2-column grid */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Instagram (@usuario)</label>
                      <input
                        type="text"
                        value={card.socials.instagram || ''}
                        onChange={(e) =>
                          setCard((prev) => ({
                            ...prev,
                            socials: { ...prev.socials, instagram: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="@mi_empresa"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Facebook</label>
                      <input
                        type="text"
                        value={card.socials.facebook || ''}
                        onChange={(e) =>
                          setCard((prev) => ({
                            ...prev,
                            socials: { ...prev.socials, facebook: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="miempresaoficial"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">TikTok (@usuario)</label>
                      <input
                        type="text"
                        value={card.socials.tiktok || ''}
                        onChange={(e) =>
                          setCard((prev) => ({
                            ...prev,
                            socials: { ...prev.socials, tiktok: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="@mi_tiktok"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">LinkedIn</label>
                      <input
                        type="text"
                        value={card.socials.linkedin || ''}
                        onChange={(e) =>
                          setCard((prev) => ({
                            ...prev,
                            socials: { ...prev.socials, linkedin: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="nombre-profesional"
                      />
                    </div>
                  </div>
                </div>

                {/* Embedded Video Section (YouTube/Shorts/Vimeo) */}
                <div className="border-t border-slate-800 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                        <Video className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                          Video de YouTube Embebido (Reproductor en Tarjeta)
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Se reproduce directamente dentro de la tarjeta digital.
                        </p>
                      </div>
                    </div>
                    {card.videoUrl && (
                      <button
                        onClick={() => updateCardField('videoUrl', '')}
                        className="text-[10px] text-rose-400 hover:underline"
                      >
                        Quitar video
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Enlace del Video de YouTube</label>
                    <input
                      type="url"
                      value={card.videoUrl || ''}
                      onChange={(e) => updateCardField('videoUrl', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                      placeholder="https://www.youtube.com/watch?v=... o https://youtu.be/... o Shorts"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Acepta enlaces regulares de YouTube, enlaces cortos youtu.be y videos de YouTube Shorts.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Título del Video (Opcional)</label>
                    <input
                      type="text"
                      value={card.videoTitle || ''}
                      onChange={(e) => updateCardField('videoTitle', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                      placeholder="Ej. Conoce nuestra empresa en 1 minuto"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: REDES SOCIALES & VIDEO MULTIMEDIA */}
            {activeTab === 'socials' && (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-red-600 to-indigo-600 flex items-center justify-center text-white">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Redes Sociales & Video Multimedia</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Administra fácilmente tus canales públicos de contacto, redes sociales (YouTube, 𝕏, Instagram, TikTok) y tu reproductor de video de YouTube.
                  </p>
                </div>

                {/* Show Socials Toggle */}
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-200">Barra de Iconos de Redes Sociales</p>
                    <p className="text-[11px] text-slate-400">Muestra los botones circulares en la tarjeta</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={card.design.showSocials}
                      onChange={(e) => updateDesignField('showSocials', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {/* YOUTUBE DEDICATED SECTION */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-red-950/30 to-slate-900 border border-red-500/30 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-red-500/20 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white shadow">
                        <Youtube className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">YouTube (Canal & Video)</h4>
                        <p className="text-[11px] text-slate-400">Canal para icono de red y reproductor interactivo</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-red-400 bg-red-950/60 border border-red-500/40 px-2 py-0.5 rounded-full">
                      YouTube Pro
                    </span>
                  </div>

                  {/* 1. YouTube Channel Social Icon */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <span>1. Enlace a tu Canal de YouTube</span>
                        <span className="text-[10px] font-normal text-slate-400">(Abre tu perfil o canal)</span>
                      </label>
                      {card.socials.youtube && (
                        <button
                          onClick={() => setCard((prev) => ({ ...prev, socials: { ...prev.socials, youtube: '' } }))}
                          className="text-[10px] text-rose-400 hover:underline"
                        >
                          Eliminar canal
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={card.socials.youtube || ''}
                      onChange={(e) =>
                        setCard((prev) => ({
                          ...prev,
                          socials: { ...prev.socials, youtube: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                      placeholder="https://youtube.com/@mi_canal o @mi_canal"
                    />
                    {card.socials.youtube ? (
                      <div className="flex items-center justify-between text-[11px] text-slate-300 p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                        <span className="truncate max-w-[280px]">
                          URL destino: <strong className="text-red-400">{formatSocialUrl('youtube', card.socials.youtube)}</strong>
                        </span>
                        <a
                          href={formatSocialUrl('youtube', card.socials.youtube)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded bg-red-600/20 hover:bg-red-600/40 text-red-300 text-[10px] font-bold flex items-center gap-1 transition"
                        >
                          <span>Probar</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500">
                        Al completar este campo aparecerá automáticamente el icono de YouTube en tu tarjeta digital.
                      </p>
                    )}
                  </div>

                  {/* 2. Embedded Video Player */}
                  <div className="border-t border-red-500/20 pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <Play className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                        <span>2. Reproductor de Video de YouTube en la Tarjeta</span>
                      </label>
                      {card.videoUrl && (
                        <button
                          onClick={() => updateCardField('videoUrl', '')}
                          className="text-[10px] text-rose-400 hover:underline"
                        >
                          Quitar reproductor
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Tus clientes podrán ver este video sin salir de tu tarjeta digital (presentación de servicios, bienvenida o casos de éxito).
                    </p>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Enlace del Video o Short</label>
                      <input
                        type="url"
                        value={card.videoUrl || ''}
                        onChange={(e) => updateCardField('videoUrl', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                        placeholder="https://www.youtube.com/watch?v=... o https://youtu.be/... o Shorts"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Título del Video (Opcional)</label>
                      <input
                        type="text"
                        value={card.videoTitle || ''}
                        onChange={(e) => updateCardField('videoTitle', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                        placeholder="Ej. Conoce nuestra firma en 60 segundos"
                      />
                    </div>

                    {/* Live Preview Player inside editor */}
                    {card.videoUrl && (() => {
                      const embed = getEmbedVideoUrl(card.videoUrl);
                      if (!embed) return (
                        <p className="text-[11px] text-amber-400 bg-amber-950/30 p-2 rounded-lg border border-amber-600/30">
                          Enlace de video no reconocido. Asegúrate de que sea un enlace válido de YouTube (ej. https://youtube.com/watch?v=... o https://youtu.be/...).
                        </p>
                      );
                      return (
                        <div className="mt-2 p-2 rounded-xl bg-black/60 border border-red-500/30 space-y-1">
                          <p className="text-[10px] font-bold text-red-400 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Vista previa en vivo del reproductor:</span>
                          </p>
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black shadow">
                            <iframe
                              src={embed}
                              title="Vista previa"
                              className="absolute inset-0 w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* X / TWITTER DEDICATED SECTION */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-700 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-black border border-slate-700 flex items-center justify-center text-white shadow">
                        <XIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">X (anteriormente Twitter)</h4>
                        <p className="text-[11px] text-slate-400">Icono oficial de 𝕏 en tu tarjeta digital</p>
                      </div>
                    </div>
                    {card.socials.twitter && (
                      <button
                        onClick={() => setCard((prev) => ({ ...prev, socials: { ...prev.socials, twitter: '' } }))}
                        className="text-[10px] text-rose-400 hover:underline"
                      >
                        Quitar
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200">
                      Enlace o Usuario de tu Perfil en X
                    </label>
                    <input
                      type="text"
                      value={card.socials.twitter || ''}
                      onChange={(e) =>
                        setCard((prev) => ({
                          ...prev,
                          socials: { ...prev.socials, twitter: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-slate-400 focus:outline-none"
                      placeholder="https://x.com/mi_cuenta o @mi_cuenta"
                    />
                    {card.socials.twitter ? (
                      <div className="flex items-center justify-between text-[11px] text-slate-300 p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="truncate max-w-[280px]">
                          URL destino: <strong className="text-white">{formatSocialUrl('twitter', card.socials.twitter)}</strong>
                        </span>
                        <a
                          href={formatSocialUrl('twitter', card.socials.twitter)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center gap-1 transition"
                        >
                          <span>Probar</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500">
                        Acepta tanto @usuario como el enlace completo https://x.com/...
                      </p>
                    )}
                  </div>
                </div>

                {/* OTHER POPULAR SOCIAL PLATFORMS */}
                <div className="p-4 rounded-2xl bg-slate-850/60 border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Otras Redes Sociales Principales
                  </h4>

                  {/* Instagram */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-pink-500" />
                        <span>Instagram (@usuario o enlace)</span>
                      </label>
                      {card.socials.instagram && (
                        <button
                          onClick={() => setCard((prev) => ({ ...prev, socials: { ...prev.socials, instagram: '' } }))}
                          className="text-[10px] text-rose-400 hover:underline"
                        >
                          Borrar
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={card.socials.instagram || ''}
                      onChange={(e) =>
                        setCard((prev) => ({
                          ...prev,
                          socials: { ...prev.socials, instagram: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-pink-500"
                      placeholder="https://instagram.com/mi_cuenta o @mi_cuenta"
                    />
                  </div>

                  {/* Facebook */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>Facebook (Página o perfil)</span>
                      </label>
                      {card.socials.facebook && (
                        <button
                          onClick={() => setCard((prev) => ({ ...prev, socials: { ...prev.socials, facebook: '' } }))}
                          className="text-[10px] text-rose-400 hover:underline"
                        >
                          Borrar
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={card.socials.facebook || ''}
                      onChange={(e) =>
                        setCard((prev) => ({
                          ...prev,
                          socials: { ...prev.socials, facebook: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-blue-500"
                      placeholder="https://facebook.com/mi_pagina o mi_pagina"
                    />
                  </div>

                  {/* TikTok */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-teal-400" />
                        <span>TikTok (@usuario o enlace)</span>
                      </label>
                      {card.socials.tiktok && (
                        <button
                          onClick={() => setCard((prev) => ({ ...prev, socials: { ...prev.socials, tiktok: '' } }))}
                          className="text-[10px] text-rose-400 hover:underline"
                        >
                          Borrar
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={card.socials.tiktok || ''}
                      onChange={(e) =>
                        setCard((prev) => ({
                          ...prev,
                          socials: { ...prev.socials, tiktok: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-teal-500"
                      placeholder="https://tiktok.com/@mi_tiktok o @mi_tiktok"
                    />
                  </div>

                  {/* LinkedIn */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-sky-500" />
                        <span>LinkedIn (Perfil personal o empresa)</span>
                      </label>
                      {card.socials.linkedin && (
                        <button
                          onClick={() => setCard((prev) => ({ ...prev, socials: { ...prev.socials, linkedin: '' } }))}
                          className="text-[10px] text-rose-400 hover:underline"
                        >
                          Borrar
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={card.socials.linkedin || ''}
                      onChange={(e) =>
                        setCard((prev) => ({
                          ...prev,
                          socials: { ...prev.socials, linkedin: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-sky-500"
                      placeholder="nombre-profesional o https://linkedin.com/in/..."
                    />
                  </div>

                  {/* Telegram */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-sky-400" />
                        <span>Telegram (Usuario o canal)</span>
                      </label>
                      {card.socials.telegram && (
                        <button
                          onClick={() => setCard((prev) => ({ ...prev, socials: { ...prev.socials, telegram: '' } }))}
                          className="text-[10px] text-rose-400 hover:underline"
                        >
                          Borrar
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={card.socials.telegram || ''}
                      onChange={(e) =>
                        setCard((prev) => ({
                          ...prev,
                          socials: { ...prev.socials, telegram: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-sky-400"
                      placeholder="@mi_canal o https://t.me/mi_canal"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: DESIGN */}
            {activeTab === 'design' && (
              <div className="space-y-5">
                {/* 1. Colecciones de Diseño y Tema */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Colección & Estilo Visual</span>
                    </h3>
                    <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded-full">
                      6 Colecciones Premium
                    </span>
                  </div>
                  <select
                    value={card.design.theme}
                    onChange={(e) => updateDesignField('theme', e.target.value as CardTheme)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <optgroup label="✨ Colecciones Premium LAV Digital">
                      <option value="elegance-luxury">Colección A: Elegance Luxury (Obsidiana, Oro & Prestigio)</option>
                      <option value="future-tech">Colección B: Future Tech (Neón Láser, Cyber & Scanline)</option>
                      <option value="young-creative">Colección C: Young & Creative (Fluid Mesh & Dinamismo)</option>
                      <option value="minimal-studio">Colección D: Minimal Studio (Arquitectónico & Pureza)</option>
                      <option value="glass-motion">Colección E: Glass & Motion (Cristal Translúcido & Orbes)</option>
                      <option value="business-signature">Colección F: Business Signature (Corporativo Ejecutivo)</option>
                    </optgroup>
                    <optgroup label="🎨 Estilos Clásicos">
                      <option value="dark-luxury">Dark Luxury Clásico</option>
                      <option value="modern-clean">Modern Clean</option>
                      <option value="bold-gradient">Bold Gradient</option>
                      <option value="neon-tech">Neon Tech Clásico</option>
                      <option value="warm-organic">Warm Organic</option>
                      <option value="minimalist">Minimalist</option>
                      <option value="editorial">Editorial</option>
                    </optgroup>
                  </select>
                </div>

                {/* 2. Efectos Visuales e Iluminación Activa */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Efectos Visuales e Iluminación Activa</span>
                    </h3>
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                      60 FPS Hardware
                    </span>
                  </div>
                  <select
                    value={card.design.animationStyle || 'none'}
                    onChange={(e) => updateDesignField('animationStyle', e.target.value as AnimationStyle)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="none">Estático (Sin efectos continuos)</option>
                    <option value="metallic-sheen">Reflejo Metálico Dorado (Shimmer Sweep continuo)</option>
                    <option value="tech-scan">Haz Láser Perimetral & Escaneo Cyber (Border Beam)</option>
                    <option value="liquid-flow">Flujo Líquido de Gradiente Animado (Fluid Flow)</option>
                    <option value="floating-glow">Orbes de Luz Flotante Ambiental (Glass Motion)</option>
                    <option value="subtle-fade">Revelado Escalonado Suave (Stagger Fade-In)</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Efectos optimizados para GPU móvil. Se sincronizan en la tarjeta en vivo y en la exportación HTML para Hostinger.
                  </p>
                </div>

                {/* Palettes */}
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                    Paletas Predefinidas
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {colorPalettes.map((p) => (
                      <button
                        key={p.name}
                        onClick={() => {
                          updateDesignField('primaryColor', p.primary);
                          updateDesignField('secondaryColor', p.secondary);
                          updateDesignField('accentColor', p.accent);
                          updateDesignField('backgroundColor', p.bg);
                          if (p.text) updateDesignField('textColor', p.text);
                        }}
                        className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-500 text-left transition flex items-center justify-between"
                      >
                        <span className="text-xs font-medium text-slate-200">{p.name}</span>
                        <div className="flex gap-1">
                          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: p.primary }} />
                          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: p.secondary }} />
                          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: p.accent }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Color Pickers */}
                <div className="border-t border-slate-800 pt-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                    Personalización Exacta de Color
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Color Primario</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={card.design.primaryColor}
                          onChange={(e) => updateDesignField('primaryColor', e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={card.design.primaryColor}
                          onChange={(e) => updateDesignField('primaryColor', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-slate-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Color Secundario</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={card.design.secondaryColor}
                          onChange={(e) => updateDesignField('secondaryColor', e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={card.design.secondaryColor}
                          onChange={(e) => updateDesignField('secondaryColor', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-slate-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Color de Acento (CTA)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={card.design.accentColor}
                          onChange={(e) => updateDesignField('accentColor', e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={card.design.accentColor}
                          onChange={(e) => updateDesignField('accentColor', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-slate-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Color de Fondo</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={card.design.backgroundColor}
                          onChange={(e) => updateDesignField('backgroundColor', e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={card.design.backgroundColor}
                          onChange={(e) => updateDesignField('backgroundColor', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Typography */}
                <div className="border-t border-slate-800 pt-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Tipografías</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Fuente de Encabezados</label>
                      <select
                        value={card.design.fontHeadline}
                        onChange={(e) => updateDesignField('fontHeadline', e.target.value as FontHeadline)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="Outfit">Outfit (Moderna, Geométrica)</option>
                        <option value="Inter">Inter (Limpia, Corporativa)</option>
                        <option value="Playfair Display">Playfair Display (Elegante Serif, Gastronomía & Moda)</option>
                        <option value="Cinzel">Cinzel (Clásica Romana, Legal & Prestigio)</option>
                        <option value="Space Grotesk">Space Grotesk (Tech, Creativa, Futuro)</option>
                        <option value="Montserrat">Montserrat (Contemporánea, Alta Legibilidad)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Fuente de Cuerpo</label>
                      <select
                        value={card.design.fontBody}
                        onChange={(e) => updateDesignField('fontBody', e.target.value as FontBody)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="Inter">Inter (Óptima para celulares)</option>
                        <option value="DM Sans">DM Sans (Suave y legible)</option>
                        <option value="Outfit">Outfit (Moderna y continua)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Textures & Shapes */}
                <div className="border-t border-slate-800 pt-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                    Forma de Tarjeta & Textura
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Bordes de Tarjeta</label>
                      <select
                        value={card.design.cardShape}
                        onChange={(e) => updateDesignField('cardShape', e.target.value as CardShape)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
                      >
                        <option value="rounded-3xl">Redondeada Premium (32px)</option>
                        <option value="rounded-2xl">Redondeada Media (16px)</option>
                        <option value="rounded-xl">Borde Fino (12px)</option>
                        <option value="rounded-none">Recta / Minimalista</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Patrón de Fondo</label>
                      <select
                        value={card.design.backgroundPattern}
                        onChange={(e) => updateDesignField('backgroundPattern', e.target.value as BackgroundPattern)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
                      >
                        <option value="none">Liso / Sin patrón</option>
                        <option value="dots">Puntos finos</option>
                        <option value="mesh">Malla de gradiente</option>
                        <option value="geometric">Geométrico diagonal</option>
                        <option value="carbon">Fibra de carbono</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Feature Toggles */}
                <div className="border-t border-slate-800 pt-4 space-y-2">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Módulos Visibles</h3>
                  <label className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 text-xs">
                    <span>Botón "Guardar Contacto" (vCard 3.0)</span>
                    <input
                      type="checkbox"
                      checked={card.design.showSaveContactButton}
                      onChange={(e) => updateDesignField('showSaveContactButton', e.target.checked)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 text-xs">
                    <span>Icono de Código QR Dinámico</span>
                    <input
                      type="checkbox"
                      checked={card.design.showQrCodeButton}
                      onChange={(e) => updateDesignField('showQrCodeButton', e.target.checked)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 text-xs">
                    <span>Icono de Tarjeta NFC</span>
                    <input
                      type="checkbox"
                      checked={card.design.showNfcButton}
                      onChange={(e) => updateDesignField('showNfcButton', e.target.checked)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 text-xs">
                    <span>Catálogo de Productos / Servicios</span>
                    <input
                      type="checkbox"
                      checked={card.design.showCatalog}
                      onChange={(e) => updateDesignField('showCatalog', e.target.checked)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 text-xs">
                    <span>Portafolio / Galería de Fotos</span>
                    <input
                      type="checkbox"
                      checked={card.design.showGallery}
                      onChange={(e) => updateDesignField('showGallery', e.target.checked)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 text-xs">
                    <span>Horarios de Atención</span>
                    <input
                      type="checkbox"
                      checked={card.design.showHours}
                      onChange={(e) => updateDesignField('showHours', e.target.checked)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB: MEDIA (LOGOS & PHOTOS) */}
            {activeTab === 'media' && (
              <div className="space-y-5">
                {/* Avatar / Personal photo */}
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Fotografía Personal o Profesional
                  </h3>
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
                    <img
                      src={card.design.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                      alt="Avatar"
                      className="w-16 h-16 rounded-2xl object-cover bg-slate-900 shadow"
                    />
                    <div className="flex-1 space-y-1.5">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition">
                        <span>Subir desde dispositivo</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          onChange={(e) => handleFileUpload(e, 'avatar')}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-slate-400">PNG, JPG o WebP. Máximo 5MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Forma de Foto</label>
                      <select
                        value={card.design.avatarShape}
                        onChange={(e) => updateDesignField('avatarShape', e.target.value as any)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                      >
                        <option value="circle">Circular</option>
                        <option value="squircle">Squircle (Moderna)</option>
                        <option value="square">Cuadrada</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Tamaño</label>
                      <select
                        value={card.design.avatarSize}
                        onChange={(e) => updateDesignField('avatarSize', e.target.value as any)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                      >
                        <option value="sm">Compacto</option>
                        <option value="md">Mediano</option>
                        <option value="lg">Grande Destacado</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Business Logo */}
                <div className="border-t border-slate-800 pt-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Logotipo Empresarial (Conserva Transparencia)
                  </h3>
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
                    <div className="w-16 h-16 rounded-xl bg-slate-950 flex items-center justify-center p-2 border border-slate-800">
                      {card.design.logoUrl ? (
                        <img src={card.design.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-slate-500 font-bold">Sin logo</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition">
                          <span>Subir Logo (PNG/SVG)</span>
                          <input
                            type="file"
                            accept="image/png,image/svg+xml,image/webp,image/jpeg"
                            onChange={(e) => handleFileUpload(e, 'logo')}
                            className="hidden"
                          />
                        </label>
                        {card.design.logoUrl && (
                          <button
                            onClick={() => updateDesignField('logoUrl', '')}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40"
                            title="Quitar logotipo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">Recomendado PNG con fondo transparente.</p>
                    </div>
                  </div>

                  {card.design.logoUrl && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>Ancho de Logotipo</span>
                        <span className="font-mono">{card.design.logoWidth}px</span>
                      </div>
                      <input
                        type="range"
                        min="60"
                        max="180"
                        value={card.design.logoWidth}
                        onChange={(e) => updateDesignField('logoWidth', parseInt(e.target.value, 10))}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                  )}
                </div>

                {/* Cover Banner */}
                <div className="border-t border-slate-800 pt-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Foto de Portada / Banner
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition">
                        <span>Subir Imagen de Portada</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'banner')}
                          className="hidden"
                        />
                      </label>
                      {card.design.bannerUrl && (
                        <button
                          onClick={() => updateDesignField('bannerUrl', '')}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40"
                          title="Quitar portada"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Altura de Portada</label>
                      <select
                        value={card.design.coverHeight}
                        onChange={(e) => updateDesignField('coverHeight', e.target.value as any)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                      >
                        <option value="sm">Pequeña (110px)</option>
                        <option value="md">Mediana Estándar (145px)</option>
                        <option value="lg">Amplia Panorámica (190px)</option>
                        <option value="none">Sin portada (Solo color)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: BUTTONS */}
            {activeTab === 'buttons' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Botones Personalizados
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Agrega enlaces para agendar, cotizar, ver catálogos o menús.
                    </p>
                  </div>
                  <button
                    onClick={handleAddButton}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {card.customButtons && card.customButtons.length > 0 ? (
                    card.customButtons.map((btn, idx) => (
                      <div
                        key={btn.id}
                        className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400">Botón #{idx + 1}</span>
                          <button
                            onClick={() => handleDeleteButton(btn.id)}
                            className="text-rose-400 hover:text-rose-300 p-1"
                            title="Eliminar botón"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Texto del Botón</label>
                          <input
                            type="text"
                            value={btn.label}
                            onChange={(e) => handleUpdateButton(btn.id, 'label', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                            placeholder="Ej. Agendar Cita en Línea"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">URL o Enlace Destino</label>
                          <input
                            type="url"
                            value={btn.url}
                            onChange={(e) => handleUpdateButton(btn.id, 'url', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                            placeholder="https://..."
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Estilo Visual</label>
                          <select
                            value={btn.style || 'primary'}
                            onChange={(e) => handleUpdateButton(btn.id, 'style', e.target.value as any)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                          >
                            <option value="primary">Color Primario Destacado</option>
                            <option value="accent">Color de Acento / Alerta</option>
                            <option value="glass">Cristal Translúcido</option>
                            <option value="outline">Borde Delicado</option>
                          </select>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 border border-dashed border-slate-800 rounded-2xl p-4">
                      <LinkIcon className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                      <p className="text-xs text-slate-400">No hay botones personalizados.</p>
                      <button
                        onClick={handleAddButton}
                        className="mt-3 text-xs text-indigo-400 font-bold hover:underline"
                      >
                        + Crear tu primer botón
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: CATALOG */}
            {activeTab === 'catalog' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Catálogo de Productos y Servicios
                    </h3>
                    <p className="text-[11px] text-slate-400">Presenta precios, fotos y contacto rápido.</p>
                  </div>
                  <button
                    onClick={handleAddCatalogItem}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Ítem</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {card.catalog && card.catalog.length > 0 ? (
                    card.catalog.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400">Ítem #{idx + 1}</span>
                          <button
                            onClick={() => handleDeleteCatalogItem(item.id)}
                            className="text-rose-400 hover:text-rose-300 p-1"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Título / Nombre</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handleUpdateCatalogItem(item.id, 'title', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                            placeholder="Ej. Consulta Especializada"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">Precio o Tarifa</label>
                            <input
                              type="text"
                              value={item.price || ''}
                              onChange={(e) => handleUpdateCatalogItem(item.id, 'price', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                              placeholder="Ej. $850 MXN"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">URL de Foto (Opcional)</label>
                            <input
                              type="url"
                              value={item.imageUrl || ''}
                              onChange={(e) => handleUpdateCatalogItem(item.id, 'imageUrl', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                              placeholder="https://images.unsplash..."
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Descripción</label>
                          <textarea
                            rows={2}
                            value={item.description}
                            onChange={(e) => handleUpdateCatalogItem(item.id, 'description', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                            placeholder="Detalles sobre qué incluye o beneficios."
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 border border-dashed border-slate-800 rounded-2xl p-4">
                      <ShoppingBag className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                      <p className="text-xs text-slate-400">No hay productos ni servicios cargados.</p>
                      <button
                        onClick={handleAddCatalogItem}
                        className="mt-3 text-xs text-indigo-400 font-bold hover:underline"
                      >
                        + Añadir primer producto o servicio
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: GALLERY / PORTFOLIO */}
            {activeTab === 'gallery' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Galería & Portafolio</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Muestra fotos de tus proyectos, instalaciones y trabajos.</p>
                  </div>
                  <button
                    onClick={handleAddGalleryItem}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Foto</span>
                  </button>
                </div>

                {/* Show Gallery Toggle */}
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-200">Mostrar Galería en la Tarjeta</p>
                    <p className="text-[11px] text-slate-400">Cuadrícula visual de 2 columnas</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={card.design.showGallery}
                      onChange={(e) => updateDesignField('showGallery', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="space-y-3">
                  {card.gallery && card.gallery.length > 0 ? (
                    card.gallery.map((g, idx) => (
                      <div
                        key={g.id}
                        className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400">Foto #{idx + 1}</span>
                          <button
                            onClick={() => handleDeleteGalleryItem(g.id)}
                            className="text-rose-400 hover:text-rose-300 p-1"
                            title="Eliminar foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex gap-3 items-center">
                          <img
                            src={g.imageUrl}
                            alt={g.title || 'Foto'}
                            className="w-14 h-14 rounded-xl object-cover bg-slate-900 border border-slate-700 flex-shrink-0"
                          />
                          <div className="flex-1 space-y-2">
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5">Título o Pie de Foto</label>
                              <input
                                type="text"
                                value={g.title || ''}
                                onChange={(e) => handleUpdateGalleryItem(g.id, 'title', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                                placeholder="Ej. Remodelación residencial"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5">URL de la Imagen</label>
                              <input
                                type="url"
                                value={g.imageUrl}
                                onChange={(e) => handleUpdateGalleryItem(g.id, 'imageUrl', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                                placeholder="https://..."
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 border border-dashed border-slate-800 rounded-2xl p-4">
                      <Camera className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                      <p className="text-xs text-slate-400">No hay fotos en el portafolio.</p>
                      <button
                        onClick={handleAddGalleryItem}
                        className="mt-3 text-xs text-indigo-400 font-bold hover:underline"
                      >
                        + Añadir primera foto al portafolio
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: PHYSICAL CARD PRINTING (FRENTE Y REVERSO) */}
            {activeTab === 'physical' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Diseño de Tarjetas Físicas (Frente y Reverso)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Configura el reverso con código QR, lema y contacto para impresión en imprenta o tarjetas NFC.
                  </p>
                </div>

                {/* Flip face toggle */}
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">Cara activa en vista previa:</span>
                  <div className="flex gap-1 bg-slate-900 p-1 rounded-xl">
                    <button
                      onClick={() => {
                        setActiveFace('front');
                        setViewportMode('physical');
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        activeFace === 'front' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Frente
                    </button>
                    <button
                      onClick={() => {
                        setActiveFace('back');
                        setViewportMode('physical');
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        activeFace === 'back' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Reverso
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Lema o Eslogan Reverso</label>
                    <input
                      type="text"
                      value={card.design.physicalCard.backSlogan}
                      onChange={(e) => updatePhysicalField('backSlogan', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                      placeholder="Ej. Calidad y compromiso en cada detalle."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Fondo Reverso</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={card.design.physicalCard.backBackgroundColor}
                          onChange={(e) => updatePhysicalField('backBackgroundColor', e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-xs font-mono text-slate-300">
                          {card.design.physicalCard.backBackgroundColor}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Color de Texto</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={card.design.physicalCard.backTextColor}
                          onChange={(e) => updatePhysicalField('backTextColor', e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-xs font-mono text-slate-300">
                          {card.design.physicalCard.backTextColor}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 text-xs">
                      <span>Incluir Código QR en Reverso</span>
                      <input
                        type="checkbox"
                        checked={card.design.physicalCard.showBackQr}
                        onChange={(e) => updatePhysicalField('showBackQr', e.target.checked)}
                        className="rounded border-slate-700 text-indigo-600"
                      />
                    </label>
                    <label className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 text-xs">
                      <span>Mostrar Guías de Sangrado / Corte (3mm)</span>
                      <input
                        type="checkbox"
                        checked={card.design.physicalCard.showBleedGuides}
                        onChange={(e) => updatePhysicalField('showBleedGuides', e.target.checked)}
                        className="rounded border-slate-700 text-indigo-600"
                      />
                    </label>
                  </div>

                  <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-900/60 text-[11px] text-indigo-300 space-y-1">
                    <p className="font-bold">📐 Medidas estándar de imprenta:</p>
                    <p>85 x 54 mm (tarjeta estándar europea / mexicana) o 3.5 x 2 pulgadas.</p>
                    <p>Ideal para enviar a imprenta o imprimir en tarjetas NFC de PVC o metal.</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: AI CREATIVE ASSISTANT (LAV AI) */}
            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-950/40 via-purple-950/30 to-indigo-950/40 border border-pink-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-pink-400" />
                    <h3 className="text-sm font-bold text-white">Asistente Creativo LAV AI</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Potenciado por Gemini 3.8 en el servidor. Genera combinaciones armoniosas de color, tipografías y textos persuasivos adaptados al giro de tu negocio.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Sector o Giro del Negocio</label>
                    <input
                      type="text"
                      value={aiPromptCategory}
                      onChange={(e) => setAiPromptCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none"
                      placeholder="Ej. Odontología estética, Boutique de moda, Consultoría fiscal..."
                    />
                  </div>

                  <button
                    onClick={handleAiSuggest}
                    disabled={aiLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>{aiLoading ? 'Generando propuesta con IA...' : 'Generar Propuesta Integral de Diseño'}</span>
                  </button>

                  {aiError && (
                    <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                      {aiError}
                    </div>
                  )}

                  <div className="border-t border-slate-800 pt-3 space-y-2">
                    <p className="text-xs font-semibold text-slate-300">Optimizador Rápido de Textos:</p>
                    <button
                      onClick={() => handleAiEnhanceText('bio')}
                      disabled={aiLoading}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 text-left flex items-center justify-between"
                    >
                      <span>Reescribir Biografía / Propuesta de Valor</span>
                      <Wand2 className="w-3.5 h-3.5 text-pink-400" />
                    </button>
                    <button
                      onClick={() => handleAiEnhanceText('slogan')}
                      disabled={aiLoading}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 text-left flex items-center justify-between"
                    >
                      <span>Generar Eslogan de Alto Impacto</span>
                      <Wand2 className="w-3.5 h-3.5 text-pink-400" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STICKY BOTTOM TOOLBAR: Guardar Cambios siempre visible al editar */}
          <div className="p-3 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-between gap-3 flex-shrink-0 z-20 shadow-xl">
            <div className="flex items-center gap-2 min-w-0">
              {saveSuccess ? (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-pulse truncate">
                  <Check className="w-4 h-4 flex-shrink-0" /> ¡Tarjeta guardada con éxito!
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 truncate">
                  {card.name || 'Sin título'} &bull; Guarda tus cambios
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setMobileMode('preview')}
                className="md:hidden px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span>Previa</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/40 flex items-center gap-2 transition active:scale-95 cursor-pointer ring-1 ring-white/20"
                title="Guardar todos los cambios"
              >
                {saveSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
                <span>{saveSuccess ? '¡Guardado!' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT LIVE CANVAS & SIMULATOR */}
        <main className={`flex-1 bg-slate-950/80 p-4 lg:p-6 flex flex-col items-center justify-between overflow-y-auto relative ${mobileMode === 'preview' ? 'flex' : 'hidden md:flex'}`}>
          {/* Viewport bar */}
          <div className="flex items-center gap-2 mb-4 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl shadow-lg">
            <button
              onClick={() => {
                setViewportMode('mobile');
                setActiveFace('front');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                viewportMode === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Celular</span>
            </button>
            <button
              onClick={() => {
                setViewportMode('tablet');
                setActiveFace('front');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                viewportMode === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tablet className="w-4 h-4" />
              <span>Tableta</span>
            </button>
            <button
              onClick={() => {
                setViewportMode('desktop');
                setActiveFace('front');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                viewportMode === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Escritorio</span>
            </button>
            <button
              onClick={() => {
                setViewportMode('physical');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                viewportMode === 'physical' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Física ({activeFace === 'front' ? 'Frente' : 'Reverso'})</span>
            </button>

            {viewportMode === 'physical' && (
              <button
                onClick={() => setActiveFace((prev) => (prev === 'front' ? 'back' : 'front'))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 ml-1"
                title="Voltear Tarjeta 3D"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Interactive Simulation Frame */}
          <div className="w-full flex-1 flex items-center justify-center py-2">
            {viewportMode === 'mobile' && (
              <div className="relative w-[380px] max-w-full rounded-[44px] p-3 bg-slate-900 border-4 border-slate-800 shadow-2xl ring-1 ring-white/10">
                {/* Notch / Dynamic Island */}
                <div className="w-28 h-4 bg-slate-950 rounded-full mx-auto mb-2" />
                <div className="max-h-[720px] overflow-y-auto no-scrollbar rounded-[32px]">
                  <DigitalCardView card={card} />
                </div>
              </div>
            )}

            {viewportMode === 'tablet' && (
              <div className="relative w-[540px] max-w-full rounded-[36px] p-4 bg-slate-900 border-4 border-slate-800 shadow-2xl">
                <div className="max-h-[720px] overflow-y-auto no-scrollbar rounded-2xl flex justify-center">
                  <DigitalCardView card={card} />
                </div>
              </div>
            )}

            {viewportMode === 'desktop' && (
              <div className="relative w-full max-w-2xl rounded-2xl p-4 bg-slate-900/60 border border-slate-800 shadow-2xl flex justify-center">
                <div className="w-full max-h-[720px] overflow-y-auto no-scrollbar flex justify-center py-4">
                  <DigitalCardView card={card} />
                </div>
              </div>
            )}

            {viewportMode === 'physical' && (
              <div className="flex flex-col items-center gap-4">
                <div className="perspective-1000 transition-all duration-500">
                  <DigitalCardView
                    card={card}
                    isPhysicalCardPreview={true}
                    activeFace={activeFace}
                  />
                </div>
                <button
                  onClick={() => setActiveFace((prev) => (prev === 'front' ? 'back' : 'front'))}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 shadow"
                >
                  <RotateCw className="w-4 h-4 text-indigo-400" />
                  <span>Voltear tarjeta ({activeFace === 'front' ? 'Ver Reverso' : 'Ver Frente'})</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick instructions status footer */}
          <div className="text-center text-[11px] text-slate-500 pt-2 pb-16 md:pb-2">
            Vista previa interactiva en tiempo real &bull; Los botones y enlaces responden como en el celular
          </div>

          {/* Floating Action Bar on Live Canvas for instant save anywhere */}
          <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMode('editor')}
              className="md:hidden flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-800/95 hover:bg-slate-700 text-white text-xs font-bold shadow-2xl border border-slate-700 backdrop-blur-md active:scale-95 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a Editar</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-2xl shadow-indigo-600/50 border border-white/20 active:scale-95 transition cursor-pointer"
              title="Guardar tarjeta ahora"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300 animate-pulse" />
                  <span>¡Guardado!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Tarjeta</span>
                </>
              )}
            </button>
          </div>
        </main>
      </div>

      {showHostingerModal && (
        <HostingerExportModal
          card={card}
          onClose={() => setShowHostingerModal(false)}
        />
      )}
    </div>
  );
};
