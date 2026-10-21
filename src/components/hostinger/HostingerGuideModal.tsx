import React, { useState } from 'react';
import {
  Server,
  Globe,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  FolderTree,
  FileCode,
  Smartphone,
  Sparkles,
  HelpCircle,
  X,
  ChevronRight,
  ArrowDownToLine,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface HostingerGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HostingerGuideModal: React.FC<HostingerGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'pasos' | 'opciones' | 'htaccess'>('pasos');
  const [copiedHtaccess, setCopiedHtaccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const htaccessCode = `# ===================================================================
# CONFIGURACIÓN HTACCESS PARA HOSTINGER (lavdigitalmkt.com)
# ===================================================================
RewriteEngine On
RewriteBase /

# 1. Forzar conexión segura HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# 2. Enrutamiento SPA para tarjetas digitales y panel
RewriteRule ^index\\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-l
RewriteRule . /index.html [L]

# 3. Tipos MIME para Manifest e Iconos PWA
<IfModule mod_mime.c>
  AddType application/manifest+json .webmanifest .json
  AddType application/javascript .js
  AddType image/svg+xml .svg
  AddType image/png .png
</IfModule>

# 4. Cabeceras Service Worker para permitir instalación móvil
<IfModule mod_headers.c>
  <FilesMatch "(sw\\.js)$">
    Header set Cache-Control "max-age=0, no-cache, no-store, must-revalidate"
    Header set Service-Worker-Allowed "/"
  </FilesMatch>
</IfModule>`;

  const handleDownloadZip = () => {
    setIsDownloading(true);
    // Trigger download of the ready-to-upload ZIP package from server
    const link = document.createElement('a');
    link.href = '/api/hostinger/download-bundle';
    link.download = 'lavdigitalmkt-tarjetas-hostinger.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => setIsDownloading(false), 2000);
  };

  const handleCopyHtaccess = async () => {
    try {
      await navigator.clipboard.writeText(htaccessCode);
      setCopiedHtaccess(true);
      setTimeout(() => setCopiedHtaccess(false), 2500);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = htaccessCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedHtaccess(true);
      setTimeout(() => setCopiedHtaccess(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
            <Server className="w-4 h-4 text-indigo-400" />
            <span>Integración Hostinger &bull; Dominio lavdigitalmkt.com</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Guía para conectar tus Tarjetas Digitales en <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Hostinger</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Publica la plataforma y tus tarjetas en tu propio hosting bajo tu dominio <strong>lavdigitalmkt.com</strong>. Al alojarlo en tu dominio propio, se resuelve definitivamente cualquier restricción de instalación en teléfonos móviles.
          </p>
        </div>

        {/* Highlight Download Action Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/40 p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Paquete de Producción Compilado</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Descargar Archivos Listos para Hostinger (.zip)
            </h3>
            <p className="text-xs text-slate-300 max-w-md">
              Incluye: <code className="text-indigo-300">index.html</code>, archivos JS/CSS compilados, iconos PWA, manifiesto, Service Worker y archivo <code className="text-indigo-300">.htaccess</code> pre-configurado para Hostinger.
            </p>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={isDownloading}
            className="flex-shrink-0 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 active:scale-95 transition"
          >
            <ArrowDownToLine className="w-5 h-5" />
            <span>{isDownloading ? 'Generando ZIP...' : 'Descargar Paquete ZIP'}</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab('pasos')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'pasos'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Paso a Paso en Hostinger</span>
          </button>

          <button
            onClick={() => setActiveTab('opciones')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'opciones'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>3 Formas de Conectar el Dominio</span>
          </button>

          <button
            onClick={() => setActiveTab('htaccess')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'htaccess'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Archivo .htaccess</span>
          </button>
        </div>

        {/* TAB 1: STEP BY STEP GUIDE */}
        {activeTab === 'pasos' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-300">
            <div className="grid grid-cols-1 gap-3">
              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 font-black flex items-center justify-center flex-shrink-0 text-sm">
                  1
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">Accede a tu hPanel de Hostinger</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Ingresa a <a href="https://hpanel.hostinger.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline font-semibold">hpanel.hostinger.com</a> con tus credenciales. En tu lista de planes de hosting, haz clic en el botón <strong>"Administrar"</strong> de tu dominio <strong>lavdigitalmkt.com</strong>.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 font-black flex items-center justify-center flex-shrink-0 text-sm">
                  2
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">Crea un Subdominio (Recomendado)</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Si ya tienes una página web en <code>lavdigitalmkt.com</code>, en el menú lateral izquierdo de Hostinger ve a <strong>"Avanzado" &gt; "Subdominios"</strong> y crea: <code className="text-indigo-300 font-bold">tarjetas</code>. Hostinger creará automáticamente la carpeta en tu servidor.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 font-black flex items-center justify-center flex-shrink-0 text-sm">
                  3
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">Abre el "Administrador de Archivos"</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    En hPanel, ve a <strong>"Archivos" &gt; "Administrador de Archivos"</strong>. Entra a la carpeta de tu subdominio (ej: <code>public_html/tarjetas</code>) o a la raíz <code>public_html</code>.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 font-black flex items-center justify-center flex-shrink-0 text-sm">
                  4
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">Sube y Descomprime el ZIP</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Toca el botón <strong>"Subir"</strong> (icono de flecha hacia arriba) y selecciona el archivo <code className="text-indigo-300">lavdigitalmkt-tarjetas-hostinger.zip</code> descargado. Una vez subido, haz clic derecho sobre el archivo y selecciona <strong>"Extraer"</strong> (o <em>Unzip</em>).
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center flex-shrink-0 text-sm">
                  5
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">Activa el Certificado SSL Gratis (HTTPS)</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    En hPanel ve a <strong>"Seguridad" &gt; "SSL"</strong> y confirma que el certificado SSL gratuito (Let's Encrypt) esté activo. Esto es imprescindible para que los celulares puedan instalar la PWA.
                  </p>
                </div>
              </div>

              {/* Step 6 */}
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center flex-shrink-0 text-sm">
                  6
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-emerald-300 text-sm">¡Listo! Instala desde tu propio dominio sin errores</h4>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Abre en tu celular: <code className="text-emerald-400 font-bold">https://tarjetas.lavdigitalmkt.com</code>. Toca el menú de Google Chrome o Safari e instala la app: como ahora está en tu propio dominio legítimo con SSL, <strong>Google la instalará de inmediato sin ningún error de bloqueo</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OPTIONS FOR DOMAIN CONNECTIVITY */}
        {activeTab === 'opciones' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Option 1 */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/40 space-y-2 relative">
                <span className="absolute top-3 right-3 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  RECOMENDADA
                </span>
                <h4 className="font-bold text-white text-sm pt-1">Opción 1: Subdominio</h4>
                <p className="text-[11px] font-mono text-indigo-300">
                  tarjetas.lavdigitalmkt.com
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ideal si ya tienes una web principal o tienda en <code>lavdigitalmkt.com</code>. No altera nada de tu web actual y crea un espacio profesional y limpio para todas las tarjetas.
                </p>
              </div>

              {/* Option 2 */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm">Opción 2: Subcarpeta</h4>
                <p className="text-[11px] font-mono text-emerald-300">
                  lavdigitalmkt.com/tarjetas/
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Crea una carpeta dentro de <code>public_html</code> llamada <code>tarjetas</code> y extrae el ZIP ahí. Tus clientes entrarán a <code>lavdigitalmkt.com/tarjetas/</code>.
                </p>
              </div>

              {/* Option 3 */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm">Opción 3: Dominio Principal</h4>
                <p className="text-[11px] font-mono text-purple-300">
                  https://lavdigitalmkt.com
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Si deseas que la página principal de <code>lavdigitalmkt.com</code> sea directamente este diseñador y catálogo de tarjetas digitales para tu agencia.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-indigo-300">
                <HelpCircle className="w-4 h-4" />
                <span>¿Cómo apuntar los códigos QR a lavdigitalmkt.com?</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Una vez que subas los archivos a Hostinger, todas las tarjetas y códigos QR se generarán con la URL de tu dominio (ej. <code>https://tarjetas.lavdigitalmkt.com/#card=carlos-santoro</code>). Así, cuando tus clientes escaneen los códigos QR o toquen las tarjetas NFC, verán siempre tu propia marca y tu dominio.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: HTACCESS CODE */}
        {activeTab === 'htaccess' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Archivo .htaccess (Incluido en el ZIP)</h4>
                <p className="text-[11px] text-slate-400">
                  Asegura que las URLs amigables no den error 404 en los servidores LiteSpeed/Apache de Hostinger.
                </p>
              </div>
              <button
                onClick={handleCopyHtaccess}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
              >
                {copiedHtaccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Código</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
              <pre>{htaccessCode}</pre>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Compatible con todos los planes de hosting de Hostinger</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadZip}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar ZIP para Hostinger</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
