import React, { useState } from 'react';
import { Client } from '../../types/client';
import {
  FolderOpen,
  Image as ImageIcon,
  Wifi,
  Printer,
  Palette,
  FileCheck,
  Download,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';

interface AssetsViewProps {
  clients: Client[];
}

export const AssetsView: React.FC<AssetsViewProps> = ({ clients }) => {
  const [activeSubTab, setActiveSubTab] = useState<'bank' | 'nfc' | 'print' | 'palettes'>('bank');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Collect all files uploaded across all clients
  const allFiles = clients.flatMap((c) =>
    (c.files || []).map((f) => ({ ...f, clientName: c.name, clientCompany: c.company }))
  );

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Recursos Gráficos & Especificaciones</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Biblioteca de logotipos, fotografías, guías de impresión física y configuración de tarjetas NFC.
        </p>
      </div>

      {/* Sub-tab pills */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('bank')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'bank'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Banco de Archivos ({allFiles.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('nfc')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'nfc'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Wifi className="w-3.5 h-3.5" />
          <span>Guía de Tarjetas NFC</span>
        </button>
        <button
          onClick={() => setActiveSubTab('print')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'print'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Normas de Impresión Física</span>
        </button>
        <button
          onClick={() => setActiveSubTab('palettes')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'palettes'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Paletas & Armonías</span>
        </button>
      </div>

      {/* SUBTAB 1: FILE BANK */}
      {activeSubTab === 'bank' && (
        <div className="space-y-4">
          {allFiles.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {allFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between group hover:border-slate-700 transition"
                >
                  <div className="aspect-square rounded-xl bg-slate-950 p-3 flex items-center justify-center mb-2 overflow-hidden border border-slate-800/80">
                    <img
                      src={file.url}
                      alt={file.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white truncate">{file.name}</p>
                    <p className="text-[11px] text-indigo-400 truncate">{file.clientCompany || file.clientName}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{file.size}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl">
              <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">El banco de archivos está vacío</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Los logotipos y fotografías que subas en el editor o en la sección de Clientes aparecerán aquí organizados para reutilizarlos en cualquier tarjeta.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: NFC GUIDE */}
      {activeSubTab === 'nfc' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">¿Cómo funcionan las Tarjetas Digitales con NFC?</h2>
                <p className="text-xs text-slate-400">
                  Las tarjetas físicas LAV contienen un chip NFC sin batería. Al acercarlas a cualquier celular Android o iPhone moderno (sin instalar ninguna app adicional), se abre de inmediato la tarjeta digital.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-indigo-400 font-bold text-sm">1. Chips Recomendados</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Usa chips tipo <strong>NTAG213</strong> (144 bytes) o <strong>NTAG215</strong> (504 bytes). Son universales, ultrarrápidos y compatibles con el 100% de iPhones y Androids con NFC.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-indigo-400 font-bold text-sm">2. Grabación con Celular</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Puedes grabar la tarjeta directamente desde esta app en Chrome Android usando el botón <em>"Escribir en tarjeta NFC"</em>, o usando la aplicación gratuita <strong>NFC Tools</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-indigo-400 font-bold text-sm">3. Enlaces Estables</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Cada tarjeta de LAV Digital Marketing posee un slug o URL fija (ej. <code>/c/tu-nombre</code>). Si cambias tu teléfono, foto o catálogo en el editor, el chip NFC sigue funcionando sin reprogramar.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: PRINT SPECS */}
      {activeSubTab === 'print' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Especificaciones para Impresión Física</h2>
              <p className="text-xs text-slate-400">
                Pautas técnicas para imprentas locales o fabricantes de tarjetas plásticas y metálicas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-sm">Medidas y Proporciones</h3>
              <ul className="space-y-1.5 list-disc pl-4 text-slate-400">
                <li>Medida final cortada: <strong>85 x 54 mm</strong> (o 3.5 x 2 pulgadas).</li>
                <li>Sangrado de corte exterior (Bleed): <strong>3 mm</strong> por lado.</li>
                <li>Área segura para textos y logos: <strong>4 mm</strong> hacia adentro del corte.</li>
                <li>Radio de esquinas estándar: <strong>3 mm</strong> redondeado para PVC.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-sm">Resolución y Acabados</h3>
              <ul className="space-y-1.5 list-disc pl-4 text-slate-400">
                <li>Resolución de exportación: <strong>300 DPI</strong> mínimo.</li>
                <li>Modo de color: CMYK para imprenta offset / RGB para digital.</li>
                <li>Acabados sugeridos: Laminado Soft Touch mate, barniz a registro UV en logo, o tarjeta PVC mate con chip NTAG213 interno.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: PALETTES */}
      {activeSubTab === 'palettes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'Lujo & Consultoría VIP',
              desc: 'Negro ónix con detalles en oro cálido y marfil.',
              colors: ['#09090b', '#d97706', '#fbbf24', '#f4f4f5'],
            },
            {
              title: 'Salud, Bienestar & Dental',
              desc: 'Azul cobalto sereno, esmeralda y blanco quirúrgico.',
              colors: ['#0f172a', '#0284c7', '#10b981', '#f8fafc'],
            },
            {
              title: 'Gastronomía & Sabores',
              desc: 'Borgoña artesanal, canela y mostaza suave.',
              colors: ['#18181b', '#e11d48', '#b45309', '#fafaf9'],
            },
            {
              title: 'Tech, Startups & Software',
              desc: 'Gris espacial profundo con toques índigo y cian neón.',
              colors: ['#030712', '#6366f1', '#06b6d4', '#f1f5f9'],
            },
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div>
                <h3 className="font-bold text-sm text-white">{item.title}</h3>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
              <div className="flex h-12 rounded-xl overflow-hidden border border-slate-800">
                {item.colors.map((c, cIdx) => (
                  <div
                    key={cIdx}
                    className="flex-1 flex items-center justify-center text-[10px] font-mono font-bold text-white/90 drop-shadow"
                    style={{ backgroundColor: c }}
                  >
                    {c}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
