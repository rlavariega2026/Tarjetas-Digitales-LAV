import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  QrCode,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { InstallModal } from '../pwa/InstallModal';

export const InstallAppInfoCard: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Instalación Gratuita &bull; Costo $0.00</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              ¿Cuánto cuesta descargar e instalar la app en mi teléfono?
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed">
              <strong className="text-emerald-400 font-extrabold text-base">
                ¡Es 100% GRATIS! No tienes que pagar nada ($0 pesos / $0 dólares).
              </strong>{' '}
              Esta aplicación está construida con tecnología <strong>PWA (Progressive Web App)</strong>. No requiere pagos de suscripción, ni compras dentro de la app, ni comisiones a Google Play Store o Apple App Store.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Compatible con Android e iPhone</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>No ocupa memoria de almacenamiento pesada</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Acceso directo con un solo toque</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-indigo-300 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>
                Para instalar <strong>LAV Tarjetas</strong> en tu teléfono en vez de Google AI Studio, escanea el código QR o usa el enlace directo.
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 flex-shrink-0">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition"
            >
              <Smartphone className="w-4 h-4" />
              <span>{installed ? 'App Ya Instalada (Ver QR)' : 'Instalar en mi Celular (Gratis)'}</span>
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
            >
              <QrCode className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ver Código QR y Pasos</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Comprehensive Install Modal with QR Code, Direct URL and Guide */}
      <InstallModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        deferredPrompt={deferredPrompt}
      />
    </>
  );
};
