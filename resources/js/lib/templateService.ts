import axios from 'axios';
import { DocumentTemplate, CreateTemplateData } from '../components/forms-module/types/types';

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

const getApiErrorMessage = (data: ApiErrorResponse | undefined, fallback: string): string => {
  const firstFieldError = data?.errors ? Object.values(data.errors).flat()[0] : null;
  return firstFieldError || data?.message || fallback;
};

class TemplateService {
  async getAll(): Promise<DocumentTemplate[]> {
    const response = await axios.get('/api/templates');
    return response.data.data || response.data;
  }

  async getById(id: number): Promise<DocumentTemplate> {
    const response = await axios.get(`/api/templates/${id}`);
    return response.data;
  }

  async create(data: CreateTemplateData): Promise<DocumentTemplate> {
    const response = await axios.post('/api/templates', data, {
      validateStatus: (status) => status < 500,
    });
    if (response.status >= 400) {
      throw new Error(getApiErrorMessage(response.data, 'Error al crear la plantilla'));
    }
    return response.data.template || response.data;
  }

  async update(id: number, data: Partial<CreateTemplateData>): Promise<DocumentTemplate> {
    const response = await axios.put(`/api/templates/${id}`, data, {
      validateStatus: (status) => status < 500,
    });
    if (response.status >= 400) {
      throw new Error(getApiErrorMessage(response.data, 'Error al actualizar la plantilla'));
    }
    return response.data.template || response.data;
  }

  async remove(id: number): Promise<void> {
    await axios.delete(`/api/templates/${id}`);
  }
}

export const templateService = new TemplateService();
