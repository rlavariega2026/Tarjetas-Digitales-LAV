import React from 'react';
import { CardData } from '../../types/card';
import { Client } from '../../types/client';
import { downloadStandaloneHtmlFile } from '../../utils/exportHtml';
import { downloadQr } from '../../utils/qr';
import {
  Layers,
  Sparkles,
  Users,
  Eye,
  Plus,
  ArrowRight,
  ExternalLink,
  QrCode,
  Globe,
  Edit3,
  Copy,
  Check,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnalyticsPanel } from '../dashboard/AnalyticsPanel';
import { InstallAppInfoCard } from '../dashboard/InstallAppInfoCard';

interface DashboardViewProps {
  cards: CardData[];
  clients: Client[];
  onNewCard: () => void;
  onEditCard: (card: CardData) => void;
  onDuplicateCard: (card: CardData) => void;
  onSelectTab: (tab: string) => void;
  onPreviewCard: (card: CardData) => void;
  onOpenHostingerModal: (card: CardData) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  cards,
  clients,
  onNewCard,
  onEditCard,
  onDuplicateCard,
  onSelectTab,
  onPreviewCard,
  onOpenHostingerModal,
}) => {
  const [copiedSlug, setCopiedSlug] = React.useState<string | null>(null);

  const publishedCards = cards.filter((c) => c.status === 'published');
  const totalViews = cards.reduce((acc, c) => acc + (c.viewsCount || 0), 0);

  const handleCopyLink = async (card: CardData) => {
    const url = `${window.location.origin}/#card=${card.slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedSlug(card.id);
    confetti({ particleCount: 25, spread: 60, origin: { y: 0.8 } });
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Plataforma Oficial &bull; LAV Digital Marketing</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Tarjetas de Presentación Digitales e Interactivas
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Crea, diseña y publica tarjetas modernas con códigos QR, tecnología NFC, catálogo de productos y enlace para guardar contactos directamente en el celular.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onNewCard}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Diseñar Nueva Tarjeta</span>
            </button>
            <button
              onClick={() => onSelectTab('templates')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Explorar Plantillas por Sector</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-600/10 via-pink-600/5 to-transparent pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total de Diseños</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">{cards.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Tarjetas Activas</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">{publishedCards.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Clientes Registrados</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">{clients.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Aperturas Totales</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">{totalViews.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics & Contact Clicks Performance Panel */}
      <AnalyticsPanel
        cards={cards}
        onPreviewCard={onPreviewCard}
        onEditCard={onEditCard}
      />

      {/* Free Phone App Installation Card & Guide */}
      <InstallAppInfoCard />

      {/* Recent Cards Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Tarjetas Recientes</h2>
            <p className="text-xs text-slate-400">Acceso rápido a edición, descarga de QR y publicación.</p>
          </div>
          <button
            onClick={() => onSelectTab('my-cards')}
            className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300"
          >
            <span>Ver todas ({cards.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.slice(0, 6).map((card) => (
            <div
              key={card.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        card.design.avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
                      }
                      alt={card.name}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-800 shadow"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition line-clamp-1">
                        {card.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-1">{card.businessName || card.jobTitle}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      card.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {card.status === 'published' ? 'Activa' : 'Borrador'}
                  </span>
                </div>

                <div className="text-xs text-slate-400 line-clamp-2 mb-4 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
                  {card.bio || 'Sin descripción redactada.'}
                </div>
              </div>

              {/* Action Buttons row */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-1 text-xs">
                <button
                  onClick={() => onEditCard(card)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-semibold transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopyLink(card)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Copiar enlace"
                  >
                    {copiedSlug === card.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() =>
                      downloadQr(`${window.location.origin}/#card=${card.slug}`, card.slug, 'png', {
                        colorDark: card.design.primaryColor,
                      })
                    }
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Descargar QR"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onOpenHostingerModal(card)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 transition"
                    title="Publicar en Hostinger (lavdigitalmkt.com)"
                  >
                    <Globe className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onPreviewCard(card)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Vista previa"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
