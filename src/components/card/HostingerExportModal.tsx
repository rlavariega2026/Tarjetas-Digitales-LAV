import React, { useState } from 'react';
import { CardData } from '../../types/card';
import { generateStandaloneHtml } from '../../utils/exportHtml';
import { Globe, Download, Check, Copy, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HostingerExportModalProps {
  card: CardData | null;
  onClose: () => void;
}

const toSafeSlug = (value: string) =>
  value.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

export const HostingerExportModal: React.FC<HostingerExportModalProps> = ({ card, onClose }) => {
  const [clientFolder, setClientFolder] = useState('');
  const [cardFolder, setCardFolder] = useState('');
  const [publishToken, setPublishToken] = useState(() => {
    try { return window.localStorage.getItem('lav-hostinger-publish-token') || ''; }
    catch { return ''; }
  });
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [publishedUrl, setPublishedUrl] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [repairResult, setRepairResult] = useState('');

  if (!card) return null;

  const resolvedClientFolder = toSafeSlug(clientFolder || card.businessName || card.name || 'cliente');
  const resolvedCardFolder = toSafeSlug(cardFolder || card.slug || card.id || 'tarjeta');
  const finalCardUrl = publishedUrl || `https://lavdigitalmkt.com/tarjetas/${encodeURIComponent(resolvedClientFolder)}/${encodeURIComponent(resolvedCardFolder)}/index.html`;

  const handleDownload = (filename: string) => {
    const updatedCardForExport: CardData = { ...card, website: finalCardUrl };
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

  const handlePublish = async () => {
    setPublishing(true);
    setPublishError('');
    setPublishedUrl('');
    try {
      if (!publishToken.trim()) throw new Error('Escribe el token configurado en Hostinger.');
      try { window.localStorage.setItem('lav-hostinger-publish-token', publishToken.trim()); } catch {}
      if (!resolvedClientFolder || !resolvedCardFolder) throw new Error('Indica la carpeta del cliente y la carpeta de la tarjeta.');
      const targetUrl = `https://lavdigitalmkt.com/tarjetas/${encodeURIComponent(resolvedClientFolder)}/${encodeURIComponent(resolvedCardFolder)}/index.html`;
      const html = generateStandaloneHtml({ ...card, website: targetUrl });
      const response = await fetch('/tarjetas-digitales/api/publish-card.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + publishToken.trim() },
        body: JSON.stringify({ clientFolder: resolvedClientFolder, cardFolder: resolvedCardFolder, html }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok || !result.url) throw new Error(result.error || 'Error al publicar (' + response.status + ').');
      setPublishedUrl(result.url);
      await navigator.clipboard.writeText(result.url).catch(() => undefined);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.65 } });
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : 'No se pudo publicar la tarjeta.');
    } finally {
      setPublishing(false);
    }
  };

  const handleRepairExisting = async () => {
    setRepairing(true);
    setRepairResult('');
    setPublishError('');
    try {
      if (!publishToken.trim()) throw new Error('Escribe el token configurado en Hostinger.');
      try { window.localStorage.setItem('lav-hostinger-publish-token', publishToken.trim()); } catch {}
      const response = await fetch('/tarjetas-digitales/api/publish-card.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + publishToken.trim() },
        body: JSON.stringify({ action: 'repairExistingCards' }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error || 'No se pudieron corregir las tarjetas (' + response.status + ').');
      setRepairResult('Listo: ' + result.repaired + ' tarjeta(s) corregidas' + (result.skipped ? '; ' + result.skipped + ' omitida(s) porque ya estaban corregidas o no se pudieron modificar.' : '.') );
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : 'No se pudieron corregir las tarjetas existentes.');
    } finally {
      setRepairing(false);
    }
  };

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(finalCardUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col max-h-[92vh] text-white overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30"><Globe className="w-5 h-5" /></div>
            <div><h2 className="text-base font-bold">Publicar en Hostinger • lavdigitalmkt.com</h2><p className="text-xs text-slate-400">Tarjeta: <span className="text-white font-semibold">{card.name}</span> ({card.businessName || 'Empresa'})</p></div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-slate-300 space-y-3">
            <p className="font-bold text-indigo-300">Publicación directa</p>
            <p>Se creará una carpeta para el cliente y otra para esta tarjeta, con un index.html dentro.</p>
            <label className="block font-bold">Carpeta del cliente</label>
            <input value={clientFolder || toSafeSlug(card.businessName || card.name || 'cliente')} onChange={e => { setClientFolder(e.target.value); setPublishedUrl(''); }} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white" placeholder="raul-aguilar" />
            <label className="block font-bold">Carpeta / nombre de la tarjeta</label>
            <input value={cardFolder || toSafeSlug(card.slug || card.id || 'tarjeta')} onChange={e => { setCardFolder(e.target.value); setPublishedUrl(''); }} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white" placeholder="tarjetaraullav" />
            <label className="block font-bold pt-1">Token de publicación de Hostinger</label>
            <input type="password" value={publishToken} onChange={e => setPublishToken(e.target.value)} autoComplete="off" placeholder="Token exclusivo para publicar" className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono" />
            <p className="text-[11px] text-slate-500">El token se recuerda en este navegador para no pedirlo cada vez. No se incluye en el código público.</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-slate-300 space-y-3">
            <p className="font-bold text-amber-200">Corregir tarjetas que ya están publicadas</p>
            <p>Aplica el diseño de pantalla completa a los archivos que ya existen en la carpeta /tarjetas/, sin volver a publicar cada tarjeta una por una.</p>
            <button onClick={handleRepairExisting} disabled={repairing} className="w-full p-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white font-bold">{repairing ? 'Corrigiendo tarjetas existentes…' : 'Corregir todas las tarjetas publicadas'}</button>
            {repairResult && <p role="status" className="text-emerald-300">{repairResult}</p>}
          </div>
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">URL de la tarjeta</label>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono text-purple-300"><span className="break-all mr-2">{finalCardUrl}</span><button onClick={handleCopyUrl} className="flex items-center gap-1 text-[11px] bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg flex-shrink-0">{copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{copiedUrl ? 'Copiada' : 'Copiar URL'}</button></div>
            <button onClick={handlePublish} disabled={publishing} className="w-full p-4 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-bold text-sm">{publishing ? 'Publicando tarjeta…' : publishedUrl ? 'Volver a publicar esta tarjeta' : 'Publicar tarjeta directamente en Hostinger'}</button>
            {publishError && <p role="alert" className="text-xs text-red-300">{publishError}</p>}
            {publishedUrl && <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 space-y-2"><p className="font-bold">Tarjeta publicada</p><a className="underline break-all" href={publishedUrl} target="_blank" rel="noreferrer">{publishedUrl}</a><p>La URL se copió al portapapeles si el navegador lo permitió.</p></div>}
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2"><p className="font-bold text-white">Respaldo manual</p><p>Descarga el HTML si necesitas guardarlo aparte.</p><button onClick={() => handleDownload('index.html')} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 text-white font-bold"><Download className="w-4 h-4" /> Descargar index.html</button></div>
        </div>
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between"><span className="text-[11px] text-slate-400">Archivo autónomo con CSS, vCard, WhatsApp y QR incrustados.</span><button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300">Cerrar</button></div>
      </div>
    </div>
  );
};
