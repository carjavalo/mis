import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Folder, Eye, Edit, Trash2, CheckCircle, XCircle, Lock } from 'lucide-react';
import axios from 'axios';

interface UserDocument {
    id: number;
    name: string;
    slug: string;
    description?: string;
    can_view: boolean;
    can_edit: boolean;
    can_delete: boolean;
    is_admin?: boolean;
}

const UserDocumentsList: React.FC = () => {
    const [documents, setDocuments] = useState<UserDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadUserDocuments();
    }, []);

    const loadUserDocuments = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get('/api/my-documents');
            if (response.data.success) {
                setDocuments(response.data.data);
            } else {
                // If the response is directly the array (depending on backend implementation)
                setDocuments(Array.isArray(response.data) ? response.data : response.data.data || []);
            }
        } catch (err: any) {
            console.error('Error:', err);
            setError(err.response?.data?.message || err.message || 'Error al cargar documentos');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDocument = (document: UserDocument) => {
        if (!document.can_view) return;
        navigate(`/dashboard-users/documents/${document.id}`);
    };

    const handleCreateRecord = (document: UserDocument) => {
        if (!document.can_edit) return;
        navigate(`/dashboard-users/documents/${document.id}/new`);
    };

    const getPermissionBadge = (document: UserDocument) => {
        if (document.is_admin) {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Acceso Completo
                </span>
            );
        }

        const permissions = [];
        if (document.can_view) permissions.push('Ver');
        if (document.can_edit) permissions.push('Editar');
        if (document.can_delete) permissions.push('Eliminar');

        if (permissions.length === 0) {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <Lock className="w-3 h-3 mr-1" />
                    Sin Acceso
                </span>
            );
        }

        return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                {permissions.join(', ')}
            </span>
        );
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
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                            <Folder className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Mis Documentos</h2>
                            <p className="text-blue-100 text-sm">
                                {currentUser?.rol === 'admin'
                                    ? 'Acceso completo a todos los documentos'
                                    : 'Documentos asignados a tu usuario'
                                }
                            </p>
                        </div>
                    </div>
                    <div className="text-white text-sm bg-blue-700 px-3 py-1 rounded-full">
                        {documents.length} documento{documents.length !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
                    {error}
                </div>
            )}

            {/* Content */}
            <div className="p-6">
                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-600">Total</p>
                        <p className="text-2xl font-bold text-blue-800">{documents.length}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <p className="text-sm text-green-600">Pueden Ver</p>
                        <p className="text-2xl font-bold text-green-800">
                            {documents.filter(d => d.can_view).length}
                        </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-600">Pueden Editar</p>
                        <p className="text-2xl font-bold text-yellow-800">
                            {documents.filter(d => d.can_edit).length}
                        </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <p className="text-sm text-red-600">Pueden Eliminar</p>
                        <p className="text-2xl font-bold text-red-800">
                            {documents.filter(d => d.can_delete).length}
                        </p>
                    </div>
                </div>

                {/* Lista de Documentos */}
                <div className="space-y-4">
                    {documents.length === 0 ? (
                        <div className="text-center py-12">
                            <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No tienes documentos asignados
                            </h3>
                            <p className="text-gray-500">
                                {currentUser?.rol === 'admin'
                                    ? 'No hay documentos creados en el sistema'
                                    : 'Contacta al administrador para que te asigne documentos'
                                }
                            </p>
                        </div>
                    ) : (
                        documents.map((document) => (
                            <div
                                key={document.id}
                                className={`border rounded-lg p-4 transition-all duration-200 ${document.can_view
                                        ? 'border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer'
                                        : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                                    }`}
                                onClick={() => document.can_view && handleViewDocument(document)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start space-x-4 flex-1">
                                        <div className={`p-3 rounded-lg ${document.can_view ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'
                                            }`}>
                                            <Folder className="w-6 h-6" />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className={`font-semibold ${document.can_view ? 'text-gray-900' : 'text-gray-500'
                                                    }`}>
                                                    {document.name}
                                                </h3>
                                                {getPermissionBadge(document)}
                                            </div>

                                            <p className="text-sm text-gray-500 mb-2">
                                                /{document.slug}
                                            </p>

                                            {document.description && (
                                                <p className="text-sm text-gray-600">
                                                    {document.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex items-center space-x-2 ml-4">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewDocument(document);
                                            }}
                                            disabled={!document.can_view}
                                            className={`p-2 rounded-lg transition-colors ${document.can_view
                                                    ? 'text-blue-600 hover:bg-blue-100'
                                                    : 'text-gray-400 cursor-not-allowed'
                                                }`}
                                            title={document.can_view ? 'Ver documento' : 'Sin permisos de visualización'}
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCreateRecord(document);
                                            }}
                                            disabled={!document.can_edit}
                                            className={`p-2 rounded-lg transition-colors ${document.can_edit
                                                    ? 'text-green-600 hover:bg-green-100'
                                                    : 'text-gray-400 cursor-not-allowed'
                                                }`}
                                            title={document.can_edit ? 'Editar registros' : 'Sin permisos de edición'}
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>

                                        {document.can_delete && (
                                            <div className="p-2 text-red-600" title="Puede eliminar registros">
                                                <Trash2 className="w-5 h-5" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Detalles de permisos */}
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <span className={`flex items-center space-x-1 ${document.can_view ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {document.can_view ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                            <span>Ver</span>
                                        </span>

                                        <span className={`flex items-center space-x-1 ${document.can_edit ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {document.can_edit ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                            <span>Editar</span>
                                        </span>

                                        <span className={`flex items-center space-x-1 ${document.can_delete ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {document.can_delete ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                            <span>Eliminar</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {currentUser?.rol !== 'admin' && documents.length > 0 && (
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Información de Accesos</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Solo puedes ver y trabajar con los documentos que te han sido asignados</li>
                            <li>• Los permisos (ver, editar, eliminar) son configurados por el administrador</li>
                            <li>• Si necesitas acceso a más documentos, contacta al administrador del sistema</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDocumentsList;
