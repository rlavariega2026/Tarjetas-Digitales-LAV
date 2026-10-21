import React, { useState } from 'react';
import { CardTemplate } from '../../data/templates';
import { CardData } from '../../types/card';
import { DigitalCardView } from '../card/DigitalCardView';
import { Sparkles, Eye, ArrowRight, Check, X, Wand2, Search, Zap, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TemplatesViewProps {
  templates: CardTemplate[];
  onSelectTemplate: (template: CardTemplate) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  templates,
  onSelectTemplate,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewTemplate, setPreviewTemplate] = useState<CardTemplate | null>(null);

  // Group collections
  const collectionOptions = [
    { id: 'all', label: 'Todas las Plantillas', icon: Sparkles },
    { id: 'elegance-luxury', label: 'A. Elegance Luxury', icon: Crown },
    { id: 'future-tech', label: 'B. Future Tech', icon: Zap },
    { id: 'young-creative', label: 'C. Young & Creative', icon: Wand2 },
    { id: 'minimal-studio', label: 'D. Minimal Studio', icon: Check },
    { id: 'glass-motion', label: 'E. Glass & Motion', icon: Sparkles },
    { id: 'business-signature', label: 'F. Business Signature', icon: Crown },
  ];

  const categories = Array.from(new Set(templates.map((t) => t.category)));

  const filteredTemplates = templates.filter((t) => {
    // Collection or category match
    const matchesFilter =
      selectedFilter === 'all' ||
      t.collection === selectedFilter ||
      t.category === selectedFilter;

    // Search query match
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      (t.badge && t.badge.toLowerCase().includes(q)) ||
      (t.animationPreview && t.animationPreview.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  const handleUseTemplate = (t: CardTemplate) => {
    confetti({ particleCount: 35, spread: 70, origin: { y: 0.6 } });
    onSelectTemplate(t);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-7">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-indigo-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Biblioteca Premium LAV Digital &bull; 6 Colecciones Exclusivas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Plantillas Digitales de Alta Gama
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Diseños con iluminación activa, animaciones fluidas a 60 FPS y composiciones especializadas para ejecutivos, tecnología, creadores y empresas.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por estilo, sector o efecto..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Collection & Sector Tabs */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {collectionOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedFilter === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedFilter(opt.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Additional Sector categories sub-filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
          <span className="text-slate-500 font-semibold uppercase tracking-wider px-1 text-[10px]">
            Sectores:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                selectedFilter === cat
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Count summary */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <span>Mostrando <strong>{filteredTemplates.length}</strong> plantillas disponibles</span>
        {selectedFilter !== 'all' && (
          <button
            onClick={() => setSelectedFilter('all')}
            className="text-indigo-400 hover:underline"
          >
            Ver todas las plantillas
          </button>
        )}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition duration-300 shadow-xl overflow-hidden flex flex-col justify-between group hover:-translate-y-1"
          >
            {/* Template Header Badge with Sector Gradient & Live visual cues */}
            <div className={`h-32 w-full p-4 bg-gradient-to-r ${template.thumbnailGradient} relative flex flex-col justify-between overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
              
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10">
                  {template.category}
                </span>
                {template.badge && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/90 text-slate-950 shadow-sm flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>{template.badge}</span>
                  </span>
                )}
              </div>

              <div className="relative z-10">
                <p className="text-white font-black text-lg tracking-tight drop-shadow-md">
                  {template.name}
                </p>
                {template.animationPreview && (
                  <p className="text-[10px] text-white/80 truncate font-medium flex items-center gap-1 mt-0.5">
                    <Wand2 className="w-2.5 h-2.5 text-cyan-300 flex-shrink-0" />
                    <span className="truncate">{template.animationPreview}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Template Info */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {template.description}
                </p>

                {/* Micro preview features */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60">
                    Fuente: {template.cardData.design.fontHeadline}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60">
                    Estilo: {template.cardData.design.theme}
                  </span>
                  {template.cardData.design.animationStyle && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-950/50 text-cyan-300 border border-cyan-800/50">
                      FX: {template.cardData.design.animationStyle}
                    </span>
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60">
                    {template.cardData.catalog.length > 0 ? 'Con catálogo' : 'Tarjeta ejecutiva'}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => setPreviewTemplate(template)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Previsualizar</span>
                </button>
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30"
                >
                  <span>Usar Plantilla</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-4 shadow-2xl flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-white">{previewTemplate.name}</h3>
                <p className="text-[11px] text-slate-400">{previewTemplate.category}</p>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable preview */}
            <div className="flex-1 overflow-y-auto py-4 flex justify-center">
              <div className="w-full max-w-[360px]">
                <DigitalCardView card={previewTemplate.cardData} />
              </div>
            </div>

            {/* Modal Bottom CTA */}
            <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  const t = previewTemplate;
                  setPreviewTemplate(null);
                  handleUseTemplate(t);
                }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition flex items-center justify-center gap-2"
              >
                <span>Comenzar a Editar con esta Plantilla</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
