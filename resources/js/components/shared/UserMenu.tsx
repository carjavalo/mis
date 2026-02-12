import React, { useRef, useEffect } from 'react';
import { User } from '../../lib/auth';
import { LogOut, User as UserIcon, Settings } from 'lucide-react';

interface UserMenuProps {
  user: User | null;
  onClose: () => void;
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onClose, onLogout }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!user) return null;

  return (
    <div 
      ref={menuRef}
      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="bg-blue-50/50 p-4 border-b border-gray-100">
        <p className="text-sm text-gray-500 mb-1">Conectado como</p>
        <p className="font-semibold text-gray-900 truncate">{user.correo}</p>
      </div>

      <div className="p-2">
        <button 
          className="w-full text-left flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          onClick={() => console.log('Perfil click')} // Replace with navigation
        >
          <UserIcon size={18} className="text-gray-400" />
          <span className="text-sm font-medium">Mi Perfil</span>
        </button>

        <button 
          className="w-full text-left flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          onClick={() => console.log('Config click')} // Replace with navigation
        >
          <Settings size={18} className="text-gray-400" />
          <span className="text-sm font-medium">Configuración</span>
        </button>
      </div>

      <div className="p-2 border-t border-gray-100">
        <button
          onClick={() => {
            onLogout();
            onClose();
          }}
          className="w-full text-left flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default UserMenu;
