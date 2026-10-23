import React from 'react';
import { Building2, CarFront, MapPin, Tag } from 'lucide-react';
import { CardData, ListingDetails } from '../../types/card';

interface ListingDetailsEditorProps {
  card: CardData;
  onChange: (listing: ListingDetails) => void;
}

const inputClass = 'w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500';
const labelClass = 'mb-1 block text-[11px] font-medium text-slate-400';

export const ListingDetailsEditor: React.FC<ListingDetailsEditorProps> = ({ card, onChange }) => {
  const listing: ListingDetails = card.listing || { kind: 'real-estate', currency: 'MXN', showDetails: true };
  const set = (field: keyof ListingDetails, value: string | boolean | string[]) => onChange({ ...listing, [field]: value });

  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-white"><Tag className="h-4 w-4 text-indigo-400" />Ficha comercial</h3>
        <p className="text-xs leading-relaxed text-slate-400">Todos los datos de esta sección son opcionales. Solo aparecerán en la tarjeta pública los campos que tengan información.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => set('kind', 'real-estate')} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-bold ${listing.kind !== 'vehicle' ? 'border-indigo-400 bg-indigo-600/20 text-white' : 'border-slate-700 bg-slate-800 text-slate-400'}`}><Building2 className="h-4 w-4" />Bienes raíces</button>
        <button type="button" onClick={() => set('kind', 'vehicle')} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-bold ${listing.kind === 'vehicle' ? 'border-indigo-400 bg-indigo-600/20 text-white' : 'border-slate-700 bg-slate-800 text-slate-400'}`}><CarFront className="h-4 w-4" />Vehículos</button>
      </div>
      <label className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950/50 p-3 text-xs text-slate-300">
        <span>Mostrar ficha comercial en la tarjeta</span>
        <input type="checkbox" checked={listing.showDetails !== false} onChange={e => set('showDetails', e.target.checked)} className="h-4 w-4 accent-indigo-500" />
      </label>
      {listing.kind !== 'vehicle' ? (
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-bold uppercase tracking-wide text-indigo-300"><Building2 className="h-4 w-4" />Datos del inmueble</h4>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={labelClass}>Tipo de inmueble</label><select value={listing.propertyType || ''} onChange={e => set('propertyType', e.target.value)} className={inputClass}><option value="">Seleccionar (opcional)</option>{['Terreno','Casa','Departamento','Local comercial','Oficina','Bodega','Rancho','Propiedad rural','Desarrollo inmobiliario','Otro'].map(v => <option key={v}>{v}</option>)}</select></div>
            <div><label className={labelClass}>Operación</label><select value={listing.operation || ''} onChange={e => set('operation', e.target.value)} className={inputClass}><option value="">No especificada</option>{['Venta','Renta','Renta temporal','Traspaso','Preventa'].map(v => <option key={v}>{v}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={labelClass}>Precio</label><input value={listing.price || ''} onChange={e => set('price', e.target.value)} placeholder="Ej. 1,250,000" className={inputClass} /></div>
            <div><label className={labelClass}>Moneda</label><select value={listing.currency || 'MXN'} onChange={e => set('currency', e.target.value)} className={inputClass}><option value="MXN">MXN — Peso mexicano</option><option value="USD">USD — Dólar estadounidense</option><option value="EUR">EUR — Euro</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={labelClass}>Terreno (m²)</label><input value={listing.areaM2 || ''} onChange={e => set('areaM2', e.target.value)} placeholder="Ej. 300" className={inputClass} /></div>
            <div><label className={labelClass}>Construcción (m²)</label><input value={listing.builtAreaM2 || ''} onChange={e => set('builtAreaM2', e.target.value)} placeholder="Ej. 180" className={inputClass} /></div>
            <div><label className={labelClass}>Habitaciones</label><input value={listing.bedrooms || ''} onChange={e => set('bedrooms', e.target.value)} placeholder="Ej. 3" className={inputClass} /></div>
            <div><label className={labelClass}>Baños</label><input value={listing.bathrooms || ''} onChange={e => set('bathrooms', e.target.value)} placeholder="Ej. 2.5" className={inputClass} /></div>
            <div><label className={labelClass}>Estacionamientos</label><input value={listing.parkingSpaces || ''} onChange={e => set('parkingSpaces', e.target.value)} placeholder="Ej. 2" className={inputClass} /></div>
            <div><label className={labelClass}>Uso de suelo</label><input value={listing.landUse || ''} onChange={e => set('landUse', e.target.value)} placeholder="Ej. Habitacional" className={inputClass} /></div>
          </div>
          <div><label className={labelClass}>Situación documental (declarada)</label><input value={listing.titleStatus || ''} onChange={e => set('titleStatus', e.target.value)} placeholder="Ej. Escrituras disponibles" className={inputClass} /></div>
        </div>
      ) : (
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-bold uppercase tracking-wide text-indigo-300"><CarFront className="h-4 w-4" />Datos del vehículo</h4>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={labelClass}>Marca</label><input value={listing.make || ''} onChange={e => set('make', e.target.value)} placeholder="Ej. Toyota" className={inputClass} /></div>
            <div><label className={labelClass}>Modelo</label><input value={listing.model || ''} onChange={e => set('model', e.target.value)} placeholder="Ej. Corolla" className={inputClass} /></div>
            <div><label className={labelClass}>Versión</label><input value={listing.version || ''} onChange={e => set('version', e.target.value)} placeholder="Ej. SE" className={inputClass} /></div>
            <div><label className={labelClass}>Año</label><input value={listing.year || ''} onChange={e => set('year', e.target.value)} placeholder="Ej. 2023" className={inputClass} /></div>
            <div><label className={labelClass}>Precio</label><input value={listing.price || ''} onChange={e => set('price', e.target.value)} placeholder="Ej. 285,000" className={inputClass} /></div>
            <div><label className={labelClass}>Moneda</label><select value={listing.currency || 'MXN'} onChange={e => set('currency', e.target.value)} className={inputClass}><option value="MXN">MXN</option><option value="USD">USD</option><option value="EUR">EUR</option></select></div>
            <div><label className={labelClass}>Kilometraje</label><input value={listing.mileage || ''} onChange={e => set('mileage', e.target.value)} placeholder="Ej. 45,000 km" className={inputClass} /></div>
            <div><label className={labelClass}>Transmisión</label><select value={listing.transmission || ''} onChange={e => set('transmission', e.target.value)} className={inputClass}><option value="">No especificada</option>{['Automática','Manual','CVT','Otra'].map(v => <option key={v}>{v}</option>)}</select></div>
            <div><label className={labelClass}>Combustible</label><select value={listing.fuel || ''} onChange={e => set('fuel', e.target.value)} className={inputClass}><option value="">No especificado</option>{['Gasolina','Diésel','Híbrido','Eléctrico','Gas LP','Otro'].map(v => <option key={v}>{v}</option>)}</select></div>
            <div><label className={labelClass}>Motor</label><input value={listing.engine || ''} onChange={e => set('engine', e.target.value)} placeholder="Ej. 2.0 L" className={inputClass} /></div>
            <div><label className={labelClass}>Color exterior</label><input value={listing.exteriorColor || ''} onChange={e => set('exteriorColor', e.target.value)} placeholder="Ej. Gris" className={inputClass} /></div>
            <div><label className={labelClass}>Condición</label><select value={listing.condition || ''} onChange={e => set('condition', e.target.value)} className={inputClass}><option value="">No especificada</option>{['Nuevo','Seminuevo','Usado','Restaurado'].map(v => <option key={v}>{v}</option>)}</select></div>
          </div>
        </div>
      )}
      <div className="space-y-3 border-t border-slate-800 pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wide text-slate-300">Ubicación y portales (opcionales)</h4>
        <div><label className={labelClass}><MapPin className="mr-1 inline h-3 w-3" />Enlace de Google Maps</label><input value={card.googleMapsUrl || ''} onChange={e => onChange({ ...listing })} readOnly className={inputClass + ' opacity-60'} placeholder="Configúralo en la pestaña Info" /><p className="mt-1 text-[10px] text-slate-500">La dirección y el mapa se editan en la pestaña Info.</p></div>
        <div><label className={labelClass}>Facebook Marketplace</label><input value={listing.marketplaceUrl || ''} onChange={e => set('marketplaceUrl', e.target.value)} placeholder="https://www.facebook.com/marketplace/..." className={inputClass} /></div>
        <div><label className={labelClass}>Mercado Libre</label><input value={listing.mercadoLibreUrl || ''} onChange={e => set('mercadoLibreUrl', e.target.value)} placeholder="https://articulo.mercadolibre.com.mx/..." className={inputClass} /></div>
      </div>
    </div>
  );
};
