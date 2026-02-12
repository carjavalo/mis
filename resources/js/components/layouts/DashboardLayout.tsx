import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from '../shared/Header';
import { Home, Users, FileText, X, Activity } from 'lucide-react';
import { useAuth } from '@/providers/AuthContext';

interface MenuItem {
  id: string;
  name: string;
  href: string;
  icon: React.ReactElement;
  active?: boolean;
  requiredRole?: string;
}

const getMenuItems = (userRole?: string): MenuItem[] => {
  const basePrefix = userRole === 'super-admin' ? '/dashboard-superadmin' : '/dashboard-admin';
  
  return [
    {
      id: 'inicio',
      name: 'Inicio',
      href: basePrefix,
      icon: <Home className="w-6 h-6" />,
    },
    {
      id: 'usuarios',
      name: 'Usuarios',
      href: `${basePrefix}/users`,
      icon: <Users className="w-6 h-6" />,
    },
    {
      id: 'documents',
      name: 'Documentos',
      href: `${basePrefix}/documents`,
      icon: <FileText className="w-6 h-6" />,
    },
    {
      id: 'activity',
      name: 'Actividad',
      href: `${basePrefix}/activity`,
      icon: <Activity className="w-6 h-6" />,
      requiredRole: 'super-admin'
    },
  ];
};

const normalize = (s: string) => (s !== '/' ? s.replace(/\/+$/, '') : '/');

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user } = useAuth();
  const pathname = normalize(location.pathname || '/');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleMenuItems = useMemo(() => {
    const items = getMenuItems(user?.rol);
    return items.filter(item => 
      !item.requiredRole || item.requiredRole === user?.rol
    );
  }, [user]);

  const rootHref = useMemo(
    () => normalize(visibleMenuItems.length > 0 ? visibleMenuItems.reduce((a, b) => (a.href.length <= b.href.length ? a : b)).href : '/dashboard-admin'),
    [visibleMenuItems]
  );

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    const h = normalize(href);
    if (h === rootHref) return pathname === rootHref;
    return pathname === h || pathname.startsWith(h + '/');
  };

  const computedMenu = useMemo<MenuItem[]>(
    () => visibleMenuItems.map((item) => ({ ...item, active: isActive(item.href) })),
    [pathname, visibleMenuItems]
  );

  const currentSection = computedMenu.find((m) => m.active)?.name ?? 'Inicio';

  return (
    <div className="min-h-screen bg-gray-50 lg:pl-80">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          aria-label="Cerrar menú"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 transform bg-blue-800 shadow-xl transition-transform duration-300 ease-in-out pt-20 lg:pt-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        aria-label="Barra lateral"
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 lg:hidden bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="flex flex-col items-center px-6 py-8">
          <div className="w-28 h-28 bg-white rounded-2xl mb-4 p-4 shadow-lg">
            <img
              src="/logo-hospital.png"
              alt="Logo del Hospital"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-white text-lg font-bold text-center leading-tight">
            MIS - BANCO DE SANGRE
          </h1>
        </div>

        <nav className="mt-8 px-4 " role="navigation" aria-label="Navegación principal">
          <ul className="space-y-2">
            {computedMenu.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30
                    ${item.active
                      ? 'bg-blue-600 bg-opacity-50 border-l-4 border-blue-300 shadow-lg'
                      : 'hover:bg-blue-700 hover:bg-opacity-50'
                    }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-blue-900/30 border-t border-blue-700/50">
          <p className="text-xs text-blue-200 text-center">
            Hospital Universitario del Valle
          </p>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <Header
          currentSection={currentSection}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
