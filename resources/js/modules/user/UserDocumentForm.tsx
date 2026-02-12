import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formsService, DynamicForm } from '@/lib/formService';
import ProtectedRoute from '@/components/ProtectedRoute';
import { UserDashboardLayout } from '@/components/layouts/UserDashboardLayout';
import DynamicRecordForm from '@/components/forms-module/DynamicRecordForm';
import { ArrowLeft } from 'lucide-react';

const UserDocumentFormPage: React.FC = () => {
    const { id, recordId } = useParams<{ id: string; recordId?: string }>();
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

    const handleSuccess = () => {
        navigate(`/dashboard-users/documents/${id}`);
    };

    const handleCancel = () => {
        navigate(`/dashboard-users/documents/${id}`);
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
                {/* Header removed from here as DynamicRecordForm handles it better for clean integration */}

                <DynamicRecordForm
                    form={form}
                    documentId={form.id}
                    recordId={recordId ? parseInt(recordId) : null}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </UserDashboardLayout>
        </ProtectedRoute>
    );
};

export default UserDocumentFormPage;
