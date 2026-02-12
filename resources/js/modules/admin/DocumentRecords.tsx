// modules/admin/DocumentRecords.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import RecordTable from '@/components/forms-module/RecordTable';
import { formsService } from '@/lib/formService';
import type { DynamicForm } from '@/lib/formService';
import DashboardLayout from '@/components/layouts/DashboardLayout';

const DocumentRecordsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState<DynamicForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadForm(parseInt(id, 10));
    } else {
        setError('ID de documento no valido');
        setLoading(false);
    }
  }, [id]);

  const loadForm = async (formId: number) => {
    try {
      setLoading(true);
      setError('');
      const formData = await formsService.getFormById(formId);
      setForm(formData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar formulario');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard-admin/documents');
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="admin">
        <DashboardLayout>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
                <p className="text-black font-medium">Cargando formulario...</p>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error || !form) {
    return (
      <ProtectedRoute requiredRole="admin">
        <DashboardLayout>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black mb-2">Error al cargar</h3>
                <p className="text-black text-center mb-6">
                  {error || 'No se pudo encontrar el formulario'}
                </p>
                <button
                  onClick={handleBack}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Volver a Documentos
                </button>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-black">Volver a Documentos</span>
          </button>
        </div>

        <RecordTable 
          form={form} 
          documentId={form.id}
          onRecordsChange={() => {}}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DocumentRecordsPage;
