import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  type = 'danger' // danger, warning, info
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
          type === 'danger' ? 'bg-red-50' : type === 'warning' ? 'bg-amber-50' : 'bg-primary-50'
        }`}>
          {type === 'danger' ? (
            <Trash2 className="w-8 h-8 text-red-600" />
          ) : (
            <AlertTriangle className={`w-8 h-8 ${type === 'warning' ? 'text-amber-600' : 'text-primary-600'}`} />
          )}
        </div>

        <h3 className="text-xl font-bold text-slate-800 text-center mb-2">{title}</h3>
        <p className="text-slate-500 text-center text-sm mb-8 leading-relaxed">
          {message}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`w-full py-3 font-bold rounded-xl transition-all shadow-lg text-sm ${
              type === 'danger' 
                ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-600/20' 
                : type === 'warning'
                ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20'
                : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-600/20'
            }`}
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors text-sm"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
