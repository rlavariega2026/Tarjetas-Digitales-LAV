export interface ClientFile {
  id: string;
  name: string;
  type: 'logo' | 'photo' | 'banner' | 'catalog' | 'document';
  url: string;
  size?: string;
  uploadedAt: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  category: string;
  notes?: string;
  assignedCardIds: string[];
  files: ClientFile[];
  createdAt: string;
}
