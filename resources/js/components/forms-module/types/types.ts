// components/forms/types/types.ts

/**
 * Bloque interno de un encabezado (texto o imagen).
 * Para 'image', content es un data URL (base64) de la imagen subida.
 */
export interface HeaderBlock {
  type: 'text' | 'image';
  content: string;
}

/**
 * Definición de una columna en el formulario dinámico
 */
export interface FormColumn {
  name: string;
  type: 'string' | 'number' | 'decimal' | 'date' | 'datetime' | 'boolean' | 'enum' | 'text' | 'signature' | 'header' | 'info';
  blocks?: HeaderBlock[];  // Para tipo 'header': bloques de texto e imágenes
  label: string;
  required: boolean;
  options?: string[];      // Para tipo enum
  max_length?: number;     // Para strings
  min_value?: number;      // Para números
  max_value?: number;      // Para números
  default_value?: any;     // Valor por defecto
  placeholder?: string;    // Placeholder para inputs
  help_text?: string;      // Texto de ayuda
}

/**
 * Formulario dinámico completo
 */
export interface DocumentType {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

/**
 * Formulario dinámico completo
 */
export interface DynamicForm {
  id: number;
  name: string;
  slug: string;
  table_name: string;
  columns_config: FormColumn[];
  created_by: number;
  created_at: string;
  updated_at: string;
  document_type_id?: number | null;
  version?: string | null;
  vigencia?: string | null;
  is_notification_enabled: boolean;
  notification_time?: string | null;
  type?: DocumentType;
}

/**
 * Datos para crear un nuevo formulario
 */
export interface CreateFormData {
  name: string;
  slug: string;
  columns: FormColumn[];
  document_type_id?: number | null;
  version?: string | null;
  vigencia?: string | null;
  is_notification_enabled?: boolean;
  notification_time?: string | null;
}

/**
 * Datos para actualizar un formulario
 */
export interface UpdateFormData {
  name?: string;
  slug?: string;
  columns?: FormColumn[];
}

/**
 * Plantilla de documento: estructura reutilizable ligada a un código.
 */
export interface DocumentTemplate {
  id: number;
  nombre: string;
  codigo: string;
  document_type_id?: number | null;
  version?: string | null;
  vigencia?: string | null;
  columns_config: FormColumn[];
  created_at?: string;
  updated_at?: string;
  type?: DocumentType;
}

/**
 * Datos para crear/actualizar una plantilla
 */
export interface CreateTemplateData {
  nombre: string;
  codigo: string;
  document_type_id?: number | null;
  version?: string | null;
  vigencia?: string | null;
  columns_config: FormColumn[];
}

/**
 * Estadísticas de formularios
 */
export interface FormStats {
  total: number;
  recent: number;
  active: number;
  totalColumns: number;
}

/**
 * Props para el constructor de columnas
 */
export interface ColumnBuilderProps {
  columns: FormColumn[];
  onChange: (columns: FormColumn[]) => void;
}

/**
 * Registro de datos de un formulario
 */
export interface FormRecord {
  id: number;
  [key: string]: any;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  status: 'draft' | 'in_review' | 'approved' | 'returned';
  reviewer_id?: number | null;
  reviewed_at?: string | null;
  review_comments?: string | null;
}

/**
 * Tipos de columnas disponibles con sus metadatos
 */
export const COLUMN_TYPES = [
  { 
    value: 'string' as const, 
    label: 'Texto Corto',
    description: 'Texto de hasta 255 caracteres'
  },
  { 
    value: 'text' as const, 
    label: 'Texto Largo',
    description: 'Texto sin límite de caracteres'
  },
  { 
    value: 'number' as const, 
    label: 'Número Entero',
    description: 'Números sin decimales'
  },
  { 
    value: 'decimal' as const, 
    label: 'Decimal',
    description: 'Números con decimales'
  },
  { 
    value: 'date' as const, 
    label: 'Fecha',
    description: 'Solo fecha (YYYY-MM-DD)'
  },
  { 
    value: 'datetime' as const, 
    label: 'Fecha y Hora',
    description: 'Fecha con hora completa'
  },
  { 
    value: 'boolean' as const, 
    label: 'Sí/No',
    description: 'Valor verdadero o falso'
  },
  {
    value: 'enum' as const,
    label: 'Lista de Opciones',
    description: 'Selección de opciones predefinidas'
  },
  {
    value: 'signature' as const,
    label: 'Firma',
    description: 'Firma digital automática generada con el nombre del usuario'
  },
  {
    value: 'header' as const,
    label: 'Encabezado',
    description: 'Sección con título, texto e imágenes (ej. logo). Solo presentación.'
  },
  {
    value: 'info' as const,
    label: 'Etiqueta / Información',
    description: 'Bloque informativo o de convenciones. No se llena, es solo informativo.'
  }
] as const;

/**
 * Tipo para los valores de COLUMN_TYPES
 */
export type ColumnType = typeof COLUMN_TYPES[number]['value'];

/**
 * Tipos de campo que son solo de presentación: no capturan datos, no crean
 * columna física en la base de datos y no aparecen en las tablas de registros.
 */
export const PRESENTATIONAL_COLUMN_TYPES = ['header', 'info'] as const;

export const isPresentationalColumn = (type?: string): boolean =>
  !!type && (PRESENTATIONAL_COLUMN_TYPES as readonly string[]).includes(type);

/**
 * Validación de formulario
 */
export interface FormValidation {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
}

/**
 * Estado de carga
 */
export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
}

/**
 * Estado de error
 */
export interface ErrorState {
  hasError: boolean;
  errorMessage?: string;
  errorDetails?: any;
}

/**
 * Respuesta de la API al crear formulario
 */
export interface CreateFormResponse {
  message: string;
  form: DynamicForm;
  table_name: string;
}

/**
 * Respuesta de la API al crear registro
 */
export interface CreateRecordResponse {
  message: string;
  table_name: string;
  record?: FormRecord;
}

/**
 * Filtros para listado de formularios
 */
export interface FormFilters {
  search?: string;
  created_by?: number;
  date_from?: string;
  date_to?: string;
}

/**
 * Opciones de paginación
 */
export interface PaginationOptions {
  page: number;
  per_page: number;
  total?: number;
  total_pages?: number;
}

/**
 * Respuesta paginada
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationOptions;
}
