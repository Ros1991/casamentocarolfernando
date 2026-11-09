import * as L from 'leaflet';

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

const BED = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>`;
const RINGS = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="9" cy="13" r="6"/><circle cx="15" cy="13" r="6"/><path d="M12 3l2 3h-4z" fill="currentColor"/></svg>`;
const HOME = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>`;

export type PlaceKind = 'venue' | 'preset' | 'custom';

export function placeIcon(label: string, count: number, kind: PlaceKind): L.DivIcon {
  const icon = kind === 'venue' ? RINGS : kind === 'custom' ? HOME : BED;
  const cls = kind === 'venue' ? 'pin-place pin-venue' : kind === 'custom' ? 'pin-place pin-custom' : 'pin-place';
  const countHtml = count > 0 ? `<span class="pin-count">${count}</span>` : '';
  return L.divIcon({
    className: '',
    html: `<div class="${cls}">${icon}<span>${escapeHtml(label)}</span>${countHtml}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export function photoIcon(thumbUrl: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<img class="pin-photo" src="${thumbUrl}" alt="" loading="lazy" />`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export function pickIcon(): L.DivIcon {
  return L.divIcon({ className: '', html: '<div class="pin-pick"></div>', iconSize: [0, 0], iconAnchor: [0, 0] });
}

export function clusterIcon(count: number): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div class="cluster-photos">${count}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}
