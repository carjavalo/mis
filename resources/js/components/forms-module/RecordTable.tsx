// components/forms-module/RecordsTable.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DynamicForm } from './types/types';
import { formsService } from '@/lib/formService';
import Pagination from '@/components/ui/Pagination';
import { useToast } from '@/providers/ToastContext';
import { getNotificationCopy, NotificationKey } from '@/constants/notifications';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface RecordsTableProps {
  form: DynamicForm;
  documentId: number;
  onRecordsChange?: () => void;
}

const RecordTable: React.FC<RecordsTableProps> = ({ form, documentId, onRecordsChange }) => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const { success, error: toastError } = useToast();
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const emitRecordToast = (variant: 'success' | 'error', key: NotificationKey<'records'>) => {
    const copy = getNotificationCopy('records', key);
    const handler = variant === 'success' ? success : toastError;
    handler(copy.title, { description: copy.description });
    if (variant === 'error') {
      setError(copy.description ?? copy.title);
    } else {
      setError('');
    }
    return copy;
  };

  useEffect(() => {
    loadRecords();
  }, [documentId]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await formsService.getFormRecords(documentId);
      const recordsData = formsService.normalizeRecordsResponse(response);
      setRecords(recordsData);
      onRecordsChange?.();
    } catch {
      setRecords([]);
      emitRecordToast('error', 'loadError');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate(`/dashboard-admin/documents/${documentId}/new`);
  };

  const handleEdit = (recordId: number) => {
    navigate(`/dashboard-admin/documents/${documentId}/${recordId}`);
  };

  const handleDelete = async (recordId: number) => {
    try {
      setDeletingId(recordId);
      setError('');
      await formsService.deleteFormRecord(documentId, recordId);
      setRecords(prev => prev.filter(r => r.id !== recordId));
      onRecordsChange?.();
      emitRecordToast('success', 'deleteSuccess');
    } catch {
      emitRecordToast('error', 'deleteError');
    } finally {
      setDeletingId(null);
    }
  };

  const formatValue = (value: any, columnType: string): string => {
    if (value === null || value === undefined || value === '') return '-';
    
    switch (columnType) {
      case 'date':
        return new Date(value).toLocaleDateString('es-CO', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      case 'boolean':
        return value ? 'Sí' : 'No';
      case 'decimal':
      case 'number':
        return typeof value === 'number' ? value.toLocaleString('es-CO') : value;
      default:
        return String(value);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-black">Cargando registros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{form.name}</h2>
            <p className="text-blue-200 text-sm mt-1">
              {records.length} registro{records.length !== 1 ? 's' : ''} encontrado{records.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="mt-3 sm:mt-0 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">Crear Registro</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-6 py-4 m-4 rounded flex items-start space-x-3">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b">
        <div className="bg-white p-4 rounded-lg border-2 border-blue-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-black font-medium">Total Registros</p>
              <p className="text-3xl font-bold text-black">{records.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border-2 border-purple-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-black font-medium">Columnas</p>
              <p className="text-3xl font-bold text-black">{form.columns_config.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border-2 border-green-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-black font-medium">Última Actualización</p>
              <p className="text-lg font-bold text-black">
                {records.length > 0 ? 'Hoy' : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {records.length === 0 && (
        <div className="text-center py-16 px-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-4">
            <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-black mb-2">No hay registros</h3>
          <p className="text-black mb-6 max-w-md mx-auto">
            Comienza agregando el primer registro a este formulario de {form.name}
          </p>
          <button
            onClick={handleCreate}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">Crear Primer Registro</span>
          </button>
        </div>
      )}

      {records.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-200 border-b-2 border-gray-300">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">
                  ID
                </th>
                {form.columns_config.map(column => (
                  <th key={column.name} className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">
                    {column.label}
                    {column.required && <span className="text-red-500 ml-1">*</span>}
                  </th>
                ))}
                <th className="px-6 py-4 text-right text-xs font-bold text-black uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.slice((page - 1) * pageSize, page * pageSize).map((record) => (
                <tr key={record.id} className="hover:bg-blue-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                      #{record.id}
                    </span>
                  </td>
                  {form.columns_config.map(column => (
                    <td key={column.name} className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      <span className={column.type === 'boolean' ? (record[column.name] ? 'text-green-600 font-semibold' : 'text-red-600') : ''}>
                        {formatValue(record[column.name], column.type)}
                      </span>
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(record.id)}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-all duration-150 transform hover:scale-110"
                        title="Editar registro"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(record.id)}
                        disabled={deletingId === record.id}
                        className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-all duration-150 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Eliminar registro"
                      >
                        {deletingId === record.id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {records.length > pageSize && (
            <Pagination
              page={page}
              pageSize={pageSize}
              total={records.length}
              onPageChange={(p) => setPage(p)}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            />
          )}
        </div>
      )}
      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        title="Eliminar registro"
        description="¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId !== null) {
            handleDelete(confirmDeleteId);
          }
        }}
        isLoading={deletingId !== null}
      />
    </div>
  );
};

export default RecordTable;
