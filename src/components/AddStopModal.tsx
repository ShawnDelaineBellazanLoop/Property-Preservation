import { useState, useEffect, useRef } from 'react';
import { X, MapPin, Hash, Loader2 } from 'lucide-react';

interface Props {
  onAdd: (address: string, workOrderId: string) => void;
  onClose: () => void;
}

export default function AddStopModal({ onAdd, onClose }: Props) {
  const [address, setAddress] = useState('');
  const [workOrderId, setWorkOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);

  const handleSubmit = async () => {
    if (!address.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 150)); // micro-delay for feel
    onAdd(address.trim(), workOrderId.trim());
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl animate-fade-in"
        style={{ background: '#13131a', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h2 className="text-sm font-bold text-white">Add Property Stop</h2>
            <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>New inspection location</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/8 transition-colors cursor-pointer" style={{ color: 'var(--text-muted)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>
              <MapPin className="w-3 h-3 inline mr-1" />Property Address *
            </span>
            <input
              ref={inputRef}
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
              placeholder="1234 Main St, Minneapolis MN 55401"
              className="field"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>
              <Hash className="w-3 h-3 inline mr-1" />Work Order ID
            </span>
            <input
              type="text"
              value={workOrderId}
              onChange={e => setWorkOrderId(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
              placeholder="WO-2026-0042"
              className="field"
            />
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-5 pt-0">
          <button onClick={onClose} className="btn btn-ghost text-xs">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!address.trim() || loading}
            className="btn btn-green text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            Add Stop
          </button>
        </div>
      </div>
    </div>
  );
}
