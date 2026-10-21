import React, { useState } from 'react';
import { CardData } from '../../types/card';
import { generateStandaloneHtml } from '../../utils/exportHtml';
import { downloadQr, generateQrPng } from '../../utils/qr';
import {
  Globe,
  Download,
  FolderPlus,
  Server,
  Check,
  Copy,
  ExternalLink,
  HelpCircle,
  X,
  FileCode,
  ShieldCheck,
  Infinity,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface HostingerExportModalProps {
  card: CardData | null;
  onClose: () => void;
}

export const HostingerExportModal: React.FC<HostingerExportModalProps> = ({ card, onClose }) => {
  const [basePath, setBasePath] = useState('https://lavdigitalmkt.com/tarjetas/');
  const [folderMode, setFolderMode] = useState<'subfolder' | 'direct-file'>('subfolder');
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!card) return null;

  const cleanSlug = card.slug || card.id;
  const finalCardUrl =
    folderMode === 'subfolder'
      ? `${basePath.endsWith('/') ? basePath : basePath + '/'}${cleanSlug}/`
      : `${basePath.endsWith('/') ? basePath : basePath + '/'}${cleanSlug}.html`;

  const handleDownload = (filename: string) => {
    // Generate standalone HTML with card website / target URL set to Hostinger URL
    const updatedCardForExport: CardData = {
      ...card,
      website: finalCardUrl,
    };

    const htmlContent = generateStandaloneHtml(updatedCardForExport);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
  };

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(finalCardUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col max-h-[92vh] text-white overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Publicar en Hostinger &bull; lavdigitalmkt.com</h2>
              <p className="text-xs text-slate-400">
                Tarjeta: <span className="text-white font-semibold">{card.name}</span> ({card.businessName || 'Empresa'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* How many cards reassurance */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Infinity className="w-5 h-5" />
            </div>
            <div className="text-xs space-y-1">
              <p className="font-bold text-indigo-300">¿Cuántas tarjetas puedo crear y alojar?</p>
              <p className="text-slate-300 leading-relaxed">
                <strong>¡Ilimitadas! No existe ningún límite ni costo mensual por tarjeta.</strong> Cada tarjeta es un archivo HTML estático ultraligero (~25 KB). En tu plan de Hostinger puedes alojar 10, 500 o miles de tarjetas independientes sin pagar licencias adicionales.
              </p>
            </div>
          </div>

          {/* URL Configuration */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              1. Configura la dirección final en tu sitio web
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={basePath}
                onChange={(e) => setBasePath(e.target.value)}
                placeholder="https://lavdigitalmkt.com/tarjetas/"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <div className="flex gap-1 bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setFolderMode('subfolder')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    folderMode === 'subfolder'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Carpeta (/index.html)
                </button>
                <button
                  onClick={() => setFolderMode('direct-file')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    folderMode === 'direct-file'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Archivo (.html)
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono text-purple-300">
              <span className="truncate mr-2">{finalCardUrl}</span>
              <button
                onClick={handleCopyUrl}
                className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg transition flex-shrink-0"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Copiada' : 'Copiar URL'}</span>
              </button>
            </div>
          </div>

          {/* Download Options */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              2. Descargar archivo para subir a Hostinger
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleDownload('index.html')}
                className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-purple-500 transition text-left space-y-1.5 group shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white group-hover:text-purple-300">
                    Descargar como index.html
                  </span>
                  <FileCode className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Ideal para crear la carpeta <code>tarjetas/{cleanSlug}/</code> en Hostinger y colocar este archivo dentro. La URL queda limpia sin extensión.
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 pt-1">
                  <Download className="w-3.5 h-3.5" /> Descargar index.html
                </span>
              </button>

              <button
                onClick={() => handleDownload(`${cleanSlug}.html`)}
                className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-purple-500 transition text-left space-y-1.5 group shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white group-hover:text-purple-300">
                    Descargar como {cleanSlug}.html
                  </span>
                  <FileCode className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Ideal si prefieres subirlo directo en una sola carpeta sin crear subcarpetas para cada cliente.
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 pt-1">
                  <Download className="w-3.5 h-3.5" /> Descargar {cleanSlug}.html
                </span>
              </button>
            </div>
          </div>

          {/* Step-by-Step Instructions for Hostinger */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              3. Pasos exactos en Hostinger (hPanel)
            </label>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2.5">
              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                  1
                </span>
                <p>
                  Inicia sesión en <strong>Hostinger (hostinger.com)</strong> y entra a tu <strong>hPanel</strong> en el dominio <code>lavdigitalmkt.com</code>.
                </p>
              </div>

              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                  2
                </span>
                <p>
                  Haz clic en <strong>"Administrador de archivos"</strong> (File Manager) y abre la carpeta <strong>public_html</strong>.
                </p>
              </div>

              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                  3
                </span>
                <p>
                  Si no existe, crea una carpeta llamada <strong>tarjetas</strong>. Dentro de ella, crea una carpeta con el nombre o slug del cliente (ejemplo: <code>{cleanSlug}</code>).
                </p>
              </div>

              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                  4
                </span>
                <p>
                  Entra a esa carpeta y sube el archivo <strong>index.html</strong> que acabas de descargar.
                </p>
              </div>

              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                  ✓
                </span>
                <p className="text-emerald-300 font-semibold">
                  ¡Listo! Abre en cualquier celular o navegador <strong>{finalCardUrl}</strong>. La tarjeta funcionará con WhatsApp, llamadas, vCard y código QR de forma autónoma.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Archivo autónomo con CSS, vCard, WhatsApp y QR incrustados.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
