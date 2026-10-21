import React, { useState } from 'react';
import {
  AppSettings,
  getAppSettings,
  saveAppSettings,
  exportDatabaseBackup,
  importDatabaseBackup,
} from '../../utils/storage';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import {
  Settings,
  Globe,
  Smartphone,
  Save,
  Download,
  Upload,
  Check,
  ShieldCheck,
  ExternalLink,
  Layers,
  HelpCircle,
  Server,
  ArrowDownToLine,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HostingerGuideModal } from '../hostinger/HostingerGuideModal';

interface SettingsViewProps {
  onRefreshData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onRefreshData }) => {
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string>('');
  const [showHostingerModal, setShowHostingerModal] = useState(false);
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveAppSettings(settings);
    setSavedSuccess(true);
    confetti({ particleCount: 25, spread: 60, origin: { y: 0.7 } });
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportBackup = () => {
    const jsonStr = exportDatabaseBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_lav_digital_marketing_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDatabaseBackup(content);
      if (success) {
        setImportStatus('¡Copia de seguridad restaurada correctamente!');
        onRefreshData();
        confetti({ particleCount: 40, spread: 70, origin: { y: 0.7 } });
      } else {
        setImportStatus('Error: El archivo no contiene un formato JSON válido de LAV Digital.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Configuración & Opciones del Sistema</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Personaliza los datos de LAV Digital Marketing, configuración de dominio y respaldos.
        </p>
      </div>

      {/* ANSWER TO USER QUESTION 1: PUBLICACIÓN EN lavdigitalmkt.com */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Publicar Tarjetas: en este servidor o en tu página lavdigitalmkt.com
            </h2>
            <p className="text-xs text-indigo-300">
              Dispones de ambas modalidades 100% integradas y funcionales sin costo adicional:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 pt-1">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <h3 className="font-bold text-indigo-400 text-sm">Opción A: Servidor Directo de la App</h3>
            <p className="leading-relaxed text-slate-300">
              Cada tarjeta tiene una URL activa de forma instantánea al presionar <strong>"Publicar"</strong>. Puedes compartirla vía enlace, código QR o programarla en tarjetas NFC inmediatamente.
            </p>
            <p className="text-[11px] text-slate-400">
              Formato: <code>{window.location.origin}/#card=[slug]</code>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <h3 className="font-bold text-emerald-400 text-sm">Opción B: En tu página lavdigitalmkt.com</h3>
            <p className="leading-relaxed text-slate-300">
              Toca el botón <strong>"Web lavdigitalmkt.com"</strong> en el editor o en "Mis Diseños" para descargar el archivo HTML completo e independiente.
            </p>
            <p className="text-[11px] text-slate-400">
              Sube ese archivo por cPanel o FTP a tu hosting (ej. en la carpeta <code>/tarjetas/cliente-nombre/index.html</code>) y se verá en tu propio dominio sin depender de ningún servicio externo.
            </p>
          </div>
        </div>
      </div>

      {/* ANSWER TO USER QUESTION 2: INSTALAR EN ANDROID */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">¿La app la puedo instalar en mi celular Android?</h2>
            <p className="text-xs text-emerald-300">
              ¡Sí, totalmente! La aplicación cuenta con arquitectura PWA (Progressive Web App) certificada.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
          <p>
            Puedes instalar <strong>LAV Digital Marketing</strong> como una aplicación nativa en tu teléfono Android:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-emerald-400 block mb-1">Paso 1: Abrir en Chrome</span>
              <p className="text-slate-400 text-[11px]">Abre el enlace de la aplicación en Google Chrome en tu Android.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-emerald-400 block mb-1">Paso 2: Tocar Menú</span>
              <p className="text-slate-400 text-[11px]">Toca los 3 puntos superiores de Chrome o el botón "Instalar en Celular" del encabezado.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-emerald-400 block mb-1">Paso 3: Instalar</span>
              <p className="text-slate-400 text-[11px]">Selecciona "Instalar aplicación". Se creará el icono oficial y funcionará sin barra de navegador.</p>
            </div>
          </div>

          {isInstallable && (
            <button
              onClick={install}
              className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow"
            >
              <Smartphone className="w-4 h-4" />
              <span>Instalar en este celular ahora</span>
            </button>
          )}
        </div>
      </div>

      {/* Agency Identity Form */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white">Datos de la Agencia LAV Digital Marketing</h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Nombre Comercial</label>
              <input
                type="text"
                value={settings.agencyName}
                onChange={(e) => setSettings({ ...settings, agencyName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Dominio / Sitio Web</label>
              <input
                type="text"
                value={settings.agencyWebsite}
                onChange={(e) => setSettings({ ...settings, agencyWebsite: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Correo de Contacto</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">WhatsApp de Soporte</label>
              <input
                type="text"
                value={settings.contactWhatsapp}
                onChange={(e) => setSettings({ ...settings, contactWhatsapp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" /> ¡Configuración guardada!
              </span>
            ) : (
              <div />
            )}
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Configuración</span>
            </button>
          </div>
        </form>
      </div>

      {/* Backup & Restore Data */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white">Copias de Seguridad & Respaldo</h2>
          <p className="text-xs text-slate-400">
            Descarga todas tus tarjetas, clientes y configuraciones en un archivo JSON o restáuralos cuando lo necesites.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Descargar Copia de Seguridad (JSON)</span>
          </button>

          <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Restaurar desde Respaldo</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>
        </div>

        {importStatus && (
          <p className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 p-3 rounded-xl border border-emerald-800">
            {importStatus}
          </p>
        )}
      </div>

      {/* Section 11: Free & Open Source Assurance */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-white font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Sin suscripciones obligatorias ni dependencias de pago</span>
        </div>
        <p className="leading-relaxed">
          Esta aplicación funciona de forma autónoma. Todas las características principales (editor visual, carga de archivos, generación de códigos QR de alta resolución, vCard 3.0, Web NFC, plantillas y exportación HTML para lavdigitalmkt.com) operan sin costos ocultos ni APIs de pago requeridas.
        </p>
      </div>
    </div>
  );
};
