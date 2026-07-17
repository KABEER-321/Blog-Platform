import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-indigo-600 shrink-0" />;
    }
  };

  const getStyle = (type) => {
    switch (type) {
      case 'success':
        return 'bg-white border-emerald-100 shadow-emerald-50';
      case 'error':
        return 'bg-white border-red-100 shadow-red-50';
      case 'warning':
        return 'bg-white border-amber-200 shadow-amber-50';
      case 'info':
      default:
        return 'bg-white border-indigo-100 shadow-indigo-50';
    }
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container stack */}
      <div className="fixed bottom-6 right-6 z-60 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`pointer-events-auto flex items-center justify-between gap-3 rounded-2xl border p-4 shadow-xl transition-all duration-300 animate-slide-in ${getStyle(
              t.type
            )}`}
          >
            <div className="flex items-center gap-3">
              {getIcon(t.type)}
              <span className="text-sm font-bold text-gray-800 leading-tight">{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              aria-label="Close notification"
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-55 hover:text-gray-650 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
