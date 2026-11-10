export interface Wedding {
  couple: string;
  shortCouple: string;
  dateTime: string;
  dateLabel: string;
  timeLabel: string;
  venue: string;
  venueCity: string;
  venueNote: string;
  mapsUrl: string;
  officialSite: string;
  rsvpUrl: string;
  giftsUrl: string;
  pixKey: string;
  dressCode: string;
  dressCodeDetails: string;
  verse: string;
  mapCenter: { lat: number; lng: number };
  mapZoom: number;
  timeZone: string;
}

export interface Accommodation {
  id: string;
  name: string;
  type: 'hotel' | 'pousada' | 'apto' | 'casa' | 'outro' | 'evento' | string;
  city: string;
  lat: number;
  lng: number;
  instagram: string | null;
  whatsapp: string | null;
  description: string | null;
  sortOrder: number;
}

export interface AppConfig {
  inviteRequired: boolean;
  wedding: Wedding;
  map: { tileUrl: string; attribution: string };
  push: { enabled: boolean; publicKey: string | null };
  accommodations: Accommodation[];
}

export interface GuestLite {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface GuestPublic extends GuestLite {
  accommodationId: string | null;
  customPlaceLabel: string | null;
  customCity: string | null;
  customLat: number | null;
  customLng: number | null;
  arrivalDate: string | null;
  departureDate: string | null;
  whatsapp: string | null;
  /** Quem vem junto (nomes) */
  companions: string[];
  /** 1 + acompanhantes */
  partySize: number;
  isAdmin: boolean;
  createdAt: number;
  lastSeenAt: number;
}

export interface GuestMe extends GuestPublic {
  phone: string;
  showPhone: boolean;
}

export interface Photo {
  id: string;
  guestId: string;
  messageId: number | null;
  url: string;
  thumbUrl: string;
  width: number;
  height: number;
  lat: number | null;
  lng: number | null;
  locationSource: 'gps' | 'exif' | 'manual' | 'none' | string;
  caption: string | null;
  takenAt: number | null;
  createdAt: number;
  guest?: GuestLite;
}

export interface Reaction {
  emoji: string;
  guestId: string;
}

export interface Message {
  id: number;
  guestId: string;
  guest: GuestLite;
  text: string | null;
  photo: Photo | null;
  createdAt: number;
  reactions: Reaction[];
  /** Mensagem respondida (como no WhatsApp) */
  replyTo?: ReplyPreview | null;
  /** Ids dos convidados marcados com @ */
  mentions?: string[];
  /** Só no cliente: envio em andamento */
  pending?: boolean;
}

export interface ReplyPreview {
  id: number;
  guestId: string;
  guestName: string;
  text: string | null;
  thumbUrl: string | null;
  deleted: boolean;
}

export type StayMode = 'preset' | 'custom' | 'unknown';

export interface StayInput {
  stayMode: StayMode;
  accommodationId: string | null;
  customPlaceLabel: string;
  customCity: string;
  customLat: number | null;
  customLng: number | null;
}

export interface EnterPayload extends StayInput {
  name: string;
  phone: string;
  inviteCode: string;
  arrivalDate: string | null;
  departureDate: string | null;
  companions: string[];
  showPhone: boolean;
}

export const MAX_COMPANIONS = 4;

export type RsvpStatus = 'yes' | 'maybe' | 'no';

export interface EventRsvp {
  guestId: string;
  status: RsvpStatus | string;
  peopleCount: number;
  note: string | null;
  updatedAt: number;
}

/** Combinado: programa dos noivos (oficial) ou da galera, com confirmação de presença. */
export interface EventItem {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  placeLabel: string | null;
  placeLat: number | null;
  placeLng: number | null;
  isOfficial: boolean;
  createdBy: GuestLite;
  createdAt: number;
  updatedAt: number;
  rsvps: EventRsvp[];
  counts: { yes: number; maybe: number; no: number; people: number };
}

export interface EventPayload {
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  placeLabel: string | null;
  placeLat: number | null;
  placeLng: number | null;
  isOfficial?: boolean;
}

export const EMOJIS = ['❤️', '😂', '🥹', '🔥', '👏', '🙌'];

export const CITIES = ['Barra de São Miguel', 'Maceió', 'Outro'] as const;
