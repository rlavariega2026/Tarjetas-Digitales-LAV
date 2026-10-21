import React, { useState } from 'react';
import { CardData } from '../../types/card';
import { downloadStandaloneHtmlFile } from '../../utils/exportHtml';
import { downloadQr } from '../../utils/qr';
import {
  Search,
  Filter,
  Plus,
  Edit3,
  Copy,
  Trash2,
  QrCode,
  Globe,
  Eye,
  Check,
  Layers,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MyCardsViewProps {
  cards: CardData[];
  onNewCard: () => void;
  onEditCard: (card: CardData) => void;
  onDuplicateCard: (card: CardData) => void;
  onDeleteCard: (id: string) => void;
  onPreviewCard: (card: CardData) => void;
  onOpenHostingerModal: (card: CardData) => void;
}

export const MyCardsView: React.FC<MyCardsViewProps> = ({
  cards,
  onNewCard,
  onEditCard,
  onDuplicateCard,
  onDeleteCard,
  onPreviewCard,
  onOpenHostingerModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cardToDelete, setCardToDelete] = useState<CardData | null>(null);

  // Extract unique categories
  const categories = ['all', ...Array.from(new Set(cards.map((c) => c.category).filter(Boolean)))];

  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || card.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCopy = async (card: CardData) => {
    const url = `${window.location.origin}/#card=${card.slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(card.id);
    confetti({ particleCount: 20, spread: 50, origin: { y: 0.8 } });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const confirmDelete = (card: CardData) => {
    setCardToDelete(card);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Mis Diseños de Tarjetas</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Administra, edita, duplica y publica tarjetas digitales interactivas para tus clientes.
          </p>
        </div>
        <button
          onClick={onNewCard}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Nueva Tarjeta</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, empresa o cargo..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Category selector */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
          >
            <option value="all">Todas las Categorías ({cards.length})</option>
            {categories
              .filter((c) => c !== 'all')
              .map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
          </select>
        </div>

        {/* Status selector */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
          >
            <option value="all">Todos los Estados</option>
            <option value="published">Solo Publicadas</option>
            <option value="draft">Solo Borradores</option>
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-md transition flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Mini Banner */}
              <div
                className="h-20 w-full relative p-3 flex items-start justify-between"
                style={{
                  background: `linear-gradient(135deg, ${card.design.primaryColor}, ${card.design.secondaryColor})`,
                  backgroundImage: card.design.bannerUrl ? `url('${card.design.bannerUrl}')` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md ${
                    card.status === 'published'
                      ? 'bg-emerald-500/80 text-white'
                      : 'bg-black/60 text-amber-300'
                  }`}
                >
                  {card.status === 'published' ? 'Publicada' : 'Borrador'}
                </span>

                <span className="text-[10px] bg-black/60 backdrop-blur-md text-white font-mono px-2 py-0.5 rounded-full">
                  /c/{card.slug}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 -mt-8 mb-2">
                    <img
                      src={
                        card.design.avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
                      }
                      alt={card.name}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-800 ring-2 ring-slate-900 shadow-md"
                    />
                    {card.design.logoUrl && (
                      <img
                        src={card.design.logoUrl}
                        alt="Logo"
                        className="max-h-8 max-w-[80px] object-contain ml-auto"
                      />
                    )}
                  </div>

                  <h3 className="font-extrabold text-base text-white group-hover:text-indigo-300 transition line-clamp-1">
                    {card.name}
                  </h3>
                  <p className="text-xs text-indigo-400 font-semibold line-clamp-1">
                    {card.businessName || 'Sin empresa asignada'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{card.jobTitle}</p>

                  {card.bio && (
                    <p className="text-xs text-slate-400 line-clamp-2 mt-2 bg-slate-950/40 p-2 rounded-xl border border-slate-800">
                      {card.bio}
                    </p>
                  )}
                </div>

                {/* Card Actions Bottom Bar */}
                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditCard(card)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center gap-1 shadow-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => onDuplicateCard(card)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Duplicar diseño"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(card)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Copiar enlace"
                    >
                      {copiedId === card.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() =>
                        downloadQr(`${window.location.origin}/#card=${card.slug}`, card.slug, 'png', {
                          colorDark: card.design.primaryColor,
                        })
                      }
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Descargar Código QR"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenHostingerModal(card)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 transition"
                      title="Publicar en Hostinger (lavdigitalmkt.com)"
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onPreviewCard(card)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Vista previa completa"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => confirmDelete(card)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition"
                      title="Eliminar tarjeta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 p-6 rounded-3xl bg-slate-900 border border-slate-800">
          <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No se encontraron tarjetas</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Intenta cambiar los términos de búsqueda o filtros, o crea un nuevo diseño desde cero.
          </p>
          <button
            onClick={onNewCard}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
          >
            Crear Nueva Tarjeta
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {cardToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 text-white shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-rose-400">¿Eliminar tarjeta?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              ¿Estás seguro de que deseas eliminar permanentemente la tarjeta de <strong>"{cardToDelete.name}"</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCardToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteCard(cardToDelete.id);
                  setCardToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
