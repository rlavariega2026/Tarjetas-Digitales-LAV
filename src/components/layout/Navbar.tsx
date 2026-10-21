import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import {
  Sparkles,
  Plus,
  LayoutGrid,
  Users,
  Layers,
  FolderOpen,
  Settings,
  Download,
  Share2,
  Check,
  Smartphone,
  ExternalLink,
  Menu,
  X,
  Server,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { InstallModal } from '../pwa/InstallModal';
import { HostingerGuideModal } from '../hostinger/HostingerGuideModal';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onNewCard: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onNewCard,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showHostingerModal, setShowHostingerModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutGrid },
    { id: 'my-cards', label: 'Mis Diseños', icon: Layers },
    { id: 'templates', label: 'Plantillas', icon: Sparkles },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'assets', label: 'Recursos', icon: FolderOpen },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const handleInstallClick = () => {
    setShowInstallModal(true);
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 text-left focus:outline-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 shadow-lg group-hover:scale-105 transition-transform flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 text-base tracking-tighter">
                LAV
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                LAV Digital Marketing
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Diseñador & Administrador de Tarjetas Digitales
            </p>
          </div>
        </button>
      </div>

      {/* Desktop Navigation Links */}
      <nav className="hidden lg:flex items-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-slate-800 text-indigo-400 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Action Buttons: PWA Install + Create Card */}
      <div className="flex items-center gap-2.5">
        {/* PWA Install Button (Always visible on mobile/desktop until standalone) */}
        {!isInstalled && (
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition shadow-sm"
            title="Instalar en celular Android o iPhone"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Instalar en Celular</span>
            <span className="sm:hidden">App</span>
          </button>
        )}

        {/* Hostinger Integration Button */}
        <button
          onClick={() => setShowHostingerModal(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/30 text-xs font-semibold text-indigo-200 transition shadow-sm"
          title="Conectar con Hostinger (lavdigitalmkt.com)"
        >
          <Server className="w-3.5 h-3.5 text-indigo-400" />
          <span>Hostinger</span>
        </button>

        {/* Primary CTA: Nueva Tarjeta */}
        <button
          onClick={onNewCard}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Crear Tarjeta</span>
          <span className="sm:hidden">Crear</span>
        </button>

        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bg-slate-900 border-b border-slate-800 p-4 space-y-1 shadow-2xl z-50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => {
              setShowHostingerModal(true);
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-950/40 border border-indigo-500/20 hover:bg-indigo-900/40 transition mt-2"
          >
            <Server className="w-4 h-4 text-indigo-400" />
            <span>Guía Hostinger (lavdigitalmkt.com)</span>
          </button>
        </div>
      )}

      {/* Unified Installation Modal with QR Code and Direct URL */}
      <InstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />

      {/* Hostinger Guide & ZIP Bundle Modal */}
      <HostingerGuideModal
        isOpen={showHostingerModal}
        onClose={() => setShowHostingerModal(false)}
      />
    </header>
  );
};
