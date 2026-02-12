import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formsService, DynamicForm } from '@/lib/formService';
import ProtectedRoute from '@/components/ProtectedRoute';
import { UserDashboardLayout } from '@/components/layouts/UserDashboardLayout';
import UserRecordsTable from '@/components/my-documents-user/UserRecordsTable';
import { ArrowLeft } from 'lucide-react';

const UserDocumentRecords: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [form, setForm] = useState<DynamicForm | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadForm(parseInt(id));
        } else {
            setLoading(false);
        }
    }, [id]);

    const loadForm = async (formId: number) => {
        try {
            setLoading(true);
            const data = await formsService.getFormById(formId);
            setForm(data);
        } catch (error) {
            console.error('Error loading form:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <UserDashboardLayout>
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </UserDashboardLayout>
            </ProtectedRoute>
        );
    }

    if (!form) {
        return (
            <ProtectedRoute>
                <UserDashboardLayout>
                    <div className="text-center py-12">
                        <h2 className="text-xl font-bold text-gray-900">Documento no encontrado</h2>
                        <button 
                            onClick={() => navigate('/dashboard-users/documents')}
                            className="mt-4 text-blue-600 hover:text-blue-800"
                        >
                            Volver a mis documentos
                        </button>
                    </div>
                </UserDashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <UserDashboardLayout>
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/dashboard-users/documents')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Volver a mis documentos
                    </button>
                    
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{form.name}</h1>
                            <p className="text-gray-600 mt-1">
                                {form.description || 'Consulta y gestiona los registros de este documento.'}
                            </p>
                        </div>
                    </div>
                </div>

                <UserRecordsTable 
                    form={form} 
                    documentId={form.id} 
                />
            </UserDashboardLayout>
        </ProtectedRoute>
    );
};

export default UserDocumentRecords;
