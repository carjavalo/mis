import React, { useState, useEffect } from 'react';
import { CreateUserModalProps, UserFormData } from '../types/types';
import { ChevronLeft, ChevronRight, ChevronDown, User } from 'lucide-react';
import { formsService, DynamicForm } from '../../../lib/formService';

interface DocumentPermission {
  document_id: number;
  document_name: string;
  document_slug: string;
  can_view: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

interface ExtendedUserFormData extends UserFormData {
  document_permissions: DocumentPermission[];
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onSubmit,
  onClose,
  isLoading = false
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [expandedDocuments, setExpandedDocuments] = useState<{[key: string]: boolean}>({});
  const [availableDocuments, setAvailableDocuments] = useState<DynamicForm[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [formData, setFormData] = useState<ExtendedUserFormData>({
    nombre: '',
    correo: '',
    password: '',
    telefono: '',
    rol: 'user',
    document_permissions: []
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && currentStep === 2) {
      loadAvailableDocuments();
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setExpandedDocuments({});
      setFormData({
        nombre: '',
        correo: '',
        password: '',
        telefono: '',
        rol: 'user',
        document_permissions: []
      });
      setError('');
    }
  }, [isOpen]);

  const loadAvailableDocuments = async () => {
    try {
      setLoadingDocuments(true);
      setError('');
      
      const documents = await formsService.getAllForms();
      
      setAvailableDocuments(documents);
      
      const initialPermissions = documents.map((doc: DynamicForm) => ({
        document_id: doc.id,
        document_name: doc.name,
        document_slug: doc.slug,
        can_view: false,
        can_edit: false,
        can_delete: false
      }));

      setFormData(prev => ({
        ...prev,
        document_permissions: initialPermissions
      }));
      
    } catch (err: any) {
      console.error('Error al cargar documentos:', err);
      setError('Error al cargar documentos disponibles: ' + err.message);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (currentStep === 1) {
      if (!formData.password) {
        setError('La contraseña es requerida');
        return;
      }

      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      if (formData.rol === 'admin') {
        try {
          const finalData = {
            nombre: formData.nombre,
            correo: formData.correo,
            password: formData.password,
            telefono: formData.telefono,
            rol: formData.rol,
            document_permissions: []
          };
          
          await onSubmit(finalData as any);
        } catch (err: any) {
          setError(err.message || 'Error al crear usuario');
        }
        return;
      }

      setCurrentStep(2);
      return;
    }

    try {
      const activePermissions = formData.document_permissions.filter(
        perm => perm.can_view
      );

      const finalData = {
        nombre: formData.nombre,
        correo: formData.correo,
        password: formData.password,
        telefono: formData.telefono,
        rol: formData.rol,
        document_permissions: activePermissions
      };
      
      await onSubmit(finalData as any);
    } catch (err: any) {
      setError(err.message || 'Error al crear usuario');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (documentId: number, field: keyof DocumentPermission, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      document_permissions: prev.document_permissions.map(perm => 
        perm.document_id === documentId 
          ? { 
              ...perm, 
              [field]: value,
              ...(field === 'can_view' && !value ? { can_edit: false, can_delete: false } : {})
            } 
          : perm
      )
    }));
  };

  const toggleDocument = (documentId: number) => {
    setExpandedDocuments(prev => ({
      ...prev,
      [documentId]: !prev[documentId]
    }));
  };

  const goBack = () => {
    setCurrentStep(1);
    setError('');
  };

  const stats = {
    total: availableDocuments.length,
    withAccess: formData.document_permissions.filter(p => p.can_view).length,
    canEdit: formData.document_permissions.filter(p => p.can_edit).length,
    canDelete: formData.document_permissions.filter(p => p.can_delete).length
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[140] flex items-center justify-center p-4">

      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        <div className="bg-green-600 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">
              Crear Nuevo Usuario
            </h3>
            <div className="text-white text-sm">
              {currentStep}/2
            </div>
          </div>
          
          <div className="w-full bg-green-500 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${(currentStep / 2) * 100}%` }}
            />
          </div>
          
          <p className="text-green-100 text-sm mt-2">
            {currentStep === 1 ? 'Información básica del usuario' : 'Asignar documentos y permisos'}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
            <div className="flex items-center">
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4 text-green-600">
                <User className="w-5 h-5" />
                <span className="font-medium">Información Personal</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  name="nombre"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-black"
                  placeholder="Dr. Juan Pérez"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="correo"
                  required
                  value={formData.correo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-black"
                  placeholder="juan.perez@huv.gov.co"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-black"
                  placeholder="Mínimo 6 caracteres"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  La contraseña debe tener al menos 6 caracteres
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="telefono"
                  required
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-black"
                  placeholder="3001234567"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol *
                </label>
                <select
                  name="rol"
                  required
                  value={formData.rol}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-black"
                  disabled={isLoading}
                >
                  <option value="user">Usuario Regular</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Administrador</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Los administradores tienen acceso completo a todos los documentos automáticamente
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && formData.rol !== 'admin' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Asignar Documentos y Permisos
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600">Total Docs</p>
                    <p className="text-lg font-bold text-blue-800">{stats.total}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-xs text-green-600">Con Acceso</p>
                    <p className="text-lg font-bold text-green-800">{stats.withAccess}</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-xs text-yellow-600">Pueden Editar</p>
                    <p className="text-lg font-bold text-yellow-800">{stats.canEdit}</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <p className="text-xs text-red-600">Pueden Eliminar</p>
                    <p className="text-lg font-bold text-red-800">{stats.canDelete}</p>
                  </div>
                </div>
              </div>

              {loadingDocuments ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <span className="ml-3 text-gray-600">Cargando documentos...</span>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {formData.document_permissions.map((permission) => {
                    const isExpanded = expandedDocuments[permission.document_id] || false;

                    return (
                      <div key={permission.document_id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-3 flex-1">
                            <button 
                              type="button"
                              onClick={() => toggleDocument(permission.document_id)}
                              className="text-gray-600 hover:text-gray-800"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm">
                                {permission.document_name}
                              </h4>
                              <p className="text-xs text-gray-500">
                                /{permission.document_slug}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={permission.can_view}
                                onChange={(e) => handlePermissionChange(permission.document_id, 'can_view', e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                disabled={isLoading}
                              />
                              <span className="text-sm font-medium text-gray-700">Acceso</span>
                            </label>
                          </div>
                        </div>

                        {isExpanded && permission.can_view && (
                          <div className="bg-white p-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={permission.can_edit}
                                  onChange={(e) => handlePermissionChange(permission.document_id, 'can_edit', e.target.checked)}
                                  className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                  disabled={isLoading}
                                />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Puede Editar</p>
                                  <p className="text-xs text-gray-500">Crear y modificar registros</p>
                                </div>
                              </label>

                              <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={permission.can_delete}
                                  onChange={(e) => handlePermissionChange(permission.document_id, 'can_delete', e.target.checked)}
                                  className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                                  disabled={isLoading}
                                />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Puede Eliminar</p>
                                  <p className="text-xs text-gray-500">Eliminar registros</p>
                                </div>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Información sobre permisos:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Acceso:</strong> El usuario puede ver y listar registros del documento</li>
                  <li>• <strong>Puede Editar:</strong> El usuario puede crear y modificar registros</li>
                  <li>• <strong>Puede Eliminar:</strong> El usuario puede eliminar registros</li>
                  <li>• <strong>Administradores:</strong> Tienen acceso completo automáticamente</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-6">
            {currentStep === 2 && (
              <button
                type="button"
                onClick={goBack}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Atrás
              </button>
            )}
            
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isLoading || (currentStep === 2 && loadingDocuments)}
              className="flex-1 px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creando...
                </>
              ) : currentStep === 1 ? (
                <>
                  {formData.rol === 'admin' ? 'Crear Usuario' : 'Siguiente'}
                  {formData.rol !== 'admin' && <ChevronRight className="w-4 h-4" />}
                </>
              ) : (
                'Crear Usuario'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
