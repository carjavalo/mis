import axios from 'axios';

export interface User {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  rol: 'admin' | 'user' | 'editor';
  status?: 'Activo' | 'Inactivo';
  createdAt?: string;
  canAccessDocument?: (documentId: number, permission: string) => boolean;
}

export interface DocumentPermission {
  document_id: number;
  document_name: string;
  document_slug: string;
  can_view: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface CreateUserData {
  nombre: string;
  correo: string;
  password: string;
  telefono: string;
  rol: 'admin' | 'user' | 'editor';
  document_permissions?: DocumentPermission[];
}

export interface UpdateUserData {
  nombre?: string;
  correo?: string;
  password?: string;
  telefono?: string;
  rol?: 'admin' | 'user' | 'editor';
  document_permissions?: DocumentPermission[];
}

export interface UpdateUserPermissionsData {
  permissions: DocumentPermission[];
}

class UsersService {
  async getAllUsers(): Promise<User[]> {
    const response = await axios.get('/api/users');
    return response.data; // Assuming Laravel Resource Collection or direct array
  }

  async getUserById(id: number): Promise<User> {
    const response = await axios.get(`/api/users/${id}`);
    return response.data;
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const response = await axios.post('/api/users', userData);
    const user = response.data;

    // Permissions handling if needed separately, but usually can be done in one go if backend supports it.
    // If backend requires separate call:
    if (userData.document_permissions && userData.document_permissions.length > 0) {
      await this.updateUserDocumentPermissions(user.id, {
        permissions: userData.document_permissions
      });
    }
    return user;
  }

  async updateUser(id: number, userData: UpdateUserData): Promise<User> {
    const response = await axios.put(`/api/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: number): Promise<void> {
    await axios.delete(`/api/users/${id}`);
  }

  async getUserDocumentPermissions(userId: number): Promise<DocumentPermission[]> {
    const response = await axios.get(`/api/users/${userId}/document-permissions`);
    return response.data.data || response.data;
  }

  async updateUserDocumentPermissions(userId: number, permissionsData: UpdateUserPermissionsData): Promise<DocumentPermission[]> {
    const response = await axios.put(`/api/users/${userId}/document-permissions`, permissionsData);
    return response.data.data || response.data;
  }

  async deleteUserDocumentPermission(userId: number, documentId: number): Promise<void> {
    await axios.delete(`/api/users/${userId}/document-permissions/${documentId}`);
  }
}

export const usersService = new UsersService();
