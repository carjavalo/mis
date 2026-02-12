// components/forms/modals/CreateFormModal.tsx
import React, { useState, useEffect } from 'react';
import { CreateFormData, FormColumn, DocumentType } from '../types/types';
import ColumnBuilder from '../ColumnBuilder';
import { formsService } from '@/lib/formService';

interface CreateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateFormModal: React.FC<CreateFormModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CreateFormData>({
    name: '',
    slug: '',
    columns: [],
    document_type_id: null,
    is_notification_enabled: false,
    notification_time: '08:00'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);

  useEffect(() => {
    if (isOpen) {
        // Cargar tipos de documentos
        formsService.getDocumentTypes()
          .then(setDocumentTypes)
          .catch(err => console.error("Error loading document types", err));
    } else {
      // Reset form cuando se cierra
      setFormData({ 
          name: '', 
          slug: '', 
          columns: [],
          document_type_id: null,
          is_notification_enabled: false,
          notification_time: '08:00'
      });
      setError('');
      setAutoSlug(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (autoSlug && formData.name) {
      const generatedSlug = formsService.generateSlug(formData.name);
      setFormData(prev => ({
        ...prev,
        slug: generatedSlug
      }));
    }
  }, [formData.name, autoSlug]);

  const validateForm = (): boolean => {
    // Validar nombre
    if (!formData.name.trim()) {
      setError('El nombre del formulario es obligatorio');
      return false;
    }

    // Validar slug
    if (!formData.slug.trim()) {
      setError('El slug es obligatorio');
      return false;
    }

    // Validar formato del slug
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(formData.slug)) {
      setError('El slug solo puede contener letras minúsculas, números y guiones');
      return false;
    }

    // Validar columnas
    if (formData.columns.length === 0) {
      setError('Debe agregar al menos una columna');
      return false;
    }

    // Validar cada columna
    for (let i = 0; i < formData.columns.length; i++) {
      const col = formData.columns[i];
      
      if (!col.name.trim() || !col.label.trim()) {
        setError(`La columna #${i + 1} debe tener nombre y etiqueta`);
        return false;
      }

      // Validar formato del nombre de columna (solo snake_case)
      const columnNameRegex = /^[a-z][a-z0-9_]*$/;
      if (!columnNameRegex.test(col.name)) {
        setError(`La columna #${i + 1}: El nombre debe estar en formato snake_case (solo letras minúsculas, números y _)`);
        return false;
      }

      // Validar opciones para tipo enum
      if (col.type === 'enum' && (!col.options || col.options.length === 0)) {
        setError(`La columna #${i + 1} de tipo "Lista de Opciones" debe tener al menos una opción`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar formulario
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('📤 Enviando datos del formulario:', formData);
      
      // Preparar datos para enviar
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        document_type_id: formData.document_type_id,
        is_notification_enabled: formData.is_notification_enabled,
        notification_time: formData.is_notification_enabled ? formData.notification_time : null,
        columns: formData.columns.map(col => ({
          name: col.name.trim(),
          type: col.type,
          label: col.label.trim(),
          required: col.required || false,
          options: col.type === 'enum' ? col.options : undefined
        }))
      };

      console.log('📦 Payload a enviar:', payload);

      // Llamar al servicio
      const result = await formsService.createForm(payload);
      console.log('✅ Formulario creado exitosamente:', result);
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('❌ Error al crear formulario:', err);
      
      // Manejar diferentes tipos de errores
      if (err.message.includes('Network') || err.message.includes('Failed to fetch')) {
        setError('Error de conexión. Verifique que el servidor esté funcionando.');
      } else if (err.message.includes('slug already exists')) {
        setError('El slug ya existe. Por favor use un slug diferente.');
      } else if (err.message.includes('Unauthorized') || err.message.includes('token')) {
        setError('No tiene permisos para crear formularios. Verifique su sesión.');
      } else {
        setError(err.message || 'Error al crear el formulario');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-[140] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Crear Nuevo Formulario</h3>
              <p className="text-blue-100 text-sm">Define la estructura de tu formulario dinámico</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-2">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="flex-1">{error}</span>
              </div>
            )}

            {/* Información Básica */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Información Básica y Configuración</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Formulario *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ej: Registro de Pruebas Donantes Aféresis"
                    className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug (URL amigable) *
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => {
                        setAutoSlug(false);
                        setFormData(prev => ({ ...prev, slug: e.target.value }));
                      }}
                      placeholder="ej: registro-pruebas-donantes"
                      className="flex-1 text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setAutoSlug(!autoSlug)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        autoSlug 
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                          : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                      }`}
                      disabled={isLoading}
                    >
                      {autoSlug ? 'Auto' : 'Manual'}
                    </button>
                  </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Documento
                    </label>
                    <select
                        value={formData.document_type_id || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, document_type_id: e.target.value ? Number(e.target.value) : null }))}
                        className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                    >
                        <option value="">Seleccione un tipo...</option>
                        {documentTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-2">
                    <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
                                <input 
                                    type="checkbox" 
                                    checked={formData.is_notification_enabled}
                                    onChange={(e) => setFormData(prev => ({ ...prev, is_notification_enabled: e.target.checked }))}
                                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-blue-600"
                                    style={{ right: formData.is_notification_enabled ? '0' : 'auto', left: formData.is_notification_enabled ? 'auto' : '0' }}
                                />
                                <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${formData.is_notification_enabled ? 'bg-blue-600' : 'bg-gray-300'}`}></label>
                            </div>
                            <span className="text-sm font-medium text-gray-700">Enviar recordatorios por correo a usuarios asignados</span>
                        </label>

                        {formData.is_notification_enabled && (
                            <div className="flex items-center space-x-2 animate-fadeIn">
                                <label className="text-sm font-medium text-gray-700">Hora:</label>
                                <input 
                                    type="time" 
                                    value={formData.notification_time || '08:00'}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notification_time: e.target.value }))}
                                    className="px-3 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                            </div>
                        )}
                    </div>
                    {formData.is_notification_enabled && (
                        <p className="text-xs text-gray-500 mt-2 ml-14">
                            Se enviará un correo electrónico todos los días a la hora seleccionada a todos los usuarios que tengan asignado este documento.
                        </p>
                    )}
                </div>
              </div>
            </div>

            {/* Column Builder */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <ColumnBuilder
                columns={formData.columns}
                onChange={(columns) => setFormData(prev => ({ ...prev, columns }))}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-xl flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {formData.columns.length > 0 && (
                <span className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{formData.columns.length} columna{formData.columns.length !== 1 ? 's' : ''} definida{formData.columns.length !== 1 ? 's' : ''}</span>
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || formData.columns.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Creando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Crear Formulario</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFormModal;
