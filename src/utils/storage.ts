import { CardData } from '../types/card';
import { Client } from '../types/client';
import { INITIAL_TEMPLATES, CardTemplate } from '../data/templates';

const STORAGE_KEYS = {
  CARDS: 'lav_digital_cards_v1',
  CLIENTS: 'lav_digital_clients_v1',
  TEMPLATES: 'lav_digital_templates_v1',
  SETTINGS: 'lav_digital_settings_v1',
};

export interface AppSettings {
  agencyName: string;
  agencyWebsite: string;
  contactEmail: string;
  contactWhatsapp: string;
  customDomain: string; // e.g. lavdigitalmkt.com
  enableAutoBackup: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  agencyName: 'LAV Digital Marketing',
  agencyWebsite: 'https://lavdigitalmkt.com',
  contactEmail: 'contacto@lavdigitalmkt.com',
  contactWhatsapp: '+52 55 1234 5678',
  customDomain: 'lavdigitalmkt.com',
  enableAutoBackup: true,
};

const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-santoro',
    name: 'Carlos Santoro',
    company: 'Bistró Del Valle & Café',
    email: 'carlos@bistrodelvalle.com',
    phone: '+52 55 1234 5678',
    category: 'Restaurantes y cafeterías',
    notes: 'Cliente preferencial. Tarjeta física impresa + tarjeta digital interactiva.',
    assignedCardIds: ['card-bistro-cafe'],
    files: [
      {
        id: 'f1',
        name: 'Logo_Bistro_Oficial.png',
        type: 'logo',
        url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=150',
        uploadedAt: '2026-01-15T10:00:00Z',
        size: '124 KB',
      },
    ],
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'cli-mendoza',
    name: 'Dr. Roberto Mendoza',
    company: 'Clínica Dental Implantes & Sonrisas',
    email: 'contacto@drrobertomendoza.com',
    phone: '+52 55 4321 8765',
    category: 'Médicos y profesionales de la salud',
    notes: 'Campañas activas en redes sociales con QR en recepción y tarjetas NFC para pacientes.',
    assignedCardIds: ['card-dr-mendoza'],
    files: [],
    createdAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 'cli-vargas',
    name: 'Lic. Elena Vargas',
    company: 'Vargas & Asociados Firma Legal',
    email: 'evargas@vargasasociados.mx',
    phone: '+52 55 5555 1234',
    category: 'Abogados y consultores',
    notes: 'Tarjetas NFC de metal grabadas en láser conectadas a su perfil digital.',
    assignedCardIds: ['card-vargas-legal'],
    files: [],
    createdAt: '2026-01-20T11:00:00Z',
  },
];

export function getStoredCards(): CardData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CARDS);
    if (!raw) {
      // Seed with initial cards from templates with realistic analytics
      const initialCards = INITIAL_TEMPLATES.map((t) => {
        const views = Math.floor(Math.random() * 450) + 140;
        const wa = Math.floor(views * (0.12 + Math.random() * 0.08));
        const call = Math.floor(views * (0.04 + Math.random() * 0.04));
        const email = Math.floor(views * (0.03 + Math.random() * 0.03));
        const saveContact = Math.floor(views * (0.08 + Math.random() * 0.06));
        const map = Math.floor(views * (0.03 + Math.random() * 0.04));
        const total = wa + call + email + saveContact + map;

        return {
          ...t.cardData,
          viewsCount: views,
          contactClicks: total,
          contactBreakdown: {
            whatsapp: wa,
            call,
            email,
            saveContact,
            map,
            total,
          },
        };
      });
      localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(initialCards));
      return initialCards;
    }

    const cards: CardData[] = JSON.parse(raw);
    let modified = false;

    // Normalize older records without discarding any saved card fields.
    // Arrays and nested objects must always exist before the editor renders them.
    const enriched = cards.map((storedCard) => {
      const c: CardData = {
        ...storedCard,
        customButtons: Array.isArray(storedCard.customButtons) ? storedCard.customButtons : [],
        catalog: Array.isArray(storedCard.catalog) ? storedCard.catalog : [],
        gallery: Array.isArray(storedCard.gallery) ? storedCard.gallery : [],
        socials: storedCard.socials && typeof storedCard.socials === 'object' ? storedCard.socials : {},
        businessHours: typeof storedCard.businessHours === 'string' ? storedCard.businessHours : '',
        design: {
          ...(INITIAL_TEMPLATES[0]?.cardData.design || {}),
          ...(storedCard.design || {}),
        },
      };
      let cardModified =
        !Array.isArray(storedCard.customButtons) ||
        !Array.isArray(storedCard.catalog) ||
        !Array.isArray(storedCard.gallery) ||
        !storedCard.socials ||
        !storedCard.design ||
        typeof storedCard.businessHours !== 'string';
      let views = c.viewsCount;
      if (typeof views !== 'number' || views < 0) {
        views = Math.floor(Math.random() * 320) + 110;
        cardModified = true;
      }

      let breakdown = c.contactBreakdown;
      if (!breakdown || typeof c.contactClicks !== 'number') {
        const wa = Math.max(1, Math.floor(views * 0.14));
        const call = Math.floor(views * 0.05);
        const email = Math.floor(views * 0.03);
        const saveContact = Math.max(1, Math.floor(views * 0.09));
        const map = Math.floor(views * 0.04);
        const total = wa + call + email + saveContact + map;

        breakdown = {
          whatsapp: wa,
          call,
          email,
          saveContact,
          map,
          total,
        };
        cardModified = true;
      }

      if (cardModified) {
        modified = true;
        return {
          ...c,
          viewsCount: views,
          contactClicks: breakdown.total,
          contactBreakdown: breakdown,
        };
      }
      return c;
    });

    if (modified) {
      localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(enriched));
    }

    return enriched;
  } catch (err) {
    console.error('Failed reading cards from storage', err);
    return [];
  }
}

export function recordCardView(cardIdOrSlug: string): void {
  try {
    const cards = getStoredCards();
    const index = cards.findIndex((c) => c.id === cardIdOrSlug || c.slug === cardIdOrSlug);
    if (index >= 0) {
      cards[index].viewsCount = (cards[index].viewsCount || 0) + 1;
      saveCards(cards);
    }
  } catch (err) {
    console.error('Failed to record card view', err);
  }
}

export function recordCardContactClick(
  cardIdOrSlug: string,
  type: 'whatsapp' | 'call' | 'email' | 'saveContact' | 'map'
): void {
  try {
    const cards = getStoredCards();
    const index = cards.findIndex((c) => c.id === cardIdOrSlug || c.slug === cardIdOrSlug);
    if (index >= 0) {
      const card = cards[index];
      const views = card.viewsCount || 1;
      const breakdown = card.contactBreakdown || {
        whatsapp: 0,
        call: 0,
        email: 0,
        saveContact: 0,
        map: 0,
        total: 0,
      };

      breakdown[type] = (breakdown[type] || 0) + 1;
      breakdown.total = (breakdown.total || 0) + 1;

      card.contactBreakdown = breakdown;
      card.contactClicks = breakdown.total;
      saveCards(cards);
    }
  } catch (err) {
    console.error('Failed to record contact click', err);
  }
}

export function saveCards(cards: CardData[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
  } catch (err) {
    console.error('Failed saving cards to storage', err);
    throw err;
  }
}

export function getStoredCardById(id: string): CardData | undefined {
  const cards = getStoredCards();
  return cards.find((c) => c.id === id || c.slug === id);
}

export function saveOrUpdateCard(card: CardData): void {
  const cards = getStoredCards();
  const index = cards.findIndex((c) => c.id === card.id);
  const updatedCard: CardData = {
    ...card,
    viewsCount: typeof card.viewsCount === 'number' ? card.viewsCount : 0,
    contactClicks:
      typeof card.contactClicks === 'number'
        ? card.contactClicks
        : card.contactBreakdown?.total || 0,
    contactBreakdown: card.contactBreakdown || {
      whatsapp: 0,
      call: 0,
      email: 0,
      saveContact: 0,
      map: 0,
      total: 0,
    },
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    cards[index] = updatedCard;
  } else {
    cards.unshift(updatedCard);
  }
  saveCards(cards);
}

export function deleteCard(id: string): void {
  const cards = getStoredCards();
  const filtered = cards.filter((c) => c.id !== id);
  saveCards(filtered);
}

export function getStoredClients(): Client[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
      return INITIAL_CLIENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading clients from storage', err);
    return [];
  }
}

export function saveClients(clients: Client[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  } catch (err) {
    console.error('Failed saving clients to storage', err);
  }
}

export function saveOrUpdateClient(client: Client): void {
  const clients = getStoredClients();
  const index = clients.findIndex(c => c.id === client.id);
  if (index >= 0) {
    clients[index] = client;
  } else {
    clients.unshift(client);
  }
  saveClients(clients);
}

export function deleteClient(id: string): void {
  const clients = getStoredClients();
  const filtered = clients.filter(c => c.id !== id);
  saveClients(filtered);
}

export function getStoredTemplates(): CardTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(INITIAL_TEMPLATES));
      return INITIAL_TEMPLATES;
    }
    const stored = JSON.parse(raw) as CardTemplate[];
    const storedIds = new Set(stored.map((t) => t.id));
    let hasNew = false;
    const merged = [...stored];
    for (const initial of INITIAL_TEMPLATES) {
      if (!storedIds.has(initial.id)) {
        merged.push(initial);
        hasNew = true;
      }
    }
    if (hasNew) {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(merged));
    }
    return merged;
  } catch (err) {
    return INITIAL_TEMPLATES;
  }
}

export function saveCustomTemplate(template: CardTemplate): void {
  const templates = getStoredTemplates();
  templates.unshift(template);
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
}

export function getAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveAppSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

// Backup & Restore
export function exportDatabaseBackup(): string {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    cards: getStoredCards(),
    clients: getStoredClients(),
    templates: getStoredTemplates(),
    settings: getAppSettings(),
  };
  return JSON.stringify(data, null, 2);
}

export function importDatabaseBackup(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.cards) saveCards(parsed.cards);
    if (parsed.clients) saveClients(parsed.clients);
    if (parsed.settings) saveAppSettings(parsed.settings);
    if (parsed.templates) localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(parsed.templates));
    return true;
  } catch (e) {
    console.error('Failed importing backup', e);
    return false;
  }
}
