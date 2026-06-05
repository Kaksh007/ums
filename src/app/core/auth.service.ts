import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthResponse, Role, User } from './types';

const tokenKey = 'robro_token';
const userKey = 'robro_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSignal = signal<User | null>(this.readStoredUser());
  readonly currentUser = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this.userSignal()));

  constructor(private readonly router: Router) {}

  get token(): string | null {
    return localStorage.getItem(tokenKey);
  }

  setSession(response: AuthResponse): void {
    localStorage.setItem(tokenKey, response.token);
    localStorage.setItem(userKey, JSON.stringify(response.user));
    this.userSignal.set(response.user);
  }

  logout(): void {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    this.userSignal.set(null);
    void this.router.navigateByUrl('/login');
  }

  hasRole(roles: Role[]): boolean {
    const user = this.userSignal();
    return Boolean(user && roles.includes(user.role));
  }

  canManageUsers(): boolean {
    return this.hasRole(['Admin']);
  }

  canViewUsers(): boolean {
    return this.hasRole(['Admin', 'Supervisor']);
  }

  canViewAllImages(): boolean {
    return this.hasRole(['Admin', 'Supervisor']);
  }

  private readStoredUser(): User | null {
    const raw = localStorage.getItem(userKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User;
    } catch {
      localStorage.removeItem(userKey);
      localStorage.removeItem(tokenKey);
      return null;
    }
  }
}
