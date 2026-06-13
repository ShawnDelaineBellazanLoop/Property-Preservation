import { useState } from 'react';
import { PropertyStop, ChecklistItem, FieldNote, PhotoEntry } from '../types';
import { calcProgress, groupByCategory } from '../lib/checklist';
import PhotoGrid from './PhotoGrid';
import {
  MapPin, Navigation, ChevronDown, ChevronUp, CheckCheck,
  StickyNote, Camera, Clock, Hash, Trash2, Check, Plus,
  ExternalLink
} from 'lucide-react';

interface Props {
  stop: PropertyStop;
  index: number;
  onUpdate: (stop: PropertyStop) => void;
  onDelete: (id: string) => void;
  toast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const CAT_COLORS: Record<string, string> = {
  Exterior: '#00FF87',
  Interior: '#60a5fa',
  Compliance: '#f59e0b',
};

export default function StopCard({ stop, index, onUpdate, onDelete, toast }: Props) {
  const [expanded, setExpanded] = useState(index === 0);
  const [activeTab, setActiveTab] = useState<'checklist' | 'notes' | 'photos'>('checklist');
  const [noteText, setNoteText] = useState('');

  const progress = calcProgress(stop.checklist);
  const grouped = groupByCategory(stop.checklist);
  const checkedCount = stop.checklist.filter(c => c.checked).length;

  const toggleItem = (id: string) => {
    const checklist = stop.checklist.map(c => c.id === id ? { ...c, checked: !c.checked } : c);
    const allDone = checklist.every(c => c.checked);
    onUpdate({
      ...stop,
      checklist,
      status: allDone ? 'complete' : checkedCount > 0 ? 'in-progress' : 'pending',
      startedAt: !stop.startedAt && checkedCount === 0 ? new Date().toISOString() : stop.startedAt,
      completedAt: allDone ? new Date().toISOString() : null,
    });
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    const note: FieldNote = {
      id: `note-${Date.now()}`,
      text: noteText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ts: Date.now(),
    };
    onUpdate({ ...stop, notes: [...stop.notes, note] });
    setNoteText('');
    toast('Note added', 'success');
  };

  const deleteNote = (id: string) => {
    onUpdate({ ...stop, notes: stop.notes.filter(n => n.id !== id) });
  };

  const handlePhotosChange = (photos: PhotoEntry[]) => {
    onUpdate({ ...stop, photos });
  };

  const statusColors = {
    pending: { bg: 'rgba(85,85,102,0.15)', text: '#8888a0', border: 'rgba(85,85,102,0.3)' },
    'in-progress': { bg: 'rgba(96,165,250,0.1)', text: '#60a5fa', border: 'rgba(96,165,250,0.25)' },
    complete: { bg: 'rgba(0,255,135,0.1)', text: '#00FF87', border: 'rgba(0,255,135,0.25)' },
  };
  const sc = statusColors[stop.status];

  const TABS = [
    { id: 'checklist', label: 'Checklist', icon: <CheckCheck className="w-3.5 h-3.5" />, count: `${checkedCount}/${stop.checklist.length}` },
    { id: 'notes', label: 'Notes', icon: <StickyNote className="w-3.5 h-3.5" />, count: stop.notes.length || undefined },
    { id: 'photos', label: 'Photos', icon: <Camera className="w-3.5 h-3.5" />, count: stop.photos.length || undefined },
  ] as const;

  return (
    <div className="card animate-fade-in" style={{ borderColor: expanded ? 'var(--border-hover)' : 'var(--border)' }}>
      {/* Card header */}
      <div
        className="flex items-start gap-3 p-4 cursor-pointer select-none"
        onClick={() => setExpanded(v => !v)}
      >
        {/* Index badge */}
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-black"
          style={{ background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid var(--green-border)' }}>
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--green)' }} />
              <span className="text-sm font-bold text-white truncate">{stop.address}</span>
            </div>
            <span className="pill shrink-0" style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
              {stop.status === 'in-progress' ? 'In Progress' : stop.status}
            </span>
          </div>
          {stop.workOrderId && (
            <div className="flex items-center gap-1 mt-1">
              <Hash className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
              <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{stop.workOrderId}</span>
            </div>
          )}

          {/* Progress bar */}
          <div className="mt-2.5 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  background: progress === 100 ? 'var(--green)' : 'linear-gradient(90deg, #60a5fa, var(--green))',
                  boxShadow: progress === 100 ? '0 0 8px rgba(0,255,135,0.4)' : 'none',
                }}
              />
            </div>
            <span className="text-[10px] font-mono font-bold shrink-0" style={{ color: progress === 100 ? 'var(--green)' : 'var(--text-muted)' }}>
              {progress}%
            </span>
          </div>
        </div>

        {/* Nav + expand */}
        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stop.address)}`}
            target="_blank" rel="noreferrer"
            onClick={e => e.stopPropagation()}
            className="btn btn-ghost p-2 hidden sm:flex"
            title="Google Maps"
          >
            <Navigation className="w-3.5 h-3.5" style={{ color: 'var(--green)' }} />
          </a>
          <button
            className="btn btn-ghost p-2"
            onClick={e => { e.stopPropagation(); if (window.confirm(`Delete stop "${stop.address}"?`)) onDelete(stop.id); }}
            title="Delete stop"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
          <button className="btn btn-ghost p-2">
            {expanded ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
          </button>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t" style={{ borderColor: 'var(--border)' }}>
          {/* Mobile nav */}
          <div className="flex gap-2 px-4 pt-3 sm:hidden">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stop.address)}`}
              target="_blank" rel="noreferrer"
              className="btn btn-ghost text-xs flex-1"
            >
              <Navigation className="w-3.5 h-3.5" style={{ color: 'var(--green)' }} /> Google Maps
            </a>
            <a
              href={`https://maps.apple.com/?daddr=${encodeURIComponent(stop.address)}`}
              target="_blank" rel="noreferrer"
              className="btn btn-ghost text-xs flex-1"
            >
              <ExternalLink className="w-3.5 h-3.5" style={{ color: '#60a5fa' }} /> Apple Maps
            </a>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-4 pt-3">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn text-xs gap-1.5 ${activeTab === tab.id ? 'btn-green' : 'btn-ghost'}`}
                style={activeTab === tab.id ? {} : { color: 'var(--text-secondary)' }}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && (
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full"
                    style={{
                      background: activeTab === tab.id ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.06)',
                      color: activeTab === tab.id ? '#000' : 'var(--text-muted)',
                    }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-4 pt-3">
            {/* Checklist tab */}
            {activeTab === 'checklist' && (
              <div className="flex flex-col gap-3">
                {Object.entries(grouped).map(([cat, items]) => (
                  <div key={cat}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: CAT_COLORS[cat] ?? '#888' }} />
                      <span className="text-[9px] font-mono uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>{cat}</span>
                      <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>
                        {items.filter(i => i.checked).length}/{items.length}
                      </span>
                    </div>
                    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                      {items.map((item, i) => (
                        <div
                          key={item.id}
                          className={`check-row ${item.checked ? 'checked' : ''}`}
                          style={i < items.length - 1 ? { borderBottom: '1px solid var(--border)' } : {}}
                          onClick={() => toggleItem(item.id)}
                        >
                          <div className={`check-box ${item.checked ? 'checked' : ''}`}>
                            {item.checked && <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />}
                          </div>
                          <span className="check-label text-xs text-white/90">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* All done banner */}
                {progress === 100 && (
                  <div className="flex items-center gap-2 px-3 py-3 rounded-xl animate-fade-in"
                    style={{ background: 'rgba(0,255,135,0.08)', border: '1px solid var(--green-border)' }}>
                    <CheckCheck className="w-4 h-4" style={{ color: 'var(--green)' }} />
                    <span className="text-xs font-semibold" style={{ color: 'var(--green)' }}>All items complete — stop ready to close</span>
                  </div>
                )}
              </div>
            )}

            {/* Notes tab */}
            {activeTab === 'notes' && (
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <textarea
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) addNote(); }}
                    placeholder="Add a field note… (Ctrl+Enter to save)"
                    rows={2}
                    className="field flex-1 text-xs"
                  />
                  <button onClick={addNote} disabled={!noteText.trim()} className="btn btn-green text-xs px-3 self-stretch disabled:opacity-40 disabled:cursor-not-allowed">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {stop.notes.length === 0 && (
                  <p className="text-center text-[11px] py-3" style={{ color: 'var(--text-muted)' }}>No notes yet</p>
                )}

                {[...stop.notes].reverse().map(note => (
                  <div key={note.id} className="flex items-start gap-2.5 p-3 rounded-lg group animate-fade-in"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                    <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-mono mb-1" style={{ color: 'var(--text-muted)' }}>{note.timestamp}</div>
                      <div className="text-xs text-white/90 leading-relaxed whitespace-pre-wrap">{note.text}</div>
                    </div>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded cursor-pointer hover:bg-red-500/20"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Photos tab */}
            {activeTab === 'photos' && (
              <PhotoGrid photos={stop.photos} onPhotosChange={handlePhotosChange} toast={toast} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
