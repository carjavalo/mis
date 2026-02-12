import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DynamicForm, FormColumn, COLUMN_TYPES } from './types/types';
import { formsService } from '@/lib/formService';
import { getColumnIcon } from '@/components/ui/ColumnIcons';
import { 
    AlertCircle, Save, X, Loader2, CheckCircle, 
    XCircle, Clock, AlertTriangle 
} from 'lucide-react';
import { useToast } from '@/providers/ToastContext';
import { getNotificationCopy, NotificationKey } from '@/constants/notifications';
import { useAuth } from '@/providers/AuthContext';
import axios from 'axios';

interface DynamicRecordFormProps {
  form: DynamicForm;
  documentId: number;
  recordId: number | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const DynamicRecordForm: React.FC<DynamicRecordFormProps> = ({ 
  form, 
  documentId, 
  recordId,
  onSuccess,
  onCancel 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = recordId !== null;

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  
  // Approval states
  const [canReview, setCanReview] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  const { success: toastSuccess, error: toastError } = useToast();

  const emitRecordToast = (variant: 'success' | 'error', key: NotificationKey<'records'>) => {
    const copy = getNotificationCopy('records', key);
    const handler = variant === 'success' ? toastSuccess : toastError;
    handler(copy.title, { description: copy.description });
    return copy;
  };

  useEffect(() => {
    if (user && documentId) {
        checkReviewPermission();
    }
  }, [user, documentId]);

  const checkReviewPermission = async () => {
    try {
        if(user?.rol === 'super-admin') {
            setCanReview(true);
            return;
        }
        const res = await axios.get(`/api/users/${user.id}/document-permissions`);
        const perms: any[] = res.data.data || [];
        const myPerm = perms.find((p: any) => Number(p.document_id) === Number(documentId));
        if (myPerm && myPerm.can_review) {
            setCanReview(true);
        }
    } catch (e) {
        console.error("Error checking permissions", e);
    }
  };

  useEffect(() => {
    if (isEditing && recordId) {
      loadRecord();
    } else {
      const defaultValues: Record<string, any> = {};
      form.columns_config.forEach(column => {
        if (column.type === 'boolean') {
          defaultValues[column.name] = false;
        } else if (column.type === 'number' || column.type === 'decimal') {
          defaultValues[column.name] = '';
        } else {
          defaultValues[column.name] = '';
        }
      });
      // Default new record status
      // Backend handles default 'draft', but we can set it here optionally
      setFormData(defaultValues);
    }
  }, [recordId]);

  const loadRecord = async () => {
    if (!recordId) return;

    try {
      setLoading(true);
      const response = await formsService.getFormRecords(documentId);
      const recordsData = formsService.normalizeRecordsResponse(response);
      const record = recordsData.find((r: any) => r.id === recordId);
      
      if (record) {
        const normalizedRecord = { ...record };
        form.columns_config.forEach(column => {
          if (column.type === 'boolean' && column.name in normalizedRecord) {
            const value = normalizedRecord[column.name];
            normalizedRecord[column.name] = value === true || value === 'true' || value === 1;
          }
        });
        setFormData(normalizedRecord);
      } else {
        setGeneralError('Registro no encontrado');
      }
    } catch (err: any) {
      setGeneralError(err.message || 'Error al cargar registro');
      emitRecordToast('error', 'loadError');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (columnName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [columnName]: value
    }));
    if (errors[columnName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[columnName];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    form.columns_config.forEach(column => {
      if (column.required) {
        const value = formData[column.name];
        if (value === undefined || value === null || value === '') {
          newErrors[column.name] = `${column.label} es obligatorio`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    setGeneralError('');

    if (!validateForm()) {
      setGeneralError('Por favor, completa todos los campos obligatorios');
      return;
    }

    try {
      setSaving(true);

      const dataToSave = { ...formData };
      delete dataToSave.id;
      delete dataToSave.created_at;
      delete dataToSave.updated_at;
      // Don't send status fields on save, backend handles logic or retains existing
      // Unless we want to allow users to move back to draft? leaving as is.

      if (isEditing && recordId) {
        await formsService.updateFormRecord(documentId, recordId, dataToSave);
        emitRecordToast('success', 'updateSuccess');
      } else {
        await formsService.createFormRecord(documentId, dataToSave);
        emitRecordToast('success', 'createSuccess');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/dashboard-admin/documents/${documentId}`);
      }
    } catch (err: any) {
      setGeneralError(err.message || 'Error al guardar registro');
      emitRecordToast('error', isEditing ? 'updateError' : 'createError');
    } finally {
      setSaving(false);
    }
  };
  
  const handleReview = async (status: 'approved' | 'returned') => {
      let comments = '';
      if (status === 'returned') {
          comments = prompt('Por favor, indica el motivo de devolución:') || '';
          if (!comments) return; // Cancelar si no hay comentario en devolución
      } else {
          if (!confirm('¿Aprobar este registro?')) return;
      }

      try {
          setReviewing(true);
          await formsService.reviewRecord(documentId, recordId!, status, comments);
          // Actualizar estado local
          setFormData(prev => ({
              ...prev,
              status: status,
              review_comments: comments
          }));
          toastSuccess('Revisión completada', { description: `Registro marcado como ${status === 'approved' ? 'Aprobado' : 'Devuelto'}` });
          if (onSuccess) onSuccess(); // Si hay callback
          else {
              // Si no, nos quedamos o navegamos. Quedarse permite ver el cambio.
              // navigate(`/dashboard-admin/documents/${documentId}`);
          }
      } catch (err: any) {
          toastError('Error', { description: 'No se pudo guardar la revisión.' });
      } finally {
          setReviewing(false);
      }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(`/dashboard-admin/documents/${documentId}`);
    }
  };
  
  const getStatusBadge = (status: string) => {
      switch (status) {
          case 'approved': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1"/> Aprobado</span>;
          case 'returned': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1"/> Devuelto</span>;
          case 'in_review': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800"><Clock className="w-3 h-3 mr-1"/> En Revisión</span>;
          default: return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">Borrador</span>;
      }
  };

  const renderInput = (column: FormColumn) => {
    const value = formData[column.name] ?? '';
    const hasError = !!errors[column.name];

    const inputClasses = `w-full px-3 text-black py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
      hasError ? 'border-red-500 bg-red-50' : ''
    }`;

    switch (column.type) {
      case 'text':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(column.name, e.target.value)}
            className={inputClasses}
            placeholder={column.placeholder || `Ingrese ${column.label.toLowerCase()}`}
            rows={4}
          />
        );

      case 'enum':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(column.name, e.target.value)}
            className={inputClasses}
          >
            <option value="">Seleccionar...</option>
            {column.options?.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        const boolValue = value === true || value === 'true' || value === 1;
        return (
          <div className="flex items-center space-x-6">
            <label className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name={column.name}
                checked={boolValue === true}
                onChange={() => handleInputChange(column.name, true)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
              />
              <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                Sí
              </span>
            </label>
            <label className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name={column.name}
                checked={boolValue === false}
                onChange={() => handleInputChange(column.name, false)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
              />
              <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                No
              </span>
            </label>
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(column.name, e.target.value)}
            className={inputClasses}
          />
        );

      case 'datetime':
        return (
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => handleInputChange(column.name, e.target.value)}
            className={inputClasses}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(column.name, e.target.value)}
            className={inputClasses}
            placeholder={column.placeholder || `Ingrese ${column.label.toLowerCase()}`}
          />
        );

      case 'decimal':
        return (
          <input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => handleInputChange(column.name, e.target.value)}
            className={inputClasses}
            placeholder={column.placeholder || `Ingrese ${column.label.toLowerCase()}`}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(column.name, e.target.value)}
            className={inputClasses}
            placeholder={column.placeholder || `Ingrese ${column.label.toLowerCase()}`}
            maxLength={column.max_length}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-xl max-w-4xl mx-auto p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Cargando registro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                 <h2 className="text-2xl font-bold text-white">
                    {isEditing ? 'Editar Registro' : 'Nuevo Registro'}
                 </h2>
                 {isEditing && formData.status && getStatusBadge(formData.status)}
              </div>
              <p className="text-blue-100 text-sm mt-1">
                {form.name} {isEditing && `• ID: #${recordId}`}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Approval Buttons */}
              {isEditing && canReview && (formData.status === 'draft' || formData.status === 'in_review' || formData.status === 'returned') && (
                  <>
                    <button
                        onClick={() => handleReview('returned')}
                        disabled={reviewing || saving}
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-colors shadow-sm focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                    >
                        Devolver
                    </button>
                    <button
                        onClick={() => handleReview('approved')}
                        disabled={reviewing || saving}
                        className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm transition-colors shadow-sm focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
                    >
                        Aprobar
                    </button>
                  </>
              )}

              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2 border border-white/20"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Cancelar</span>
              </button>
              
              {(!isEditing || formData.status !== 'approved' || user?.rol === 'super-admin') && (
                  <button
                    onClick={handleSave}
                    disabled={saving || reviewing}
                    className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center space-x-2 shadow-lg"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Guardar</span>
                      </>
                    )}
                  </button>
              )}
            </div>
          </div>
        </div>

        {/* Warning for Returned Status */}
        {isEditing && formData.status === 'returned' && formData.review_comments && (
             <div className="bg-red-50 p-4 border-b border-red-200">
                 <h4 className="text-red-800 font-bold text-sm flex items-center gap-2">
                     <AlertTriangle className="w-4 h-4" /> Motivo de Devolución:
                 </h4>
                 <p className="text-red-700 text-sm mt-1">{formData.review_comments}</p>
             </div>
        )}

        {/* General Error */}
        {generalError && (
          <div className="mx-6 mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Error al guardar</p>
                <p className="text-sm text-red-700 mt-1">{generalError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div className="p-6 space-y-4">
          {form.columns_config.map((column, index) => (
            <div
              key={column.name}
              className={`bg-white border-2 rounded-lg p-4 transition-all ${
                errors[column.name] 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-700">
                  {getColumnIcon(column.type, "w-5 h-5")}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-semibold text-gray-900">
                      {column.label}
                      {column.required && (
                        <span className="ml-2 text-red-600 text-xs">*</span>
                      )}
                    </label>
                    {column.help_text && (
                      <span className="text-xs text-gray-500 italic">
                        {column.help_text}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-2">
                    {COLUMN_TYPES.find(t => t.value === column.type)?.label || column.type}
                  </p>

                  {renderInput(column)}

                  {errors[column.name] && (
                    <div className="mt-2 flex items-center space-x-2 text-red-600">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <p className="text-sm font-medium">{errors[column.name]}</p>
                    </div>
                  )}

                  {column.type === 'enum' && column.options && !errors[column.name] && (
                    <p className="mt-2 text-xs text-gray-500">
                      {column.options.length} opción{column.options.length !== 1 ? 'es' : ''} disponible{column.options.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 rounded-b-xl">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">
              <span className="font-medium">{form.columns_config.length}</span> campos •{' '}
              <span className="font-medium text-red-600">
                {form.columns_config.filter(c => c.required).length}
              </span> obligatorios
            </div>
            <div className="text-gray-500 text-xs">
              Los campos marcados con <span className="text-red-600 font-bold">*</span> son obligatorios
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicRecordForm;
