import React from 'react';
import { DynamicForm, COLUMN_TYPES } from '../types/types';
import { getColumnIcon } from '@/components/ui/ColumnIcons';

interface ViewFormModalProps {
  isOpen: boolean;
  form: DynamicForm | null;
  onClose: () => void;
}

const ViewFormModal: React.FC<ViewFormModalProps> = ({ isOpen, form, onClose }) => {
  if (!isOpen || !form) return null;

  const getTypeInfo = (type: string) => {
    return COLUMN_TYPES.find(t => t.value === type) || { label: type };
  };

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[140] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{form.name}</h3>
              <p className="text-purple-100 text-sm">Detalles del formulario</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Información General */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-5 border border-purple-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Información General</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">ID</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">#{form.id}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Slug</label>
                <p className="text-lg font-mono text-gray-900 mt-1 bg-white px-3 py-1 rounded border">
                  {form.slug}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tabla en Base de Datos</label>
                <p className="text-sm font-mono text-gray-900 mt-1 bg-white px-3 py-2 rounded border">
                  {form.table_name}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Creado</label>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(form.created_at).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Última Actualización</label>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(form.updated_at).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Columnas */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                <span>Estructura de Columnas</span>
              </h4>
              <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                {form.columns_config.length} columnas
              </span>
            </div>

            <div className="space-y-3">
              {form.columns_config.map((column, index) => {
                const typeInfo = getTypeInfo(column.type);
                return (
                  <div
                    key={index}
                    className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-700">
                            {getColumnIcon(column.type, "w-4 h-4")}
                          </div>
                          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded">
                            #{index + 1}
                          </span>
                          <h5 className="font-semibold text-gray-900">{column.label}</h5>
                          {column.required && (
                            <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded">
                              Obligatorio
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                          <div>
                            <label className="text-xs font-medium text-gray-500">Nombre de Campo</label>
                            <p className="text-sm font-mono text-gray-900 mt-1 bg-gray-50 px-2 py-1 rounded">
                              {column.name}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500">Tipo</label>
                            <p className="text-sm text-gray-900 mt-1">
                              {typeInfo.label}
                            </p>
                          </div>
                        </div>

                        {column.type === 'enum' && column.options && (
                          <div className="mt-3">
                            <label className="text-xs font-medium text-gray-500">Opciones</label>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {column.options.map((opt, i) => (
                                <span
                                  key={i}
                                  className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded"
                                >
                                  {opt}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-xl flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewFormModal;
