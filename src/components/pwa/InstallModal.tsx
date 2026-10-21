import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  HelpCircle,
  X,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { generateQrPng } from '../../utils/qr';
import confetti from 'canvas-confetti';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt?: any;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isInIframe, setIsInIframe] = useState(false);

  // Fallback to shared URL if needed
  const fallbackUrl = 'https://ais-pre-kdhbv3esydjwbis2chm7a5-512952412413.us-west1.run.app';
  const directAppUrl = typeof window !== 'undefined'
    ? (window.location.origin.includes('run.app') ? window.location.origin : fallbackUrl)
    : fallbackUrl;

  useEffect(() => {
    // Detect if inside iframe
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }

    // Detect OS
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setActiveTab('ios');
    } else {
      setActiveTab('android');
    }

    // Generate QR Code for direct installation URL
    generateQrPng(directAppUrl, {
      width: 320,
      colorDark: '#0f172a',
      colorLight: '#ffffff',
      margin: 2,
    }).then(setQrDataUrl).catch(console.error);
  }, [directAppUrl]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(directAppUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback copy
      const input = document.createElement('input');
      input.value = directAppUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
        onClose();
      }
    } else {
      // If no deferred prompt, open direct URL in new window/tab
      window.open(directAppUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Instalación Gratuita &bull; App Independiente</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Cómo instalar <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">LAV Tarjetas</span> en tu celular
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Descarga la aplicación real de tarjetas digitales en tu pantalla de inicio sin pagar nada ($0.00) y úsala a pantalla completa como una app nativa.
          </p>
        </div>

        {/* Explanation Alert: Why AI Studio got installed before */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>¿Por qué se instaló "Google AI Studio" en vez de la app de tarjetas?</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Esto ocurrió porque estabas viendo la app en la ventana de edición de <strong>Google AI Studio</strong>. Cuando pulsas <em>"Instalar aplicación"</em> desde el menú de tu navegador en esa pantalla, tu navegador intenta instalar la página donde estás parado (el editor de AI Studio), no la aplicación creada.
          </p>
          <div className="pt-1 flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Check className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>Solución: Abre el enlace independiente directo de la app que te dejamos abajo.</span>
          </div>
        </div>

        {/* QR Code and Direct URL Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 items-center">
          {/* QR Code Card */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <div className="p-2.5 rounded-2xl bg-white shadow-xl flex items-center justify-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Código QR para instalar en celular"
                  className="w-40 h-40 object-contain rounded-lg"
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center text-slate-400 text-xs">
                  Generando código QR...
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                Escanea con la cámara de tu teléfono
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Abre la cámara de tu celular y apunta hacia aquí para abrir la app directamente
              </p>
            </div>
          </div>

          {/* Direct Link & Actions */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Enlace directo e independiente de la app:
              </label>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-[11px] font-mono text-indigo-300 break-all select-all">
                {directAppUrl}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-600/20 active:scale-98"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>¡Enlace Copiado al Portapapeles!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Enlace para WhatsApp o Celular</span>
                  </>
                )}
              </button>

              <a
                href={directAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
              >
                <ExternalLink className="w-4 h-4 text-slate-400" />
                <span>Abrir App en Pestaña Independiente</span>
              </a>

              {deferredPrompt && (
                <button
                  onClick={handleNativeInstall}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-600/25 active:scale-98"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Instalar Ahora Directamente (PWA)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Step-by-Step Instructions with Tabs */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-400">Instrucciones según tu teléfono:</span>
            <div className="flex gap-1.5 ml-auto">
              <button
                onClick={() => setActiveTab('android')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'android'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white bg-slate-800/50'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android (Chrome)</span>
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'ios'
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white bg-slate-800/50'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>iPhone / iPad (Safari)</span>
              </button>
            </div>
          </div>

          {activeTab === 'android' ? (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Pasos para celulares Android (Google Chrome):
              </h4>
              <ol className="text-xs text-slate-300 space-y-2.5 list-decimal list-inside pl-1 leading-relaxed">
                <li>
                  Abre el <strong>enlace directo</strong> en Google Chrome (escaneando el QR o pegando el enlace).
                </li>
                <li>
                  Toca los <strong>tres puntos verticales (⋮)</strong> en la esquina superior derecha de Google Chrome.
                </li>
                <li>
                  Selecciona la opción <strong>"Instalar aplicación"</strong> (o <em>"Agregar a pantalla principal"</em>).
                </li>
                <li>
                  Confirma <strong>"Instalar"</strong>. Verás que se instala con el icono morado de <strong>LAV Tarjetas</strong>. ¡Ya puedes usarla a pantalla completa!
                </li>
              </ol>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Pasos para iPhone o iPad (Safari):
              </h4>
              <ol className="text-xs text-slate-300 space-y-2.5 list-decimal list-inside pl-1 leading-relaxed">
                <li>
                  Abre el <strong>enlace directo</strong> en el navegador <strong>Safari</strong> de tu iPhone (escaneando el QR con tu cámara).
                </li>
                <li>
                  Toca el botón <strong>Compartir</strong> (icono de cuadrado con una flecha saliendo hacia arriba <span className="font-bold text-white">⎋</span>) en la barra inferior.
                </li>
                <li>
                  Desplaza hacia abajo en las opciones y toca <strong>"Agregar al inicio"</strong> (<em>"Add to Home Screen"</em>).
                </li>
                <li>
                  Toca <strong>"Agregar"</strong> arriba a la derecha. ¡Listo! Se creará el acceso de la app en tu pantalla con su icono oficial.
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Troubleshooting Section for "No se puede instalar esta app" */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>¿Te dice: «No se puede instalar esta app»? Soluciones rápidas:</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <strong className="text-white block font-bold">1. ¿Abriste el enlace desde WhatsApp?</strong>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                WhatsApp abre los enlaces en su navegador interno. Toca los <strong>tres puntos (⋮)</strong> en la esquina de WhatsApp y selecciona <strong>"Abrir en Chrome"</strong> o <strong>"Abrir en Safari"</strong>.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <strong className="text-white block font-bold">2. Usa «Agregar a la pantalla principal»</strong>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                En el menú (⋮) de Chrome, selecciona la opción <strong>"Agregar a la pantalla principal"</strong>. Esta opción crea el icono de la app en tu celular directamente.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <strong className="text-white block font-bold">3. Revisa que no sea pestaña de Incógnito</strong>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Google Chrome y Safari desactivan la instalación de apps en modo incógnito. Asegúrate de abrirlo en una pestaña normal.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <strong className="text-white block font-bold">4. Elimina el acceso viejo de AI Studio</strong>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Si quedó el icono de AI Studio en tu teléfono, mantenlo presionado y selecciona <strong>"Desinstalar"</strong> o <strong>"Eliminar"</strong> para evitar confusiones de nombres.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Costo total: $0.00 &bull; Sin compras dentro de la app</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
          >
            Entendido, cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
