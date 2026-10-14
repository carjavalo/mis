import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import PlantillasTable from '@/components/templates-module/PlantillasTable';

const Templates = () => {
    return (
        <ProtectedRoute requiredRole="admin">
            <DashboardLayout>
                <PlantillasTable />
            </DashboardLayout>
        </ProtectedRoute>
    );
};

export default Templates;
