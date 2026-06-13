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
    `  Photos    : ${stops.reduce((a, s) => a + s.photos.length, 0)} total`,
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

    if (stop.notes.length) {
      lines.push('  FIELD NOTES');
      stop.notes.forEach(n => lines.push(`    ${n.timestamp}  ${n.text}`));
      lines.push('');
    }

    if (stop.photos.length) {
      lines.push(`  PHOTOS (${stop.photos.length}) — see HTML report for images`);
      stop.photos.forEach((p, pi) => lines.push(`    [${pi + 1}] ${p.name}  captured ${p.capturedAt}  ${(p.size / 1024).toFixed(0)} KB`));
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
  a.download = `tooensure-report-${datestamp()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── HTML report with embedded photos ─────────────────────────────────────────
export function buildHtmlReport(stops: PropertyStop[], inspector: string): string {
  const totalPhotos = stops.reduce((a, s) => a + s.photos.length, 0);
  const totalChecked = stops.reduce((a, s) => a + s.checklist.filter(c => c.checked).length, 0);
  const totalItems = stops.reduce((a, s) => a + s.checklist.length, 0);
  const generated = new Date().toLocaleString();

  const stopSections = stops.map((stop, i) => {
    const progress = calcProgress(stop.checklist);
    const cats: Record<string, typeof stop.checklist> = {};
    stop.checklist.forEach(c => {
      if (!cats[c.category]) cats[c.category] = [];
      cats[c.category].push(c);
    });

    const catHtml = Object.entries(cats).map(([cat, items]) => {
      const catColor = cat === 'Exterior' ? '#00FF87' : cat === 'Interior' ? '#60a5fa' : '#f59e0b';
      const itemRows = items.map(item => `
        <tr>
          <td style="padding:6px 10px;width:24px">
            <div style="width:16px;height:16px;border-radius:4px;border:${item.checked ? 'none' : '1.5px solid #3a3a4a'};background:${item.checked ? '#00FF87' : 'transparent'};display:flex;align-items:center;justify-content:center">
              ${item.checked ? '<svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2.5" stroke="black" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
            </div>
          </td>
          <td style="padding:6px 10px;font-size:13px;color:${item.checked ? '#6b7280' : '#e5e7eb'};text-decoration:${item.checked ? 'line-through' : 'none'}">${item.label}</td>
        </tr>`).join('');
      return `
        <div style="margin-bottom:12px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <div style="width:8px;height:8px;border-radius:50%;background:${catColor}"></div>
            <span style="font-size:10px;font-family:monospace;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;font-weight:700">${cat} · ${items.filter(x => x.checked).length}/${items.length}</span>
          </div>
          <table style="width:100%;border-collapse:collapse;background:#1a1a24;border-radius:8px;overflow:hidden;border:1px solid rgba(255,255,255,0.07)">
            <tbody>${itemRows}</tbody>
          </table>
        </div>`;
    }).join('');

    const notesHtml = stop.notes.length ? `
      <div style="margin-top:16px">
        <div style="font-size:10px;font-family:monospace;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;margin-bottom:8px">Field Notes</div>
        ${[...stop.notes].reverse().map(n => `
          <div style="background:#1a1a24;border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:10px 12px;margin-bottom:6px">
            <div style="font-size:10px;font-family:monospace;color:#6b7280;margin-bottom:4px">${n.timestamp}</div>
            <div style="font-size:13px;color:#e5e7eb;line-height:1.5;white-space:pre-wrap">${escHtml(n.text)}</div>
          </div>`).join('')}
      </div>` : '';

    const photosHtml = stop.photos.length ? `
      <div style="margin-top:16px">
        <div style="font-size:10px;font-family:monospace;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;margin-bottom:8px">Photos (${stop.photos.length})</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px">
          ${stop.photos.map((p, pi) => `
            <div style="border-radius:8px;overflow:hidden;border:1px solid rgba(255,255,255,0.07)">
              <img src="${p.dataUrl}" alt="${escHtml(p.name)}" style="width:100%;aspect-ratio:1;object-fit:cover;display:block" />
              <div style="padding:6px 8px;background:#1a1a24">
                <div style="font-size:10px;font-family:monospace;color:#6b7280">#${pi + 1} · ${p.capturedAt}</div>
                <div style="font-size:10px;color:#9ca3af;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(p.name)}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>` : '<div style="margin-top:12px;font-size:12px;color:#4b5563;font-style:italic">No photos captured for this stop.</div>';

    const statusColor = stop.status === 'complete' ? '#00FF87' : stop.status === 'in-progress' ? '#60a5fa' : '#6b7280';

    return `
      <div style="background:#111116;border:1px solid rgba(255,255,255,0.09);border-radius:12px;margin-bottom:20px;overflow:hidden">
        <div style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.07);display:flex;align-items:flex-start;gap:12px">
          <div style="width:28px;height:28px;border-radius:8px;background:rgba(0,255,135,0.12);border:1px solid rgba(0,255,135,0.25);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#00FF87;flex-shrink:0">${i + 1}</div>
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <span style="font-size:15px;font-weight:700;color:#ffffff">${escHtml(stop.address)}</span>
              <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:99px;text-transform:uppercase;letter-spacing:0.05em;color:${statusColor};background:${statusColor}1a;border:1px solid ${statusColor}40">${stop.status === 'in-progress' ? 'In Progress' : stop.status}</span>
            </div>
            ${stop.workOrderId ? `<div style="font-size:11px;font-family:monospace;color:#6b7280;margin-top:4px">WO# ${escHtml(stop.workOrderId)}</div>` : ''}
            <div style="margin-top:10px;display:flex;align-items:center;gap:8px">
              <div style="flex:1;height:6px;border-radius:3px;background:rgba(255,255,255,0.06);overflow:hidden">
                <div style="height:100%;border-radius:3px;width:${progress}%;background:${progress === 100 ? '#00FF87' : 'linear-gradient(90deg,#60a5fa,#00FF87)'};box-shadow:${progress === 100 ? '0 0 8px rgba(0,255,135,0.4)' : 'none'}"></div>
              </div>
              <span style="font-size:11px;font-family:monospace;font-weight:700;color:${progress === 100 ? '#00FF87' : '#6b7280'}">${progress}%</span>
            </div>
          </div>
          <div style="display:flex;gap:12px;font-size:11px;font-family:monospace;color:#6b7280;flex-shrink:0">
            ${stop.startedAt ? `<div>Started<br><span style="color:#e5e7eb">${formatTs(stop.startedAt)}</span></div>` : ''}
            ${stop.completedAt ? `<div>Completed<br><span style="color:#00FF87">${formatTs(stop.completedAt)}</span></div>` : ''}
          </div>
        </div>
        <div style="padding:16px 20px">
          ${catHtml}
          ${notesHtml}
          ${photosHtml}
        </div>
      </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Tooensure Property Report — ${generated}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0A0A0F; color: #e5e7eb; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @media print {
      body { background: white; color: black; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div style="max-width:860px;margin:0 auto;padding:32px 20px">

    <!-- Header -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid rgba(255,255,255,0.09)">
      <div>
        <div style="font-size:22px;font-weight:900;color:#ffffff;text-transform:uppercase;letter-spacing:-0.02em">
          TOOENSURE <span style="font-size:11px;font-weight:400;font-family:monospace;padding:2px 8px;border-radius:4px;background:rgba(0,255,135,0.12);color:#00FF87;border:1px solid rgba(0,255,135,0.25);letter-spacing:0.05em;vertical-align:middle">LLC</span>
        </div>
        <div style="font-size:11px;font-family:monospace;color:#6b7280;margin-top:4px;text-transform:uppercase;letter-spacing:0.1em">Field Property Walkthrough Report</div>
      </div>
      <div style="text-align:right;font-size:11px;font-family:monospace;color:#6b7280;line-height:1.8">
        <div>Inspector: <span style="color:#e5e7eb;font-weight:600">${escHtml(inspector || 'Unknown')}</span></div>
        <div>Generated: <span style="color:#e5e7eb">${generated}</span></div>
      </div>
    </div>

    <!-- Summary cards -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px">
      ${[
        { label: 'Stops', val: stops.length, color: '#00FF87' },
        { label: 'Completed', val: stops.filter(s => s.status === 'complete').length, color: '#00FF87' },
        { label: 'Checklist', val: `${totalChecked}/${totalItems}`, color: '#60a5fa' },
        { label: 'Photos', val: totalPhotos, color: '#f59e0b' },
      ].map(c => `
        <div style="background:#111116;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:12px 16px;text-align:center">
          <div style="font-size:22px;font-weight:800;color:${c.color}">${c.val}</div>
          <div style="font-size:10px;font-family:monospace;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;margin-top:2px">${c.label}</div>
        </div>`).join('')}
    </div>

    <!-- Stops -->
    ${stopSections}

    <!-- Footer -->
    <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;justify-content:space-between">
      <div style="font-size:10px;font-family:monospace;color:#4b5563">TOOENSURE LLC · Property Preservation Walkthrough System v5</div>
      <div style="font-size:10px;font-family:monospace;color:#4b5563">${generated}</div>
    </div>
  </div>
</body>
</html>`;
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function downloadHtmlReport(stops: PropertyStop[], inspector: string): Promise<void> {
  const html = buildHtmlReport(stops, inspector);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tooensure-report-${datestamp()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── JSON export (includes full photo dataUrls) ────────────────────────────────
export function downloadJsonExport(stops: PropertyStop[], inspector: string): void {
  const payload: WalkthroughState = { stops, inspector, version: '5.0.0' };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tooensure-backup-${datestamp()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Share URL (no photos — too large for URL) ─────────────────────────────────
export function encodeShareState(stops: PropertyStop[], inspector: string): string {
  const slim = stops.map(s => ({ ...s, photos: [] }));
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

function datestamp(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
}
