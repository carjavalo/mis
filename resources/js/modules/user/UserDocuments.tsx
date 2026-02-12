import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { UserDashboardLayout } from '@/components/layouts/UserDashboardLayout';
import UserDocumentsList from '@/components/my-documents-user/UserDocumentsList';

const UserDocuments: React.FC = () => {
    return (
        <ProtectedRoute>
            <UserDashboardLayout>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Mis Documentos</h1>
                    <p className="text-gray-600">Accede a los documentos asignados a tu usuario.</p>
                </div>
                <UserDocumentsList />
            </UserDashboardLayout>
        </ProtectedRoute>
    );
};

export default UserDocuments;
