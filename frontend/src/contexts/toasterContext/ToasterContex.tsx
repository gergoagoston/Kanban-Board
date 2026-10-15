import { createContext } from 'react';

interface ToasterContextType {
    showToast: (title: string, type: 'success' | 'error' | 'warning' | 'info', message?: string) => void;
}

export const ToastContext = createContext({} as ToasterContextType);
