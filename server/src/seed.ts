import { db } from './db/index.js';
import { accommodations } from './db/schema.js';

export const CITY_BARRA = 'Barra de São Miguel';
export const CITY_MACEIO = 'Maceió';
export const CITY_OTHER = 'Outro';

/**
 * Hospedagens sugeridas no site oficial + o local da festa como referência.
 * Coordenadas obtidas do Google Maps (Espaço Tuá) e do OpenStreetMap (hotéis) em 08/11/2026.
 */
export const PRESET_ACCOMMODATIONS = [
  {
    id: 'espaco-tua',
    name: 'Espaço Tuá',
    type: 'evento',
    city: CITY_MACEIO,
    lat: -9.7137538,
    lng: -35.8062358,
    instagram: null,
    whatsapp: null,
    description: 'Local da cerimônia e da recepção — 19/12/2026 às 15h',
    sortOrder: 0,
  },
  {
    id: 'village-barra',
    name: 'Village Barra Hotel',
    type: 'hotel',
    city: CITY_BARRA,
    lat: -9.8371292,
    lng: -35.887649,
    instagram: 'villagebarrahotel',
    whatsapp: '558232721000',
    description: null,
    sortOrder: 1,
  },
  {
    id: 'ritz-barra',
    name: 'Ritz Barra de São Miguel',
    type: 'hotel',
    city: CITY_BARRA,
    lat: -9.8299641,
    lng: -35.8825268,
    instagram: 'ritzbarradesaomiguel',
    whatsapp: '558221214001',
    description: null,
    sortOrder: 2,
  },
  {
    id: 'viva-barra',
    name: 'Vivá Barra Hotel Pousada',
    type: 'pousada',
    city: CITY_BARRA,
    lat: -9.823824,
    lng: -35.8794093,
    instagram: 'vivabarrahotelpousada',
    whatsapp: '558232722047',
    description: null,
    sortOrder: 3,
  },
  {
    id: 'barra-bali',
    name: 'Barra Bali (apartamentos)',
    type: 'apto',
    city: CITY_BARRA,
    lat: -9.8404009,
    lng: -35.891901,
    instagram: null,
    whatsapp: null,
    description: 'Apartamentos disponíveis no Booking e no Airbnb',
    sortOrder: 4,
  },
  {
    id: 'ritz-suites',
    name: 'Ritz Suítes Grand Hotel',
    type: 'hotel',
    city: CITY_MACEIO,
    lat: -9.6325981,
    lng: -35.6973207,
    instagram: 'ritzsuites',
    whatsapp: '558233122020',
    description: null,
    sortOrder: 5,
  },
];

export function seedAccommodations(): void {
  for (const preset of PRESET_ACCOMMODATIONS) {
    db.insert(accommodations)
      .values({ ...preset, isPreset: true })
      .onConflictDoUpdate({
        target: accommodations.id,
        set: {
          name: preset.name,
          type: preset.type,
          city: preset.city,
          lat: preset.lat,
          lng: preset.lng,
          instagram: preset.instagram,
          whatsapp: preset.whatsapp,
          description: preset.description,
          sortOrder: preset.sortOrder,
        },
      })
      .run();
  }
}
