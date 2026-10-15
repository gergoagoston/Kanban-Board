import { ReactNode, useState } from 'react';
import { ToastContext } from './ToasterContex';
import { Toast, ToastContainer } from 'react-bootstrap';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

type ToastType = {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'success' | 'error' | 'warning' | 'info';
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState([] as ToastType[]);

  // Function to show a new toast
const showToast = (
    title: string,
    type: 'success' | 'error' | 'warning' | 'info',
    message: string = "",
) => {
    const newToast: ToastType = {
        id: Date.now(),
        title,
        message,
        time: new Date().toLocaleTimeString(),
        type,
    };
    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto-dismiss the toast after 4 seconds
    setTimeout(() => removeToast(newToast.id), 4000);
};

  // Function to remove a toast
  const removeToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  const getToastStyle = (type: ToastType['type']) => {
    switch (type) {
      case 'success':
        return { bg: 'bg-success text-white', Icon: CheckCircle };
      case 'error':
        return { bg: 'bg-danger text-white', Icon: XCircle };
      case 'warning':
        return { bg: 'bg-warning text-dark', Icon: AlertTriangle };
      case 'info':
      default:
        return { bg: 'bg-info text-white', Icon: Info };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        {toasts.map((toast) => {
          const { bg, Icon } = getToastStyle(toast.type);
          return (
            <Toast key={toast.id} onClose={() => removeToast(toast.id)} autohide className={bg}>
              <Toast.Header closeButton={false} className="d-flex align-items-center">
                <Icon size={20} className="me-2" />
                <strong className="me-auto">{toast.title}</strong>
                <small>{toast.time}</small>
              </Toast.Header>
              <Toast.Body>{toast.message}</Toast.Body>
            </Toast>
          );
        })}
      </ToastContainer>
    </ToastContext.Provider>
  );
}
