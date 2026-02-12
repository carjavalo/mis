import React, { useState } from 'react';
import { DeleteUserModalProps } from '../types/types';

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  isOpen,
  user,
  onConfirm,
  onClose,
  isLoading = false
}) => {
  if (!isOpen || !user) return null;

  const [confirmInput, setConfirmInput] = useState('');

  const handleConfirm = async () => {
    try {
      if (confirmInput !== 'ELIMINAR') return;
      await onConfirm(user.id);
      setConfirmInput(''); // Reset after confirm
    } catch (error) {
      // El error se maneja en el componente padre
    }
  };

  const getInitials = (name?: string | null): string => {
    if (!name) return '?';

    const trimmed = name.trim();
    if (!trimmed) return '?';

    const initials = trimmed
      .split(/\s+/)
      .map((n) => n[0])
      .join('')
      .toUpperCase();

    return initials.slice(0, 2) || '?';
  };

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[140] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="bg-red-600 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">
            Eliminar Usuario
          </h3>
          <p className="text-red-100 text-sm mt-1">
            Confirmar eliminación permanente
          </p>
        </div>

        <div className="p-6">
          {/* Información del usuario */}
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-xl">
              {getInitials(user.nombre)}
            </div>
            <div className="ml-4">
              <p className="text-lg font-semibold text-gray-900">{user.nombre}</p>
              <p className="text-sm text-gray-500">{user.correo}</p>
              <p className="text-xs text-gray-400">ID: {user.id}</p>
            </div>
          </div>

          {/* Advertencia */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div>
                <p className="text-sm font-medium text-red-800">¡Atención! Esta acción es irreversible</p>
                <p className="text-sm text-red-700 mt-1">
                  El usuario perderá acceso inmediatamente y todos sus datos serán eliminados del sistema.
                </p>
              </div>
            </div>
          </div>

          {/* Información de impacto */}
          <div className="bg-gray-50 rounded-lg p-3 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Usuario a eliminar:</strong> {user.nombre}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Rol:</strong> {user.rol}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Email:</strong> {user.correo}
            </p>
          </div>

          {/* Confirmación */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Para confirmar, escriba "ELIMINAR" en el siguiente campo:</strong>
            </p>
            <input
              type="text"
              placeholder="ELIMINAR"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              className="w-full mt-2 px-3 py-2 border border-yellow-300 rounded text-black bg-white"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || confirmInput !== 'ELIMINAR'}
              className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center disabled:bg-red-300"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                'Eliminar Permanentemente'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
