import { useState, useRef, useEffect } from 'react';
import { PropertyStop } from '../types';
import { downloadTextReport, downloadJsonExport, encodeShareState } from '../lib/exportUtils';
import {
  Plus, Download, Share2, RotateCcw, User,
  GitBranch, FileText, FileJson, ChevronDown, Zap, Globe,
} from 'lucide-react';

interface Props {
  stops: PropertyStop[];
  inspector: string;
  setInspector: (v: string) => void;
  syncState: 'idle' | 'saving' | 'saved';
  lastSaved: string;
  onAddStop: () => void;
  onReset: () => void;
  toast: (msg: string, type?: 'success' | 'error' | 'info', icon?: string) => void;
}

export default function Header({ stops, inspector, setInspector, syncState, lastSaved, onAddStop, onReset, toast }: Props) {
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleTxt = () => {
    downloadTextReport(stops, inspector);
    setExportOpen(false);
    toast('Report downloaded', 'success', '📄');
  };

  const handleJson = () => {
    downloadJsonExport(stops, inspector);
    setExportOpen(false);
    toast('JSON exported', 'success', '📦');
  };

  const handleShare = async () => {
    try {
      const encoded = encodeShareState(stops, inspector);
      const url = `${window.location.origin}${window.location.pathname}?state=${encoded}`;
      if (navigator.share) {
        await navigator.share({
          title: 'Tooensure Property Walkthrough',
          text: `${inspector}'s walkthrough — ${stops.length} stop(s)`,
          url,
        });
        toast('Shared!', 'success', '🔗');
      } else {
        await navigator.clipboard.writeText(url);
        toast('Link copied to clipboard', 'success', '🔗');
      }
    } catch {
      toast('Share failed', 'error');
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all data? This cannot be undone.')) {
      onReset();
      toast('Walkthrough reset', 'info', '🔄');
    }
  };

  const totalPhotos = stops.reduce((a, s) => a + s.photos.length, 0);
  const totalChecked = stops.reduce((a, s) => a + s.checklist.filter(c => c.checked).length, 0);
  const totalItems = stops.reduce((a, s) => a + s.checklist.length, 0);

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{ background: 'rgba(10,10,15,0.92)', borderColor: 'var(--border)', backdropFilter: 'blur(16px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">

        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--green)', boxShadow: '0 0 16px rgba(0,255,135,0.4)' }}>
              <Zap className="w-4 h-4 text-black" />
            </div>
            <div className="status-dot live absolute -top-0.5 -right-0.5" />
          </div>
          <div>
            <div className="text-sm font-black tracking-tight text-white uppercase leading-none">
              TOOENSURE <span className="font-mono text-[10px] font-normal px-1.5 py-0.5 rounded ml-1" style={{ background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid var(--green-border)' }}>LLC</span>
            </div>
            <div className="text-[9px] font-mono uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Field Walkthrough · Property Preservation
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="hidden md:flex items-center gap-3 ml-2">
          {[
            { label: 'STOPS', val: stops.length },
            { label: 'CHECKED', val: `${totalChecked}/${totalItems}` },
            { label: 'PHOTOS', val: totalPhotos },
          ].map(({ label, val }) => (
            <div key={label} className="flex flex-col items-center px-3 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <span className="text-xs font-bold text-white">{val}</span>
              <span className="text-[8px] font-mono uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>

        <div className="flex-1" />

        {/* Inspector */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg shrink-0" style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid var(--border)' }}>
          <User className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--green)' }} />
          <div>
            <div className="text-[8px] font-mono uppercase tracking-widest leading-none" style={{ color: 'var(--text-muted)' }}>Agent</div>
            <input
              type="text"
              value={inspector}
              onChange={e => setInspector(e.target.value)}
              placeholder="Your name"
              className="bg-transparent border-none text-white text-xs font-semibold focus:outline-none w-24"
            />
          </div>
        </div>

        {/* Sync indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg shrink-0" style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid var(--border)' }}>
          <Globe className="w-3.5 h-3.5" style={{ color: syncState === 'saving' ? '#60a5fa' : 'var(--text-muted)' }} />
          <div>
            <div className="text-[8px] font-mono uppercase tracking-widest leading-none" style={{ color: syncState === 'saving' ? '#60a5fa' : syncState === 'saved' ? 'var(--green)' : 'var(--text-muted)' }}>
              {syncState === 'saving' ? 'Saving…' : syncState === 'saved' ? `Saved ${lastSaved}` : 'Local'}
            </div>
            <a
              href="https://github.com/ShawnDelaineBellazanLoop/Property-Preservation"
              target="_blank" rel="noreferrer"
              className="text-[10px] font-mono hover:underline flex items-center gap-1 mt-0.5"
              style={{ color: 'var(--green)' }}
            >
              <GitBranch className="w-2.5 h-2.5" /> Property-Preservation
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={onAddStop} className="btn btn-green text-xs">
            <Plus className="w-3.5 h-3.5" /> Add Stop
          </button>

          {/* Export dropdown */}
          <div ref={exportRef} className="relative">
            <button onClick={() => setExportOpen(v => !v)} className="btn btn-ghost text-xs">
              <Download className="w-3.5 h-3.5" style={{ color: '#60a5fa' }} />
              Export
              <ChevronDown className={`w-3 h-3 transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
            </button>
            {exportOpen && (
              <div
                className="absolute right-0 mt-1.5 w-52 rounded-xl overflow-hidden shadow-2xl animate-slide-down"
                style={{ background: '#14141a', border: '1px solid var(--border)', zIndex: 100 }}
              >
                <button onClick={handleTxt} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors cursor-pointer border-b" style={{ borderColor: 'var(--border)' }}>
                  <FileText className="w-4 h-4 shrink-0" style={{ color: '#60a5fa' }} />
                  <div>
                    <div className="text-xs font-semibold text-white">Text Report</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Full checklist + notes (.txt)</div>
                  </div>
                </button>
                <button onClick={handleJson} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors cursor-pointer">
                  <FileJson className="w-4 h-4 shrink-0" style={{ color: '#f59e0b' }} />
                  <div>
                    <div className="text-xs font-semibold text-white">JSON Export</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Structured data backup (.json)</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button onClick={handleShare} className="btn btn-ghost text-xs">
            <Share2 className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} /> Share
          </button>

          <button onClick={handleReset} className="btn btn-danger text-xs px-2.5 py-2" title="Reset walk">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
