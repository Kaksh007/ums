import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthResponse, CapturedImage, Role, User } from './types';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<AuthResponse>('/api/auth/login', { email, password });
  }

  getUsers() {
    return this.http.get<{ users: User[] }>('/api/users');
  }

  createUser(payload: { name: string; email: string; password: string; role: Exclude<Role, 'Admin'> }) {
    return this.http.post<{ user: User }>('/api/users', payload);
  }

  deleteUser(id: string) {
    return this.http.delete<{ message: string }>(`/api/users/${id}`);
  }

  uploadImage(imageData: string) {
    return this.http.post<{ image: CapturedImage }>('/api/images', { imageData });
  }

  getAllImages() {
    return this.http.get<{ images: CapturedImage[] }>('/api/images');
  }

  getMyImages() {
    return this.http.get<{ images: CapturedImage[] }>('/api/images/mine');
  }
}
