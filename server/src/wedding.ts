/** Dados fixos do casamento (fonte: site oficial, em 08/11/2026). */
export const WEDDING = {
  couple: 'Anna Carolina & Fernando',
  shortCouple: 'Anna & Fernando',
  /** ISO com fuso de Maceió (UTC-3) */
  dateTime: '2026-12-19T15:00:00-03:00',
  dateLabel: '19 de dezembro de 2026',
  timeLabel: '15h',
  venue: 'Espaço Tuá',
  venueCity: 'Maceió/AL',
  venueNote: 'Cerca de 14 km da Praia de Pajuçara (Maceió) e 20 km da Barra de São Miguel.',
  mapsUrl: 'https://maps.app.goo.gl/CXK7wnT66wRmk7Nr5',
  officialSite: 'https://www.annacarolinaefernando.com',
  rsvpUrl:
    'https://wa.me/5549999442022?text=Ol%C3%A1,+gostaria+de+confirmar+minha+presen%C3%A7a+no+casamento+da+Anna+Carolina+e+Fernando.',
  giftsUrl: 'https://sites.icasei.com.br/annacarolinaefernando/pages/37362022',
  dressCode: 'Passeio completo',
  dressCodeDetails:
    'Homens: camisa, blazer e calça social; gravata opcional. Mulheres: vestidos de tecidos fluidos. Evitar cores claras. Se optar por salto, prefira salto bloco.',
  verse: 'Isaías 41:20',
  /** Centro inicial do mapa: entre Maceió e Barra de São Miguel */
  mapCenter: { lat: -9.77, lng: -35.79 },
  mapZoom: 10,
  timeZone: 'America/Maceio',
} as const;
