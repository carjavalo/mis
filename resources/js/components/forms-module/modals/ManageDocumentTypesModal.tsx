import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DocumentType } from '../types/types';
import { formsService } from '@/lib/formService';

interface ManageDocumentTypesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManageDocumentTypesModal: React.FC<ManageDocumentTypesModalProps> = ({ isOpen, onClose }) => {
  const [types, setTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [newType, setNewType] = useState({ name: '', slug: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadTypes();
    }
  }, [isOpen]);

  const loadTypes = async () => {
    setLoading(true);
    try {
      const data = await formsService.getDocumentTypes();
      setTypes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newType.name) return;

    setCreating(true);
    setError('');

    try {
      const slug = newType.slug || generateSlug(newType.name);
      const response = await axios.post('/api/document-types', { ...newType, slug });
      setTypes([...types, response.data]);
      setNewType({ name: '', slug: '', description: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear tipo');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este tipo?')) return;
    try {
      await axios.delete(`/api/document-types/${id}`);
      setTypes(types.filter(t => t.id !== id));
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-4 rounded-t-xl flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Gestionar Tipos de Documentos</h3>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
            {/* Create Form */}
            <form onSubmit={handleCreate} className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-4">Crear Nuevo Tipo</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border rounded-md"
                            value={newType.name}
                            onChange={e => setNewType({...newType, name: e.target.value, slug: generateSlug(e.target.value)})}
                            placeholder="Ej: Diario, Revisión, Auditoría"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border rounded-md bg-gray-100"
                            value={newType.slug}
                            onChange={e => setNewType({...newType, slug: e.target.value})}
                        />
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border rounded-md"
                            value={newType.description}
                            onChange={e => setNewType({...newType, description: e.target.value})}
                        />
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <div className="mt-4 text-right">
                    <button 
                        type="submit" 
                        disabled={creating || !newType.name}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                        {creating ? 'Creando...' : 'Crear Tipo'}
                    </button>
                </div>
            </form>

            <h4 className="font-semibold text-gray-800 mb-2">Tipos Existentes</h4>
            {loading ? (
                <p>Cargando...</p>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {types.map(type => (
                                <tr key={type.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{type.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{type.slug}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDelete(type.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                            {types.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No hay tipos definidos</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ManageDocumentTypesModal;
