import React from 'react';
import { CardData } from '../../types/card';
import { DigitalCardView } from './DigitalCardView';
import { downloadStandaloneHtmlFile } from '../../utils/exportHtml';
import { downloadQr } from '../../utils/qr';
import { X, ExternalLink, Globe, QrCode, Edit3, Share2, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PreviewModalProps {
  card: CardData | null;
  onClose: () => void;
  onEdit: (card: CardData) => void;
  onOpenHostingerModal?: (card: CardData) => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  card,
  onClose,
  onEdit,
  onOpenHostingerModal,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!card) return null;

  const publicUrl = `${window.location.origin}/#card=${card.slug}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    confetti({ particleCount: 20, spread: 60, origin: { y: 0.8 } });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        {/* Modal Top Header */}
        <div className="h-14 px-5 border-b border-slate-800 flex items-center justify-between flex-shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white">{card.name}</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full">
              /c/{card.slug}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Phone Frame Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-slate-950/80">
          <div className="w-full max-w-[390px]">
            <DigitalCardView card={card} />
          </div>
        </div>

        {/* Modal Bottom Action Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Copiar URL'}</span>
            </button>

            <button
              onClick={() =>
                downloadQr(publicUrl, card.slug, 'png', { colorDark: card.design.primaryColor })
              }
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              title="Descargar QR"
            >
              <QrCode className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (onOpenHostingerModal) onOpenHostingerModal(card);
                else downloadStandaloneHtmlFile(card);
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-semibold flex items-center gap-1.5 transition border border-indigo-500/20"
              title="Publicar en Hostinger (lavdigitalmkt.com)"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Publicar en Hostinger</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onEdit(card);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar Tarjeta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
