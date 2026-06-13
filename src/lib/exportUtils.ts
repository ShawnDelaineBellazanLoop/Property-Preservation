import { PropertyStop, WalkthroughState } from '../types';
import { calcProgress } from './checklist';

export function formatTs(ts: string | null): string {
  if (!ts) return '—';
  return new Date(ts).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
}

export function getGoogleMapsUrl(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

export function getAppleMapsUrl(address: string): string {
  return `https://maps.apple.com/?daddr=${encodeURIComponent(address)}`;
}

// ── Text report ──────────────────────────────────────────────────────────────
export function buildTextReport(stops: PropertyStop[], inspector: string): string {
  const lines: string[] = [
    '═══════════════════════════════════════════════════════',
    '  TOOENSURE LLC — PROPERTY WALKTHROUGH REPORT',
    '═══════════════════════════════════════════════════════',
    `  Inspector : ${inspector || 'Unknown'}`,
    `  Generated : ${new Date().toLocaleString()}`,
    `  Stops     : ${stops.length}`,
    '═══════════════════════════════════════════════════════',
    '',
  ];

  stops.forEach((stop, i) => {
    const progress = calcProgress(stop.checklist);
    lines.push(`STOP ${i + 1} — ${stop.address}`);
    if (stop.workOrderId) lines.push(`  Work Order : ${stop.workOrderId}`);
    lines.push(`  Status     : ${stop.status.toUpperCase()}`);
    lines.push(`  Progress   : ${progress}% (${stop.checklist.filter(c => c.checked).length}/${stop.checklist.length})`);
    if (stop.startedAt) lines.push(`  Started    : ${formatTs(stop.startedAt)}`);
    if (stop.completedAt) lines.push(`  Completed  : ${formatTs(stop.completedAt)}`);
    lines.push('');

    // Checklist by category
    const cats: Record<string, typeof stop.checklist> = {};
    stop.checklist.forEach(c => {
      if (!cats[c.category]) cats[c.category] = [];
      cats[c.category].push(c);
    });
    Object.entries(cats).forEach(([cat, items]) => {
      lines.push(`  ▸ ${cat}`);
      items.forEach(item => lines.push(`    [${item.checked ? '✓' : ' '}] ${item.label}`));
      lines.push('');
    });

    // Notes
    if (stop.notes.length) {
      lines.push('  FIELD NOTES');
      stop.notes.forEach(n => lines.push(`    ${n.timestamp}  ${n.text}`));
      lines.push('');
    }

    // Photos
    if (stop.photos.length) {
      lines.push(`  PHOTOS : ${stop.photos.length} captured`);
      stop.photos.forEach(p => lines.push(`    • ${p.name} @ ${p.capturedAt}`));
      lines.push('');
    }

    lines.push('───────────────────────────────────────────────────────');
    lines.push('');
  });

  return lines.join('\n');
}

export function downloadTextReport(stops: PropertyStop[], inspector: string): void {
  const content = buildTextReport(stops, inspector);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tooensure-walkthrough-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── JSON export ───────────────────────────────────────────────────────────────
export function downloadJsonExport(stops: PropertyStop[], inspector: string): void {
  const payload: WalkthroughState = { stops, inspector, version: '5.0.0' };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tooensure-walkthrough-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Share URL (checklist + notes only, no photos) ────────────────────────────
export function encodeShareState(stops: PropertyStop[], inspector: string): string {
  const slim = stops.map(s => ({
    id: s.id,
    address: s.address,
    workOrderId: s.workOrderId,
    status: s.status,
    checklist: s.checklist,
    notes: s.notes,
    photos: [], // excluded from URL
    startedAt: s.startedAt,
    completedAt: s.completedAt,
    createdAt: s.createdAt,
  }));
  const payload = JSON.stringify({ stops: slim, inspector, version: '5.0.0' });
  return btoa(encodeURIComponent(payload));
}

export function decodeShareState(encoded: string): WalkthroughState | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json) as WalkthroughState;
  } catch {
    return null;
  }
}
