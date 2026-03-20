import { Toast, ToastProps } from './Toast';
import { useAppContext } from '../context/AppContext';

interface ToastContainerProps {
  toasts: Omit<ToastProps, 'onClose'>[];
  onRemoveToast: (id: string) => void;
}

export function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => onRemoveToast(toast.id)}
        />
      ))}
    </div>
  );
}

// Context-powered version used in App.tsx
export function ToastContainerFromContext() {
  const { toasts, removeToast } = useAppContext();
  return <ToastContainer toasts={toasts} onRemoveToast={removeToast} />;
}