import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthContext';
import CreateFormModal from './modals/CreateFormModal';
import ViewFormModal from './modals/ViewFormModal';
import DeleteFormModal from './modals/DeleteFormModal';
import { DynamicForm } from './types/types';
import { formsService } from '@/lib/formService';
import { useNavigate } from 'react-router-dom';
import Pagination from '@/components/ui/Pagination';
import { useToast } from '@/providers/ToastContext';
import { getNotificationCopy, NotificationKey } from '@/constants/notifications';
import ManageDocumentTypesModal from './modals/ManageDocumentTypesModal';
import ManageDocumentPermissionsModal from './modals/ManageDocumentPermissionsModal';

const FormsTable: React.FC = () => {
  const [forms, setForms] = useState<DynamicForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false); // Nuevo estado
  const [selectedForm, setSelectedForm] = useState<DynamicForm | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [showManageTypesModal, setShowManageTypesModal] = useState(false);

  const { hasRole } = useAuth();
  const { success, error: toastError } = useToast();

  const emitFormToast = (variant: 'success' | 'error', key: NotificationKey<'forms'>) => {
    const copy = getNotificationCopy('forms', key);
    const handler = variant === 'success' ? success : toastError;
    handler(copy.title, { description: copy.description });
    if (variant === 'error') {
      setError(copy.description ?? copy.title);
    } else {
      setError('');
    }
    return copy;
  };

  // Cargar formularios
  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      const formsData = await formsService.getAllForms();
      setForms(formsData);
      setError('');
    } catch {
      emitFormToast('error', 'loadError');
    } finally {
      setLoading(false);
    }
  };

  // Manejar eliminación
  const handleDeleteConfirm = async (formId: number) => {
    setActionLoading(true);
    setError('');

    try {
      await formsService.deleteForm(formId);
      setForms(prev => prev.filter(form => form.id !== formId));
      closeModals();
      emitFormToast('success', 'deleteSuccess');
    } catch {
      const copy = emitFormToast('error', 'deleteError');
      throw new Error(copy.title);
    } finally {
      setActionLoading(false);
    }
  };

  // Abrir modales
  const openCreateModal = () => setShowCreateModal(true);

  const openViewModal = (form: DynamicForm) => {
    setSelectedForm(form);
    setShowViewModal(true);
  };

  const openDeleteModal = (form: DynamicForm) => {
    setSelectedForm(form);
    setShowDeleteModal(true);
  };

  const openPermissionsModal = (form: DynamicForm) => {
      setSelectedForm(form);
      setShowPermissionsModal(true);
  };

  // Cerrar modales
  const closeModals = () => {
    setShowCreateModal(false);
    setShowViewModal(false);
    setShowDeleteModal(false);
    setShowPermissionsModal(false);
    setSelectedForm(null);
    setError('');
  };

  // Success handler para crear
  const handleCreateSuccess = () => {
    loadForms();
    emitFormToast('success', 'createSuccess');
  };

  // Función para obtener iniciales
  const getFormInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Gestión de Formularios Dinámicos</h2>
              <p className="text-blue-200 text-sm mt-1">Sistema MIS - Banco de Sangre HUV</p>
            </div>
            {(hasRole('admin') || hasRole('super_admin')) && (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-3 sm:mt-0">
                  <button
                    onClick={() => setShowManageTypesModal(true)}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 border border-white/20"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="font-semibold">Gestionar Tipos</span>
                  </button>

                  <button
                    onClick={openCreateModal}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">Crear Formulario</span>
                  </button>
              </div>
            )}
          </div>
        </div>
        
        <ManageDocumentTypesModal 
            isOpen={showManageTypesModal} 
            onClose={() => setShowManageTypesModal(false)} 
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded-lg flex items-start space-x-2">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414-1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b">
          <div className="bg-white p-4 rounded-lg border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 011-1h12a1 1 0 110 2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 font-medium">Total Formularios</p>
                <p className="text-3xl font-bold text-gray-900">{forms.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414-1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 font-medium">Activos</p>
                <p className="text-3xl font-bold text-gray-900">{forms.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 font-medium">Total Columnas</p>
                <p className="text-3xl font-bold text-gray-900">
                  {forms.reduce((sum, form) => sum + form.columns_config.length, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {forms.length === 0 && !loading && (
          <div className="text-center py-16 px-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-4">
              <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay formularios creados</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Comienza creando tu primer formulario dinámico para capturar datos del Banco de Sangre
            </p>
            {(hasRole('admin') || hasRole('super_admin')) && (
              <button
                onClick={openCreateModal}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Crear Primer Formulario</span>
              </button>
            )}
          </div>
        )}

        {/* Table */}
        {forms.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-200 border-b-2 border-gray-300">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Formulario
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Columnas
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Creado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {forms.slice((page - 1) * pageSize, page * pageSize).map((form) => (
                  <tr key={form.id} className="hover:bg-blue-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {getFormInitials(form.name)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{form.name}</div>
                          <div className="text-xs text-gray-500 font-mono">ID: {form.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded border border-gray-300">
                        {form.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        {form.columns_config.length} campos
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(form.created_at).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/dashboard-admin/documents/${form.id}`)}
                          className="text-purple-600 hover:text-purple-900 p-2 rounded-lg hover:bg-purple-50 transition-all duration-150 transform hover:scale-110"
                          title="Ver registros"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {(hasRole('admin') || hasRole('super_admin')) && (
                          <button 
                            onClick={() => openPermissionsModal(form)}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-all duration-150 transform hover:scale-110"
                            title="Gestionar Permisos"
                          >
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                             </svg>
                          </button>
                        )}

                        {(hasRole('admin') || hasRole('super_admin')) && (
                          <button
                            onClick={() => openDeleteModal(form)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-all duration-150 transform hover:scale-110"
                            title="Eliminar formulario"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {forms.length > pageSize && (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={forms.length}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        />
      )}

      {/* Modales */}
      <CreateFormModal
        isOpen={showCreateModal}
        onClose={closeModals}
        onSuccess={handleCreateSuccess}
      />

      <ViewFormModal
        isOpen={showViewModal}
        form={selectedForm}
        onClose={closeModals}
      />

      <DeleteFormModal
        isOpen={showDeleteModal}
        form={selectedForm}
        onConfirm={handleDeleteConfirm}
        onClose={closeModals}
        isLoading={actionLoading}
      />

      <ManageDocumentPermissionsModal 
        show={showPermissionsModal} 
        onClose={closeModals} 
        formId={selectedForm?.id || 0} 
        formName={selectedForm?.name || ''} 
      />
    </>
  );
};

export default FormsTable;
