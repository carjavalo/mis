import React, { useState } from 'react';
import { useAuth } from '../../providers/AuthContext';
import UserMenu from './UserMenu';
import { Menu, ChevronDown, X } from 'lucide-react';

interface HeaderProps {
  currentSection: string;
  onMenuToggle: () => void;
  sidebarOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ currentSection, onMenuToggle, sidebarOpen = false }) => {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleTitle = (rol: string): string => {
    const roleTitles: { [key: string]: string } = {
      'admin': 'Administrador del Sistema',
      'user': 'Usuario del Sistema',
      'editor': 'Editor del Sistema'
    };
    return roleTitles[rol] || 'Usuario';
  };

  return (
    <header className="sticky top-0 z-[60] bg-blue-800 text-white shadow-lg">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2.5 rounded-lg hover:bg-blue-700 active:bg-blue-600 transition-colors touch-manipulation"
          aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
          type="button"
        >
          {sidebarOpen ? (
            <X className="w-7 h-7" strokeWidth={2.5} />
          ) : (
            <Menu className="w-7 h-7" strokeWidth={2.5} />
          )}
        </button>

        <div className="flex-1 lg:flex-none min-w-0 mx-4">
          <h2 className="text-xl font-semibold truncate">{currentSection}</h2>
          <p className="text-blue-200 text-sm">MIS - BANCO DE SANGRE</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 relative">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium truncate max-w-[150px]">
                {user?.nombre || 'Usuario'}
              </p>
              <p className="text-xs text-blue-200">
                {getRoleTitle(user?.rol || 'user')}
              </p>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-blue-700 transition-colors"
                aria-label="Menú de usuario"
              >
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user ? getInitials(user.nombre) : 'U'}
                </div>
                <ChevronDown 
                  className={`w-4 h-4 text-blue-200 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isUserMenuOpen && (
                <UserMenu 
                  user={user}
                  onClose={() => setIsUserMenuOpen(false)}
                  onLogout={logout}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
