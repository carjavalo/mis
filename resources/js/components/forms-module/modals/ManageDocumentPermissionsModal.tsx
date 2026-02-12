import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@/providers/ToastContext';
import { X, Search, Save, User, UserPlus, Trash2 } from 'lucide-react';

interface UserPermission {
  user_id: number;
  user_name: string;
  user_email: string;
  user_role: string;
  can_view: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_review: boolean;
}

interface UserBasic {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
}

// ... imports
interface ManageDocumentPermissionsModalProps {
  show: boolean;
  onClose: () => void;
  formId: number;
  formName: string;
}

const ManageDocumentPermissionsModal: React.FC<ManageDocumentPermissionsModalProps> = ({
  show,
  onClose,
  formId,
  formName
}) => {
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [allUsers, setAllUsers] = useState<UserBasic[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { success, error } = useToast();

  useEffect(() => {
    if (show && formId) {
      loadData();
    }
  }, [show, formId]);

  const loadData = async () => {
    // ... existing logic ...
    setLoading(true);
    try {
      const [permissionsRes, usersRes] = await Promise.all([
        axios.get(`/api/forms/${formId}/permissions`),
        axios.get('/api/users')
      ]);
      setPermissions(permissionsRes.data.data);
      setAllUsers(usersRes.data);
    } catch (err) {
      error('Error', { description: 'No se pudieron cargar los datos de permisos.' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (userId: number, field: keyof UserPermission, value: boolean) => {
    setPermissions(prev => prev.map(p => {
      if (p.user_id === userId) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  const handleAddUser = (user: UserBasic) => {
    if (permissions.find(p => p.user_id === user.id)) return;

    const newPermission: UserPermission = {
      user_id: user.id,
      user_name: user.nombre,
      user_email: user.correo,
      user_role: user.rol,
      can_view: true,
      can_edit: false,
      can_delete: false,
      can_review: false
    };

    setPermissions([...permissions, newPermission]);
  };

  const handleRemoveUser = (userId: number) => {
    setPermissions(prev => prev.filter(p => p.user_id !== userId));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const promises = permissions.map(p => {
        return axios.post(`/api/users/${p.user_id}/document-permissions`, {
          permissions: [{
            document_id: formId,
            can_view: p.can_view,
            can_edit: p.can_edit,
            can_delete: p.can_delete,
            can_review: p.can_review
          }]
        });
      });
      await Promise.all(promises);
      success('Guardado', { description: 'Permisos actualizados correctamente.' });
      onClose();
    } catch (err) {
      error('Error', { description: 'Error al asegurar cambios.' });
    } finally {
      setSaving(false);
    }
  };
  
    const handleDeleteImmediate = async (userId: number) => {
        if(!confirm('¿Estás seguro de quitar los permisos a este usuario?')) return;
        
        try {
            await axios.delete(`/api/users/${userId}/document-permissions/${formId}`);
            handleRemoveUser(userId);
            success('Eliminado', { description: 'Usuario removido del documento.' });
        } catch(err) {
            error('Error', { description: 'No se pudo remover el usuario.' });
        }
    };

  if (!show) return null;

  const availableUsers = allUsers.filter(u => 
    !permissions.some(p => p.user_id === u.id) && 
    (u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || u.correo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl border border-gray-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 rounded-t-xl flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-blue-200" />
              Gestión de Permisos
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Documento: <span className="font-semibold">{formName}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-blue-100 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Left: Add Users */}
          <div className="w-full md:w-1/3 border-r border-gray-200 p-4 flex flex-col bg-gray-50">
            <h3 className="text-gray-800 font-semibold mb-3 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" /> Agregar Usuario
            </h3>
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {availableUsers.map(user => (
                <div key={user.id} className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all"
                     onClick={() => handleAddUser(user)}>
                  <p className="text-gray-800 font-medium text-sm">{user.nombre}</p>
                  <p className="text-gray-500 text-xs">{user.rol}</p>
                </div>
              ))}
              {availableUsers.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No se encontraron usuarios disponibles.</p>
              )}
            </div>
          </div>

          {/* Right: Permissions List */}
          <div className="w-full md:w-2/3 p-4 flex flex-col bg-white">
            <h3 className="text-gray-800 font-semibold mb-3">Usuarios con Acceso</h3>
            
            <div className="bg-white rounded-lg border border-gray-200 flex-1 overflow-hidden flex flex-col shadow-sm">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-2 p-3 border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="col-span-4">Usuario</div>
                <div className="col-span-2 text-center">Ver</div>
                <div className="col-span-2 text-center">Editar</div>
                <div className="col-span-2 text-center">Eliminar</div>
                <div className="col-span-2 text-center text-amber-600">Revisor</div>
              </div>

              {/* Rows */}
              <div className="overflow-y-auto flex-1 custom-scrollbar">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Cargando...</div>
                ) : permissions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No hay usuarios asignados a este documento.</div>
                ) : (
                    permissions.map(p => (
                        <div key={p.user_id} className="grid grid-cols-12 gap-2 p-3 border-b border-gray-100 items-center hover:bg-blue-50 transition-colors group">
                            <div className="col-span-4 overflow-hidden">
                                <p className="text-gray-900 text-sm font-medium truncate">{p.user_name}</p>
                                <p className="text-gray-500 text-xs truncate">{p.user_email}</p>
                            </div>
                            
                            <div className="col-span-2 flex justify-center">
                                <input type="checkbox" checked={p.can_view} onChange={(e) => handlePermissionChange(p.user_id, 'can_view', e.target.checked)} 
                                       className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                            </div>
                            <div className="col-span-2 flex justify-center">
                                <input type="checkbox" checked={p.can_edit} onChange={(e) => handlePermissionChange(p.user_id, 'can_edit', e.target.checked)}
                                       className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                            </div>
                            <div className="col-span-2 flex justify-center">
                                <input type="checkbox" checked={p.can_delete} onChange={(e) => handlePermissionChange(p.user_id, 'can_delete', e.target.checked)}
                                       className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                            </div>
                            <div className="col-span-2 flex justify-center relative">
                                <input type="checkbox" checked={p.can_review} onChange={(e) => handlePermissionChange(p.user_id, 'can_review', e.target.checked)}
                                       className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500 cursor-pointer" />
                                       
                                <button onClick={() => handleDeleteImmediate(p.user_id)} className="absolute right-0 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded-md transition-all" title="Quitar acceso">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium" disabled={saving}>
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {saving ? 'Guardando...' : (
              <>
                <Save className="w-4 h-4" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


export default ManageDocumentPermissionsModal;
