import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './providers/ToastContext';
import { Login } from './modules/auth/Login';
import { DashboardHome } from './modules/admin/DashboardHome';
import { Users } from './modules/admin/Users';

import Documents from './modules/admin/Documents';
import DocumentRecordsPage from './modules/admin/DocumentRecords';
import DocumentRecordFormPage from './modules/admin/DocumentRecordForm';

// User Module Imports
import { UserDashboardHome } from './modules/user/UserDashboardHome';
import UserDocuments from './modules/user/UserDocuments';
import UserDocumentRecords from './modules/user/UserDocumentRecords';
import UserDocumentFormPage from './modules/user/UserDocumentForm';
import ActivityLog from './modules/admin/ActivityLog';
import ProtectedRoute from './components/ProtectedRoute';
import { SuperAdminDashboardHome } from './modules/superadmin/SuperAdminDashboardHome';

import './bootstrap';
import '../css/app.css';

import { AuthProvider } from './providers/AuthContext';

const App = () => {
    return (
        <AuthProvider>
            <ToastProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        
                        {/* Admin Routes */}
                        <Route
                            path="/dashboard-admin"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <DashboardHome />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard-admin/users"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <Users />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard-admin/documents"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <Documents />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard-admin/documents/:id"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <DocumentRecordsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard-admin/documents/:id/new"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <DocumentRecordFormPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard-admin/documents/:id/:recordId"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <DocumentRecordFormPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard-admin/activity"
                            element={
                                <ProtectedRoute requiredRole="super-admin">
                                    <ActivityLog />
                                </ProtectedRoute>
                            }
                        />
                        
                        {/* Super Admin Routes */}
                        <Route
                            path="/dashboard-superadmin"
                            element={
                                <ProtectedRoute requiredRole="super-admin">
                                    <SuperAdminDashboardHome />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard-superadmin/users"
                            element={
                                <ProtectedRoute requiredRole="super-admin">
                                    <Users />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard-superadmin/documents"
                            element={
                                <ProtectedRoute requiredRole="super-admin">
                                    <Documents />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard-superadmin/documents/:id"
                            element={
                                <ProtectedRoute requiredRole="super-admin">
                                    <DocumentRecordsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard-superadmin/documents/:id/new"
                            element={
                                <ProtectedRoute requiredRole="super-admin">
                                    <DocumentRecordFormPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard-superadmin/documents/:id/:recordId"
                            element={
                                <ProtectedRoute requiredRole="super-admin">
                                    <DocumentRecordFormPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard-superadmin/activity"
                            element={
                                <ProtectedRoute requiredRole="super-admin">
                                    <ActivityLog />
                                </ProtectedRoute>
                            }
                        />
                        
                        {/* User Routes */}
                        <Route
                            path="/dashboard-users"
                            element={
                                <ProtectedRoute requiredRole="user">
                                    <UserDashboardHome />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard-users/documents"
                            element={
                                <ProtectedRoute requiredRole="user">
                                    <UserDocuments />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard-users/documents/:id"
                            element={
                                <ProtectedRoute requiredRole="user">
                                    <UserDocumentRecords />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard-users/documents/:id/new"
                            element={
                                <ProtectedRoute requiredRole="user">
                                    <UserDocumentFormPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard-users/documents/:id/:recordId"
                            element={
                                <ProtectedRoute requiredRole="user">
                                    <UserDocumentFormPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </BrowserRouter>
            </ToastProvider>
        </AuthProvider>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
