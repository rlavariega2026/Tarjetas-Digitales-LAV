import React, { useState, useMemo } from 'react';
import { CardData } from '../../types/card';
import {
  BarChart3,
  TrendingUp,
  MousePointerClick,
  Eye,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  DownloadCloud,
  ExternalLink,
  Edit3,
  Sparkles,
  Award,
  CheckCircle2,
  Share2,
} from 'lucide-react';

interface AnalyticsPanelProps {
  cards: CardData[];
  onPreviewCard: (card: CardData) => void;
  onEditCard: (card: CardData) => void;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  cards,
  onPreviewCard,
  onEditCard,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'views' | 'clicks' | 'ctr' | 'name'>('views');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Aggregated totals
  const totalViews = useMemo(() => {
    return cards.reduce((acc, c) => acc + (c.viewsCount || 0), 0);
  }, [cards]);

  const totalClicks = useMemo(() => {
    return cards.reduce((acc, c) => {
      const clicks = c.contactClicks ?? c.contactBreakdown?.total ?? 0;
      return acc + clicks;
    }, 0);
  }, [cards]);

  const channelsBreakdown = useMemo(() => {
    const res = {
      whatsapp: 0,
      saveContact: 0,
      call: 0,
      email: 0,
      map: 0,
    };

    cards.forEach((c) => {
      if (c.contactBreakdown) {
        res.whatsapp += c.contactBreakdown.whatsapp || 0;
        res.saveContact += c.contactBreakdown.saveContact || 0;
        res.call += c.contactBreakdown.call || 0;
        res.email += c.contactBreakdown.email || 0;
        res.map += c.contactBreakdown.map || 0;
      }
    });

    return res;
  }, [cards]);

  const avgCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    cards.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [cards]);

  // Max views for relative bar rendering
  const maxViews = useMemo(() => {
    return Math.max(...cards.map((c) => c.viewsCount || 0), 1);
  }, [cards]);

  // Top performing card by CTR
  const topCard = useMemo(() => {
    if (cards.length === 0) return null;
    return [...cards].sort((a, b) => {
      const ctrA = (a.viewsCount || 0) > 0 ? ((a.contactClicks || 0) / a.viewsCount) : 0;
      const ctrB = (b.viewsCount || 0) > 0 ? ((b.contactClicks || 0) / b.viewsCount) : 0;
      return ctrB - ctrA;
    })[0];
  }, [cards]);

  // Filtered and sorted cards
  const filteredCards = useMemo(() => {
    return cards
      .filter((c) => {
        const matchesSearch =
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.slug.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCat =
          selectedCategory === 'all' || c.category === selectedCategory;

        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        if (sortBy === 'views') {
          return (b.viewsCount || 0) - (a.viewsCount || 0);
        }
        if (sortBy === 'clicks') {
          const clicksA = a.contactClicks ?? a.contactBreakdown?.total ?? 0;
          const clicksB = b.contactClicks ?? b.contactBreakdown?.total ?? 0;
          return clicksB - clicksA;
        }
        if (sortBy === 'ctr') {
          const ctrA = (a.viewsCount || 0) > 0 ? ((a.contactClicks || 0) / a.viewsCount) : 0;
          const ctrB = (b.viewsCount || 0) > 0 ? ((b.contactClicks || 0) / b.viewsCount) : 0;
          return ctrB - ctrA;
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [cards, searchTerm, selectedCategory, sortBy]);

  // Export Analytics to CSV
  const handleExportCsv = () => {
    const headers = [
      'Tarjeta',
      'Negocio / Empresa',
      'Categoría',
      'Estado',
      'Visualizaciones',
      'Clics Totales',
      'Tasa de Conversión (CTR %)',
      'WhatsApp Clics',
      'Guardar Contacto vCard',
      'Llamar Clics',
      'Correo Clics',
      'Mapa Clics',
      'Enlace Slug',
    ];

    const rows = cards.map((c) => {
      const views = c.viewsCount || 0;
      const clicks = c.contactClicks ?? c.contactBreakdown?.total ?? 0;
      const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) + '%' : '0%';
      const bd = c.contactBreakdown || {
        whatsapp: 0,
        saveContact: 0,
        call: 0,
        email: 0,
        map: 0,
        total: 0,
      };

      return [
        `"${c.name.replace(/"/g, '""')}"`,
        `"${(c.businessName || '').replace(/"/g, '""')}"`,
        `"${c.category || 'General'}"`,
        c.status === 'published' ? 'Activa' : 'Borrador',
        views,
        clicks,
        ctr,
        bd.whatsapp,
        bd.saveContact,
        bd.call,
        bd.email,
        bd.map,
        `https://lavdigitalmkt.com/#card=${c.slug}`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `analiticas_tarjetas_lav_digital_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 flex-shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Panel de Analíticas & Métricas de Contacto
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Tiempo Real
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Supervisa cuántas veces ha sido visualizada cada tarjeta y los clics directos en los botones de contacto.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition shadow-sm"
            title="Descargar reporte en formato CSV (Excel)"
          >
            <DownloadCloud className="w-3.5 h-3.5 text-indigo-400" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Views */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/90 border border-indigo-500/20 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Visualizaciones Totales</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
            {totalViews.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
            <span className="text-indigo-400 font-semibold">
              ~{cards.length > 0 ? Math.round(totalViews / cards.length) : 0}
            </span>
            <span>promedio por tarjeta</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Total Contact Clicks */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/90 border border-emerald-500/20 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Clics Totales en Contacto</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2 tracking-tight">
            {totalClicks.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-semibold">
              WhatsApp, Llamadas, vCard, Mail
            </span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Conversion Rate (CTR) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/90 border border-amber-500/20 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Tasa de Conversión (CTR)</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-2 tracking-tight">
            {avgCtr}%
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
            <span className="text-amber-400 font-semibold">Alta interacción</span>
            <span>de cada visita</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Top Channel */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/90 border border-purple-500/20 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Canal #1 de Contacto</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-300 mt-2 tracking-tight">
            WhatsApp
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
            <span className="text-purple-400 font-semibold">
              {totalClicks > 0
                ? Math.round((channelsBreakdown.whatsapp / totalClicks) * 100)
                : 0}
              %
            </span>
            <span>del total de interacciones</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      {/* Channel Distribution & Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Channels Breakdown */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Distribución de Clics por Botón de Contacto
              </h3>
              <p className="text-xs text-slate-400">
                Dónde hacen clic tus prospectos al abrir tu tarjeta digital
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              {totalClicks} clics acumulados
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {/* WhatsApp */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-2 font-semibold text-slate-200">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </div>
                  WhatsApp Directo
                </span>
                <span className="font-bold text-emerald-400">
                  {channelsBreakdown.whatsapp.toLocaleString()} clics{' '}
                  <span className="text-slate-500 font-normal">
                    (
                    {totalClicks > 0
                      ? Math.round((channelsBreakdown.whatsapp / totalClicks) * 100)
                      : 0}
                    %)
                  </span>
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      totalClicks > 0
                        ? Math.max(5, (channelsBreakdown.whatsapp / totalClicks) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Guardar Contacto (vCard) */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-2 font-semibold text-slate-200">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Download className="w-3.5 h-3.5" />
                  </div>
                  Guardar en Agenda (vCard 3.0)
                </span>
                <span className="font-bold text-indigo-400">
                  {channelsBreakdown.saveContact.toLocaleString()} descargas{' '}
                  <span className="text-slate-500 font-normal">
                    (
                    {totalClicks > 0
                      ? Math.round((channelsBreakdown.saveContact / totalClicks) * 100)
                      : 0}
                    %)
                  </span>
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      totalClicks > 0
                        ? Math.max(5, (channelsBreakdown.saveContact / totalClicks) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Llamadas telefónicas */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-2 font-semibold text-slate-200">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  Llamada Telefónica Directa
                </span>
                <span className="font-bold text-purple-400">
                  {channelsBreakdown.call.toLocaleString()} clics{' '}
                  <span className="text-slate-500 font-normal">
                    (
                    {totalClicks > 0
                      ? Math.round((channelsBreakdown.call / totalClicks) * 100)
                      : 0}
                    %)
                  </span>
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      totalClicks > 0
                        ? Math.max(5, (channelsBreakdown.call / totalClicks) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Correo electrónico */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-2 font-semibold text-slate-200">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  Envío de Correo Electrónico
                </span>
                <span className="font-bold text-amber-400">
                  {channelsBreakdown.email.toLocaleString()} clics{' '}
                  <span className="text-slate-500 font-normal">
                    (
                    {totalClicks > 0
                      ? Math.round((channelsBreakdown.email / totalClicks) * 100)
                      : 0}
                    %)
                  </span>
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      totalClicks > 0
                        ? Math.max(5, (channelsBreakdown.email / totalClicks) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Ubicación / Google Maps */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-2 font-semibold text-slate-200">
                  <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  Cómo Llegar / Google Maps
                </span>
                <span className="font-bold text-rose-400">
                  {channelsBreakdown.map.toLocaleString()} clics{' '}
                  <span className="text-slate-500 font-normal">
                    (
                    {totalClicks > 0
                      ? Math.round((channelsBreakdown.map / totalClicks) * 100)
                      : 0}
                    %)
                  </span>
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-red-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      totalClicks > 0
                        ? Math.max(5, (channelsBreakdown.map / totalClicks) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Card Card */}
        {topCard && (
          <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-3">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Tarjeta con Mejor Rendimiento</span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <img
                  src={
                    topCard.design.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
                  }
                  alt={topCard.name}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/40"
                />
                <div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">{topCard.name}</h4>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {topCard.businessName || topCard.jobTitle}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Vistas</p>
                  <p className="text-base font-extrabold text-white mt-0.5">
                    {(topCard.viewsCount || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Clics Contacto</p>
                  <p className="text-base font-extrabold text-emerald-400 mt-0.5">
                    {(topCard.contactClicks ?? topCard.contactBreakdown?.total ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Esta tarjeta lidera la conversión gracias a sus botones de acción directos y llamado claro a WhatsApp y agenda telefónica.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2 mt-4">
              <button
                onClick={() => onPreviewCard(topCard)}
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Previsualizar</span>
              </button>
              <button
                onClick={() => onEditCard(topCard)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Sorting Controls */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, empresa, puesto o slug..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Todas las categorías ({cards.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="views">Más Visualizadas</option>
              <option value="clicks">Más Clics de Contacto</option>
              <option value="ctr">Mayor Conversión (CTR %)</option>
              <option value="name">Alfabético (A-Z)</option>
            </select>
          </div>

          {/* Toggle View */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tabla
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                viewMode === 'cards' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tarjetas
            </button>
          </div>
        </div>
      </div>

      {/* Cards Table or Grid */}
      {viewMode === 'table' ? (
        <div className="overflow-x-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase font-bold tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Tarjeta / Profesional</th>
                <th className="py-3.5 px-3">Categoría</th>
                <th className="py-3.5 px-3 text-right">Visualizaciones</th>
                <th className="py-3.5 px-3 text-right">Clics Totales</th>
                <th className="py-3.5 px-3 text-center">Tasa CTR</th>
                <th className="py-3.5 px-4 text-center">Desglose de Botones</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No se encontraron tarjetas con el filtro actual.
                  </td>
                </tr>
              ) : (
                filteredCards.map((card) => {
                  const views = card.viewsCount || 0;
                  const clicks = card.contactClicks ?? card.contactBreakdown?.total ?? 0;
                  const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : '0.0';
                  const ctrNum = parseFloat(ctr);
                  const bd = card.contactBreakdown || {
                    whatsapp: 0,
                    saveContact: 0,
                    call: 0,
                    email: 0,
                    map: 0,
                    total: 0,
                  };

                  return (
                    <tr
                      key={card.id}
                      className="hover:bg-slate-800/40 transition group"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              card.design.avatarUrl ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
                            }
                            alt={card.name}
                            className="w-10 h-10 rounded-xl object-cover bg-slate-800 flex-shrink-0"
                          />
                          <div className="min-w-0 max-w-[200px]">
                            <p className="font-bold text-white truncate group-hover:text-indigo-400 transition">
                              {card.name}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {card.businessName || card.jobTitle}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60 max-w-[130px] truncate">
                          {card.category || 'General'}
                        </span>
                      </td>

                      {/* Views Count */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="inline-flex flex-col items-end">
                          <span className="font-black text-sm text-white">
                            {views.toLocaleString()}
                          </span>
                          <div className="w-16 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${Math.max(5, (views / maxViews) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Contact Clicks */}
                      <td className="py-3.5 px-3 text-right">
                        <span className="font-black text-sm text-emerald-400">
                          {clicks.toLocaleString()}
                        </span>
                      </td>

                      {/* CTR % */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                            ctrNum >= 20
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : ctrNum >= 12
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {ctr}%
                        </span>
                      </td>

                      {/* Buttons Breakdown Icons */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* WhatsApp */}
                          <div
                            className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold"
                            title={`WhatsApp: ${bd.whatsapp} clics`}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{bd.whatsapp}</span>
                          </div>

                          {/* Save vCard */}
                          <div
                            className="flex items-center gap-1 text-[11px] text-indigo-400 font-semibold"
                            title={`Guardar Contacto: ${bd.saveContact} descargas`}
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{bd.saveContact}</span>
                          </div>

                          {/* Call */}
                          <div
                            className="flex items-center gap-1 text-[11px] text-purple-400 font-semibold"
                            title={`Llamar: ${bd.call} clics`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{bd.call}</span>
                          </div>

                          {/* Email */}
                          <div
                            className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold"
                            title={`Correo: ${bd.email} clics`}
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>{bd.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onPreviewCard(card)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="Previsualizar Tarjeta"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditCard(card)}
                            className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition"
                            title="Editar Tarjeta"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card) => {
            const views = card.viewsCount || 0;
            const clicks = card.contactClicks ?? card.contactBreakdown?.total ?? 0;
            const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : '0.0';
            const bd = card.contactBreakdown || {
              whatsapp: 0,
              saveContact: 0,
              call: 0,
              email: 0,
              map: 0,
              total: 0,
            };

            return (
              <div
                key={card.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
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
                        <h4 className="font-bold text-sm text-white line-clamp-1">{card.name}</h4>
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {card.businessName || card.jobTitle}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {card.category || 'General'}
                    </span>
                  </div>

                  {/* Metrics Box */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-3 text-center">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Vistas</p>
                      <p className="text-base font-black text-white mt-0.5">{views}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Clics</p>
                      <p className="text-base font-black text-emerald-400 mt-0.5">{clicks}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">CTR</p>
                      <p className="text-base font-black text-amber-400 mt-0.5">{ctr}%</p>
                    </div>
                  </div>

                  {/* Buttons mini summary */}
                  <div className="flex items-center justify-between text-xs px-1 text-slate-400 py-1 border-t border-slate-800/60">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <MessageCircle className="w-3.5 h-3.5" /> {bd.whatsapp}
                    </span>
                    <span className="flex items-center gap-1 text-indigo-400">
                      <Download className="w-3.5 h-3.5" /> {bd.saveContact}
                    </span>
                    <span className="flex items-center gap-1 text-purple-400">
                      <Phone className="w-3.5 h-3.5" /> {bd.call}
                    </span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <Mail className="w-3.5 h-3.5" /> {bd.email}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2 mt-3">
                  <button
                    onClick={() => onPreviewCard(card)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver</span>
                  </button>
                  <button
                    onClick={() => onEditCard(card)}
                    className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
