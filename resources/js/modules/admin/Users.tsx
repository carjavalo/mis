import React from "react";
import UsersTable from "../../components/users-module/UsersTable";
import ProtectedRoute from "../../components/ProtectedRoute";
import DashboardLayout from "../../components/layouts/DashboardLayout";

export function Users() {
    return (
        <ProtectedRoute requiredRole="admin">
            <DashboardLayout>
                <div className="mb-8">
                    <h1 className="text-black text-3xl font-semibold">Panel de Usuarios</h1>
                    <p className="text-gray-400">Aqui podrás administrar los usuarios, crear y asignar formularios. Para registrar un nuevo usuario, haz clic en el botón de abajo.</p>
                </div>
                <UsersTable />
            </DashboardLayout>
        </ProtectedRoute>
    )
}
