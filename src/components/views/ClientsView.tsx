import React, { useState } from 'react';
import { Client, ClientFile } from '../../types/client';
import { CardData } from '../../types/card';
import { saveOrUpdateClient, deleteClient } from '../../utils/storage';
import { optimizeImageFile } from '../../utils/imageOptimizer';
import {
  Users,
  Plus,
  Search,
  FolderOpen,
  Mail,
  Phone,
  Briefcase,
  Trash2,
  Edit2,
  FileText,
  Upload,
  Check,
  X,
  CreditCard,
  Image as ImageIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ClientsViewProps {
  clients: Client[];
  cards: CardData[];
  onClientsChange: () => void;
  onCreateCardForClient: (client: Client) => void;
  onEditCard: (card: CardData) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  cards,
  onClientsChange,
  onCreateCardForClient,
  onEditCard,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // New Client Form State
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newClient: Client = {
      id: `cli-${Date.now()}`,
      name: newName.trim(),
      company: newCompany.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim(),
      category: newCategory.trim() || 'General',
      notes: newNotes.trim(),
      assignedCardIds: [],
      files: [],
      createdAt: new Date().toISOString(),
    };

    saveOrUpdateClient(newClient);
    onClientsChange();
    setShowAddModal(false);
    resetForm();
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
  };

  const resetForm = () => {
    setNewName('');
    setNewCompany('');
    setNewEmail('');
    setNewPhone('');
    setNewCategory('');
    setNewNotes('');
  };

  const handleDeleteClient = (client: Client) => {
    setClientToDelete(client);
  };

  const handleFileUploadForClient = async (e: React.ChangeEvent<HTMLInputElement>, client: Client) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const optimizedDataUrl = await optimizeImageFile(file, 600, 600, 0.88);
      const newFile: ClientFile = {
        id: `file-${Date.now()}`,
        name: file.name,
        type: file.name.toLowerCase().includes('logo') ? 'logo' : 'photo',
        url: optimizedDataUrl,
        size: `${Math.round(file.size / 1024)} KB`,
        uploadedAt: new Date().toISOString(),
      };

      const updated = {
        ...client,
        files: [...(client.files || []), newFile],
      };

      saveOrUpdateClient(updated);
      setSelectedClient(updated);
      onClientsChange();
      confetti({ particleCount: 20, spread: 50, origin: { y: 0.7 } });
    } catch (err) {
      console.error('Error optimizing client file:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Administración de Clientes</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Gestiona empresas, contactos y biblioteca de logotipos e imágenes por cliente.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Cliente</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por cliente, empresa o sector..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Main Grid: Clients List + Details/Media Bank Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clients List (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => {
              const clientCards = cards.filter(
                (c) => c.clientId === client.id || client.assignedCardIds?.includes(c.id)
              );

              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    selectedClient?.id === client.id
                      ? 'bg-slate-900 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white">{client.name}</h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                        {client.category}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-300">{client.company || 'Sin empresa'}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      {client.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{client.phone}</span>
                        </span>
                      )}
                      {client.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>{client.email}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-indigo-400">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{clientCards.length} tarjeta(s) vinculada(s)</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateCardForClient(client);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-bold transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Crear Tarjeta</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClient(client);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
                      title="Eliminar cliente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl">
              <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No se encontraron clientes registrados.</p>
            </div>
          )}
        </div>

        {/* Client Details & File Bank Panel (1 col) */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-5 h-fit">
          {selectedClient ? (
            <>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Detalles del Cliente
                </span>
                <h2 className="text-lg font-bold text-white mt-1">{selectedClient.name}</h2>
                <p className="text-xs text-indigo-400 font-semibold">{selectedClient.company}</p>
                {selectedClient.notes && (
                  <p className="text-xs text-slate-400 mt-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    {selectedClient.notes}
                  </p>
                )}
              </div>

              {/* Media & Files Bank for this client */}
              <div className="border-t border-slate-800 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Biblioteca de Archivos
                    </h3>
                    <p className="text-[11px] text-slate-400">Logos y fotos reutilizables en tarjetas.</p>
                  </div>
                  <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUploadForClient(e, selectedClient)}
                      className="hidden"
                    />
                  </label>
                </div>

                {selectedClient.files && selectedClient.files.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedClient.files.map((file) => (
                      <div
                        key={file.id}
                        className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col items-center text-center group relative overflow-hidden"
                      >
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-16 h-16 object-contain rounded-lg bg-slate-950 p-1 mb-1.5"
                        />
                        <span className="text-[10px] text-slate-300 font-medium truncate w-full">
                          {file.name}
                        </span>
                        <span className="text-[9px] text-slate-500">{file.size}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-slate-800 rounded-2xl p-3">
                    <FolderOpen className="w-6 h-6 mx-auto text-slate-600 mb-1" />
                    <p className="text-xs text-slate-400">Sin archivos aún.</p>
                    <p className="text-[10px] text-slate-500">Sube logotipos o imágenes para este cliente.</p>
                  </div>
                )}
              </div>

              {/* Linked Cards for this client */}
              <div className="border-t border-slate-800 pt-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Tarjetas Diseñadas
                </h3>
                {cards.filter((c) => c.clientId === selectedClient.id || selectedClient.assignedCardIds?.includes(c.id))
                  .length > 0 ? (
                  <div className="space-y-2">
                    {cards
                      .filter(
                        (c) => c.clientId === selectedClient.id || selectedClient.assignedCardIds?.includes(c.id)
                      )
                      .map((c) => (
                        <div
                          key={c.id}
                          className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-xs font-bold text-white">{c.name}</p>
                            <p className="text-[10px] text-slate-400">/c/{c.slug}</p>
                          </div>
                          <button
                            onClick={() => onEditCard(c)}
                            className="px-2 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white text-[11px] font-semibold transition"
                          >
                            Abrir
                          </button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">
                    <p>No hay tarjetas asignadas aún.</p>
                    <button
                      onClick={() => onCreateCardForClient(selectedClient)}
                      className="mt-2 text-indigo-400 font-bold hover:underline"
                    >
                      + Diseñar primera tarjeta
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Users className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-xs">Selecciona un cliente para ver sus detalles, tarjetas y biblioteca de archivos.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-base">Registrar Nuevo Cliente</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddClient} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nombre del Cliente *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej. Carlos Santoro"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Empresa o Negocio</label>
                <input
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej. Bistró Del Valle"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                    placeholder="+52 55..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Sector / Categoría</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                    placeholder="Gastronomía, Salud..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                  placeholder="cliente@correo.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Notas Internas</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                  placeholder="Requerimientos específicos, preferencias de color, etc."
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Delete Confirmation Modal */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 text-white shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-rose-400">¿Eliminar cliente?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              ¿Estás seguro de que deseas eliminar al cliente <strong>"{clientToDelete.name}"</strong>? Esto no borrará las tarjetas ya creadas, pero desvinculará sus archivos.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setClientToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  deleteClient(clientToDelete.id);
                  if (selectedClient?.id === clientToDelete.id) setSelectedClient(null);
                  setClientToDelete(null);
                  onClientsChange();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
