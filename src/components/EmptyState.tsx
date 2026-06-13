
import { MapPin, Plus } from 'lucide-react';

interface Props {
  onAddStop: () => void;
}

export default function EmptyState({ onAddStop }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'rgba(0,255,135,0.06)', border: '1px solid var(--green-border)' }}>
        <MapPin className="w-8 h-8" style={{ color: 'var(--green)' }} />
      </div>
      <h2 className="text-lg font-bold text-white mb-2">No stops yet</h2>
      <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
        Add your first property to begin the walkthrough. Each stop gets a full checklist, notes, and photo capture.
      </p>
      <button onClick={onAddStop} className="btn btn-green">
        <Plus className="w-4 h-4" /> Add First Stop
      </button>
    </div>
  );
}
