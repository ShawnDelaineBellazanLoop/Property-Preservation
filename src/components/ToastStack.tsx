
import { Toast } from '../hooks/useToast';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface Props {
  toasts: Toast[];
  dismiss: (id: string) => void;
}

const ICONS = {
  success: <CheckCircle className="w-4 h-4 text-[#00FF87]" />,
  error: <AlertCircle className="w-4 h-4 text-red-400" />,
  info: <Info className="w-4 h-4 text-blue-400" />,
};

export default function ToastStack({ toasts, dismiss }: Props) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className="toast-enter pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium shadow-2xl"
          style={{
            background: '#18181f',
            borderColor: t.type === 'success' ? 'rgba(0,255,135,0.2)' : t.type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(96,165,250,0.2)',
            color: '#f0f0f5',
            backdropFilter: 'blur(12px)',
          }}
        >
          {t.icon ? <span className="text-base">{t.icon}</span> : ICONS[t.type]}
          <span>{t.message}</span>
          <button onClick={() => dismiss(t.id)} className="ml-1 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
