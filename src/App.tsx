import React, { useState, useEffect } from 'react';
import { CardData } from './types/card';
import { Client } from './types/client';
import { CardTemplate } from './data/templates';
import {
  getStoredCards,
  saveOrUpdateCard,
  deleteCard,
  getStoredClients,
  getStoredTemplates,
  recordCardView,
} from './utils/storage';
import { Navbar } from './components/layout/Navbar';
import { DashboardView } from './components/views/DashboardView';
import { MyCardsView } from './components/views/MyCardsView';
import { TemplatesView } from './components/views/TemplatesView';
import { ClientsView } from './components/views/ClientsView';
import { AssetsView } from './components/views/AssetsView';
import { SettingsView } from './components/views/SettingsView';
import { CardEditor } from './components/editor/CardEditor';
import { PreviewModal } from './components/card/PreviewModal';
import { HostingerExportModal } from './components/card/HostingerExportModal';
import { DigitalCardView } from './components/card/DigitalCardView';
import { Sparkles, Plus, ArrowLeft, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [cards, setCards] = useState<CardData[]>(() => getStoredCards());
  const [clients, setClients] = useState<Client[]>(() => getStoredClients());
  const [templates] = useState<CardTemplate[]>(() => getStoredTemplates());
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [editingCard, setEditingCard] = useState<CardData | null>(null);
  const [previewCard, setPreviewCard] = useState<CardData | null>(null);
  const [hostingerCard, setHostingerCard] = useState<CardData | null>(null);
  const [standaloneCardSlug, setStandaloneCardSlug] = useState<string | null>(null);
  const [showNewCardChoice, setShowNewCardChoice] = useState(false);

  // Parse URL hash, query param, or pathname for direct public card view
  useEffect(() => {
    const checkRoute = () => {
      const hash = window.location.hash || '';
      const pathname = window.location.pathname || '';
      const search = window.location.search || '';

      if (hash.includes('card=')) {
        const rawSlug = hash.split('card=')[1]?.split('&')[0];
        setStandaloneCardSlug(rawSlug ? decodeURIComponent(rawSlug) : null);
      } else if (hash.startsWith('#/c/')) {
        const rawSlug = hash.replace('#/c/', '').split('?')[0];
        setStandaloneCardSlug(rawSlug ? decodeURIComponent(rawSlug) : null);
      } else if (pathname.startsWith('/c/')) {
        const rawSlug = pathname.replace('/c/', '').split('/')[0];
        setStandaloneCardSlug(rawSlug ? decodeURIComponent(rawSlug) : null);
      } else if (search.includes('card=')) {
        const params = new URLSearchParams(search);
        const rawSlug = params.get('card');
        setStandaloneCardSlug(rawSlug ? decodeURIComponent(rawSlug) : null);
      } else {
        setStandaloneCardSlug(null);
      }
    };

    checkRoute();
    window.addEventListener('hashchange', checkRoute);
    window.addEventListener('popstate', checkRoute);
    return () => {
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('popstate', checkRoute);
    };
  }, []);

  // Record view count when a standalone card is opened
  useEffect(() => {
    if (standaloneCardSlug) {
      recordCardView(standaloneCardSlug);
      setCards(getStoredCards());
    }
  }, [standaloneCardSlug]);

  const refreshData = () => {
    setCards(getStoredCards());
    setClients(getStoredClients());
  };

  // Create brand new blank card
  const handleCreateBlankCard = () => {
    setShowNewCardChoice(false);
    const newId = `card-${Date.now()}`;
    const newCard: CardData = {
      id: newId,
      slug: `tarjeta-${Math.random().toString(36).substring(2, 7)}`,
      name: 'Mi Nombre Profesional',
      businessName: 'Mi Empresa o Negocio',
      jobTitle: 'Especialista / Consultor',
      bio: 'Breve descripción de los servicios y valor que ofreces a tus clientes.',
      category: 'General',
      status: 'draft',
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      phone: '+52 55 ',
      whatsapp: '+52 55 ',
      whatsappMessage: 'Hola, vi tu tarjeta digital y me gustaría más información.',
      email: '',
      website: '',
      address: '',
      googleMapsUrl: '',
      businessHours: 'Lun - Vie: 9:00 AM - 6:00 PM',
      socials: {
        instagram: '',
        facebook: '',
        linkedin: '',
        tiktok: '',
      },
      customButtons: [
        {
          id: 'btn-1',
          label: 'Escribir por WhatsApp',
          url: 'https://wa.me/',
          style: 'primary',
        },
      ],
      catalog: [],
      gallery: [],
      design: {
        theme: 'modern-clean',
        primaryColor: '#6366f1',
        secondaryColor: '#8b5cf6',
        accentColor: '#10b981',
        backgroundColor: '#0f172a',
        textColor: '#f8fafc',
        backgroundPattern: 'mesh',
        fontHeadline: 'Outfit',
        fontBody: 'Inter',
        cardShape: 'rounded-3xl',
        buttonStyle: 'solid',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        avatarShape: 'circle',
        avatarBorder: true,
        avatarSize: 'md',
        logoUrl: '',
        logoPosition: 'header',
        logoWidth: 100,
        bannerUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800',
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
        physicalCard: {
          enabled: true,
          orientation: 'horizontal',
          backBackgroundColor: '#0f172a',
          backTextColor: '#f8fafc',
          showBackLogo: true,
          showBackQr: true,
          backSlogan: 'Tu presencia profesional en el mundo digital.',
          backWebsite: 'lavdigitalmkt.com',
          backPhone: '',
          showBleedGuides: true,
        },
      },
    };

    saveOrUpdateCard(newCard);
    refreshData();
    setEditingCard(newCard);
  };

  // Clone from template
  const handleSelectTemplate = (template: CardTemplate) => {
    setShowNewCardChoice(false);
    const newCard: CardData = {
      ...template.cardData,
      id: `card-${Date.now()}`,
      slug: `${template.cardData.slug}-${Math.random().toString(36).substring(2, 5)}`,
      name: `${template.cardData.name} (Copia)`,
      status: 'draft',
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveOrUpdateCard(newCard);
    refreshData();
    setEditingCard(newCard);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
  };

  // Duplicate an existing card
  const handleDuplicateCard = (cardToDuplicate: CardData) => {
    const duplicated: CardData = {
      ...cardToDuplicate,
      id: `card-${Date.now()}`,
      slug: `${cardToDuplicate.slug}-copia-${Math.random().toString(36).substring(2, 5)}`,
      name: `${cardToDuplicate.name} (Copia)`,
      status: 'draft',
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveOrUpdateCard(duplicated);
    refreshData();
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.7 } });
  };

  // Create card for a specific client
  const handleCreateCardForClient = (client: Client) => {
    const newCard: CardData = {
      id: `card-${Date.now()}`,
      slug: `${client.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substring(2, 5)}`,
      name: client.name,
      businessName: client.company,
      jobTitle: 'Director / Propietario',
      bio: `Servicios profesionales de ${client.company}.`,
      category: client.category || 'General',
      clientId: client.id,
      clientName: client.name,
      status: 'draft',
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      phone: client.phone || '',
      whatsapp: client.phone || '',
      whatsappMessage: `Hola ${client.name}, vi tu tarjeta digital y deseo información.`,
      email: client.email || '',
      website: '',
      address: '',
      googleMapsUrl: '',
      businessHours: 'Lun - Sáb: 9:00 AM - 7:00 PM',
      socials: {},
      customButtons: [],
      catalog: [],
      gallery: [],
      design: {
        theme: 'modern-clean',
        primaryColor: '#6366f1',
        secondaryColor: '#8b5cf6',
        accentColor: '#10b981',
        backgroundColor: '#0f172a',
        textColor: '#f8fafc',
        backgroundPattern: 'mesh',
        fontHeadline: 'Outfit',
        fontBody: 'Inter',
        cardShape: 'rounded-3xl',
        buttonStyle: 'solid',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        avatarShape: 'squircle',
        avatarBorder: true,
        avatarSize: 'md',
        logoUrl: client.files?.find((f) => f.type === 'logo')?.url || '',
        logoPosition: 'header',
        logoWidth: 100,
        bannerUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800',
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
        physicalCard: {
          enabled: true,
          orientation: 'horizontal',
          backBackgroundColor: '#0f172a',
          backTextColor: '#f8fafc',
          showBackLogo: true,
          showBackQr: true,
          backSlogan: 'Tu presencia profesional en el mundo digital.',
          backWebsite: 'lavdigitalmkt.com',
          backPhone: client.phone || '',
          showBleedGuides: true,
        },
      },
    };

    saveOrUpdateCard(newCard);
    refreshData();
    setEditingCard(newCard);
  };

  const handleDeleteCard = (id: string) => {
    deleteCard(id);
    refreshData();
  };

  // If viewing standalone card by URL hash (#card=...) or /c/slug
  if (standaloneCardSlug) {
    const targetCard = cards.find(
      (c) => c.slug === standaloneCardSlug || c.id === standaloneCardSlug
    );

    if (targetCard) {
      return (
        <main className="min-h-[100svh] w-full flex items-start sm:items-center justify-center px-3 py-4 sm:p-6 bg-[#070b14]">
          <div className="w-full max-w-[430px]">
            <DigitalCardView card={targetCard} isStandalone={true} />
          </div>
        </main>
      );
    } else {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 max-w-sm space-y-3">
            <h2 className="text-lg font-bold text-white">Tarjeta no encontrada</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              No se encontró ninguna tarjeta con el identificador <code className="text-indigo-400 font-mono">"{standaloneCardSlug}"</code>.
            </p>
            <button
              onClick={() => {
                window.location.hash = '';
                if (window.location.pathname.startsWith('/c/')) {
                  window.history.pushState(null, '', '/');
                }
                setStandaloneCardSlug(null);
              }}
              className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow"
            >
              Ir al Panel Principal
            </button>
          </div>
        </div>
      );
    }
  }

  // If in Visual Studio Editor Mode
  if (editingCard) {
    return (
      <CardEditor
        initialCard={editingCard}
        onSave={(updatedCard) => {
          saveOrUpdateCard(updatedCard);
          refreshData();
          setEditingCard(updatedCard);
        }}
        onBack={() => {
          setEditingCard(null);
          refreshData();
        }}
        onPreviewStandalone={(card) => {
          setPreviewCard(card);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navbar with PWA install flow and Spanish navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onNewCard={() => setShowNewCardChoice(true)}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {currentTab === 'dashboard' && (
          <DashboardView
            cards={cards}
            clients={clients}
            onNewCard={() => setShowNewCardChoice(true)}
            onEditCard={(c) => setEditingCard(c)}
            onDuplicateCard={handleDuplicateCard}
            onSelectTab={(t) => setCurrentTab(t)}
            onPreviewCard={(c) => setPreviewCard(c)}
            onOpenHostingerModal={(c) => setHostingerCard(c)}
          />
        )}

        {currentTab === 'my-cards' && (
          <MyCardsView
            cards={cards}
            onNewCard={() => setShowNewCardChoice(true)}
            onEditCard={(c) => setEditingCard(c)}
            onDuplicateCard={handleDuplicateCard}
            onDeleteCard={handleDeleteCard}
            onPreviewCard={(c) => setPreviewCard(c)}
            onOpenHostingerModal={(c) => setHostingerCard(c)}
          />
        )}

        {currentTab === 'templates' && (
          <TemplatesView
            templates={templates}
            onSelectTemplate={handleSelectTemplate}
          />
        )}

        {currentTab === 'clients' && (
          <ClientsView
            clients={clients}
            cards={cards}
            onClientsChange={refreshData}
            onCreateCardForClient={handleCreateCardForClient}
            onEditCard={(c) => setEditingCard(c)}
          />
        )}

        {currentTab === 'assets' && <AssetsView clients={clients} />}

        {currentTab === 'settings' && <SettingsView onRefreshData={refreshData} />}
      </main>

      {/* New Card Choice Modal */}
      {showNewCardChoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 text-white shadow-2xl space-y-4">
            <div>
              <h3 className="text-lg font-bold">¿Cómo deseas comenzar tu tarjeta?</h3>
              <p className="text-xs text-slate-400">
                Elige entre partir de una plantilla profesional o diseñar desde un lienzo en blanco.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  setShowNewCardChoice(false);
                  setCurrentTab('templates');
                }}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-indigo-950/70 to-purple-950/70 border border-indigo-500/30 hover:border-indigo-500 text-left transition flex items-center justify-between group shadow"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    <span className="font-bold text-sm text-white">Elegir Plantilla por Sector</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Inmobiliarias y casas, bodas, fiestas infantiles, eventos VIP, médicos y más.
                  </p>
                </div>
                <span className="text-indigo-400 group-hover:translate-x-1 transition-transform">➔</span>
              </button>

              <button
                onClick={handleCreateBlankCard}
                className="w-full p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-left transition flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-sm text-white">Crear desde Cero (Lienzo en Blanco)</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Define colores, módulos, logotipo y tipografías completamente a tu gusto.
                  </p>
                </div>
                <span className="text-slate-400 group-hover:translate-x-1 transition-transform">➔</span>
              </button>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowNewCardChoice(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Phone Bezel Preview Modal */}
      {previewCard && (
        <PreviewModal
          card={previewCard}
          onClose={() => {
            setPreviewCard(null);
            refreshData();
          }}
          onEdit={(c) => {
            setPreviewCard(null);
            setEditingCard(c);
          }}
          onOpenHostingerModal={(c) => {
            setPreviewCard(null);
            setHostingerCard(c);
          }}
        />
      )}

      {/* Hostinger Publication Modal */}
      {hostingerCard && (
        <HostingerExportModal
          card={hostingerCard}
          onClose={() => setHostingerCard(null)}
        />
      )}
    </div>
  );
}
