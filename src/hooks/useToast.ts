import { useState, useCallback, useRef } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  icon?: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    clearTimeout(timers.current[id]);
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const toast = useCallback((message: string, type: Toast['type'] = 'success', icon?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(t => [...t.slice(-3), { id, message, type, icon }]);
    timers.current[id] = setTimeout(() => dismiss(id), 3000);
    return id;
  }, [dismiss]);

  return { toasts, toast, dismiss };
}
