import React, { useState } from 'react';
import Header from '../shared/Header';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, X, CheckSquare } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/providers/AuthContext';

interface UserDashboardLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    id: 'inicio',
    name: 'Inicio',
    href: '/dashboard-users',
    icon: <Home className="w-6 h-6" />,
  },
  {
    id: 'hemocomponentes',
    name: 'Mis Documentos',
    href: '/dashboard-users/documents',
    icon: <FileText className="w-6 h-6" />,
  },
  {
      id: 'revisiones',
      name: 'Revisiones',
      href: '/dashboard-users/reviews',
      icon: <CheckSquare className="w-6 h-6" />,
  },
];

export const UserDashboardLayout: React.FC<UserDashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  const isActive = (href: string) => {
    if (href === '/dashboard-users') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const currentSection = menuItems.find(item => isActive(item.href))?.name || 'Inicio';

  return (
    <div className="min-h-screen bg-gray-50 lg:pl-80">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
            "fixed inset-y-0 left-0 z-50 w-80 transform bg-blue-800 shadow-xl transition-transform duration-300 ease-in-out pt-20 lg:pt-0",
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 lg:hidden bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="flex flex-col items-center px-6 py-8 bg-blue-900/30">
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

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={clsx(
                    "flex items-center px-4 py-3 rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30",
                    isActive(item.href)
                      ? 'bg-blue-600 bg-opacity-50 border-l-4 border-blue-300 shadow-lg'
                      : 'hover:bg-blue-700 hover:bg-opacity-50'
                  )}
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

      {/* Main Content */}
      <div className="flex min-h-screen flex-col">
        <Header
          currentSection={currentSection}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            {children}
        </main>
      </div>
    </div>
  );
};
