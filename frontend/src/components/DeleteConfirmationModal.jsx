import React, { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, message = 'Are you sure you want to delete this?' }) => {
  const cancelBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (cancelBtnRef.current) {
          cancelBtnRef.current.focus();
        }
      }, 60);

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 transition-all transform scale-100 animate-slide-in">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-650">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 id="delete-confirm-title" className="mt-4 text-lg font-black text-gray-950">Confirm Deletion</h3>
          <p className="mt-2 text-sm text-gray-500 font-medium leading-relaxed">{message}</p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            ref={cancelBtnRef}
            onClick={onClose}
            className="w-full rounded-xl border border-gray-250 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-55 transition-colors btn-active-press"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-full rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white shadow-md shadow-red-100 hover:bg-red-700 transition-colors btn-active-press"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
