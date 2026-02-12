import React, { useState } from 'react';
import { DynamicForm } from '../types/types';

interface DeleteFormModalProps {
  isOpen: boolean;
  form: DynamicForm | null;
  onConfirm: (formId: number) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

const DeleteFormModal: React.FC<DeleteFormModalProps> = ({
  isOpen,
  form,
  onConfirm,
  onClose,
  isLoading
}) => {
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen || !form) return null;

  const handleConfirm = async () => {
    if (confirmText.toLowerCase() === 'eliminar') {
      await onConfirm(form.id);
      setConfirmText('');
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-[140] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-5 flex items-center justify-between border-b border-white/15 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="bg-white/15 backdrop-blur p-3 rounded-full">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-white/70">Acción irreversible</p>
              <h3 className="text-2xl font-bold text-white leading-tight">Eliminar formulario</h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full p-2 transition-colors"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 pt-8 space-y-5 max-h-[80vh] overflow-y-auto bg-white">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 md:p-5 shadow-sm">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-900 mb-1">¡Advertencia!</h4>
                <p className="text-sm text-red-800">
                  Esta acción es <strong>permanente e irreversible</strong>. Se eliminará:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-red-800">
                  <li className="flex items-center space-x-2">
                    <span className="text-red-500">•</span>
                    <span>El formulario y su configuración</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-red-500">•</span>
                    <span>La tabla en la base de datos</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-red-500">•</span>
                    <span><strong>TODOS los registros almacenados</strong></span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <h5 className="text-sm font-semibold text-gray-900 mb-2">Formulario a eliminar:</h5>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-gray-500">Nombre:</span>
                <p className="font-semibold text-gray-900">{form.name}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Tabla:</span>
                <p className="font-mono text-sm text-gray-900">{form.table_name}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Columnas:</span>
                <p className="text-sm text-gray-900">{form.columns_config.length} columnas definidas</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Para confirmar, escribe <span className="font-bold text-red-600">ELIMINAR</span> en mayúsculas:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Escribe ELIMINAR"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-400"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-5 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
          <button
            onClick={handleClose}
            className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || confirmText.toLowerCase() !== 'eliminar'}
            className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>Eliminar Definitivamente</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteFormModal;
