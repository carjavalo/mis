import { useEffect, useState, type FormEvent } from 'react';
import { AlertCircle, Check, FileStack, Loader2, X } from 'lucide-react';
import { DocumentTemplate, DocumentType, FormColumn, isPresentationalColumn } from '@/components/forms-module/types/types';
import ColumnBuilder from '@/components/forms-module/ColumnBuilder';
import { formsService } from '@/lib/formService';
import { templateService } from '@/lib/templateService';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  template?: DocumentTemplate | null;
}

interface TemplateFormState {
  nombre: string;
  codigo: string;
  document_type_id: number | null;
  version: string;
  vigencia: string;
  columns: FormColumn[];
}

const emptyState: TemplateFormState = {
  nombre: '',
  codigo: '',
  document_type_id: null,
  version: '',
  vigencia: '',
  columns: [],
};

const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, onSuccess, template }) => {
  const [formData, setFormData] = useState<TemplateFormState>(emptyState);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!template;

  useEffect(() => {
    if (!isOpen) return;
    formsService.getDocumentTypes().then(setDocumentTypes).catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (template) {
      setFormData({
        nombre: template.nombre ?? '',
        codigo: template.codigo ?? '',
        document_type_id: template.document_type_id ?? null,
        version: template.version ?? '',
        vigencia: template.vigencia ? String(template.vigencia).slice(0, 10) : '',
        columns: Array.isArray(template.columns_config) ? template.columns_config : [],
      });
    } else {
      setFormData(emptyState);
    }
    setError('');
  }, [isOpen, template]);

  const validate = (): boolean => {
    if (!formData.nombre.trim()) {
      setError('El nombre de la plantilla es obligatorio');
      return false;
    }
    if (!formData.codigo.trim()) {
      setError('El código es obligatorio');
      return false;
    }
    if (!/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/.test(formData.codigo)) {
      setError('El código solo puede contener letras, números y guiones');
      return false;
    }
    if (formData.columns.length === 0) {
      setError('Agrega al menos un campo a la plantilla');
      return false;
    }
    if (formData.columns.filter(col => !isPresentationalColumn(col.type)).length === 0) {
      setError('La plantilla debe tener al menos un campo de datos, no solo bloques de presentación.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      const payload = {
        nombre: formData.nombre.trim(),
        codigo: formData.codigo.trim(),
        document_type_id: formData.document_type_id,
        version: formData.version?.trim() || null,
        vigencia: formData.vigencia || null,
        columns_config: formData.columns.map((col, idx) => ({
          name: isPresentationalColumn(col.type) ? `h_${Date.now()}_${idx}` : col.name.trim(),
          type: col.type,
          label: col.label.trim(),
          required: isPresentationalColumn(col.type) ? false : (col.required || false),
          options: col.type === 'enum' ? col.options : undefined,
          blocks: col.type === 'header' ? col.blocks : undefined,
        })),
      };

      if (isEditing && template) {
        await templateService.update(template.id, payload);
      } else {
        await templateService.create(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la plantilla');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const fieldClassName = 'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#1e2b66] focus:ring-4 focus:ring-[#1e2b66]/10 disabled:bg-slate-100';
  const labelClassName = 'mb-2 block text-sm font-semibold text-slate-700';

  return (
    <div className="fixed inset-0 z-[140] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={() => !isLoading && onClose()}>
      <div
        className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:max-w-5xl sm:rounded-lg sm:border sm:border-slate-200"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="shrink-0 border-b border-slate-200">
          <div className="h-1 bg-[#1e2b66]" />
          <div className="flex items-start justify-between gap-4 px-4 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#1e2b66]/10 text-[#1e2b66]">
                <FileStack className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1e2b66]">Plantilla</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950 sm:text-2xl">
                  {isEditing ? 'Editar plantilla' : 'Nueva plantilla'}
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-600">
                  Define una estructura reutilizable. El código la identifica al crear un documento.
                </p>
              </div>
            </div>
            <button type="button" onClick={() => !isLoading && onClose()} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" disabled={isLoading}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/70 p-4 sm:p-6">
            <div className="mx-auto grid max-w-4xl gap-5">
              {error && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className={labelClassName}>Nombre de la plantilla <span className="text-red-600">*</span></label>
                    <input type="text" value={formData.nombre} onChange={(e) => setFormData(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Formato de solicitud de permiso" className={fieldClassName} disabled={isLoading} />
                  </div>
                  <div>
                    <label className={labelClassName}>Código <span className="text-red-600">*</span></label>
                    <input type="text" value={formData.codigo} onChange={(e) => setFormData(p => ({ ...p, codigo: e.target.value }))} placeholder="Ej: GH-DBS-001" className={`${fieldClassName} font-mono`} disabled={isLoading} />
                    <p className="mt-1 text-xs text-slate-500">Identificador único (letras, números y guiones)</p>
                  </div>
                  <div>
                    <label className={labelClassName}>Tipo de documento</label>
                    <select value={formData.document_type_id ?? ''} onChange={(e) => setFormData(p => ({ ...p, document_type_id: e.target.value ? Number(e.target.value) : null }))} className={fieldClassName} disabled={isLoading}>
                      <option value="">Seleccione un tipo...</option>
                      {documentTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClassName}>Versión</label>
                    <input type="number" step="0.1" min="0" value={formData.version} onChange={(e) => setFormData(p => ({ ...p, version: e.target.value }))} placeholder="Ej: 1" className={fieldClassName} disabled={isLoading} />
                  </div>
                  <div>
                    <label className={labelClassName}>Vigencia</label>
                    <input type="date" value={formData.vigencia} onChange={(e) => setFormData(p => ({ ...p, vigencia: e.target.value }))} className={fieldClassName} disabled={isLoading} />
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <ColumnBuilder columns={formData.columns} onChange={(columns) => setFormData(p => ({ ...p, columns }))} />
              </section>
            </div>
          </div>

          <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => !isLoading && onClose()} className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" disabled={isLoading}>
                Cancelar
              </button>
              <button type="submit" disabled={isLoading} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1e2b66] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#172252] disabled:bg-slate-300">
                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : <><Check className="h-4 w-4" /> {isEditing ? 'Guardar cambios' : 'Crear plantilla'}</>}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default TemplateModal;
