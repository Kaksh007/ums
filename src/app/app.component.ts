import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    @if (auth.currentUser(); as user) {
      <div class="shell">
        <header class="topbar">
          <div class="brand">
            <span class="brand-mark">RC</span>
            <div>
              <span class="brand-title">Robro Capture</span>
              <span class="brand-subtitle">{{ user.name }} · {{ user.role }}</span>
            </div>
          </div>

          <nav class="nav" aria-label="Main navigation">
            <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
            @if (auth.canManageUsers() || auth.canViewUsers()) {
              <a routerLink="/users" routerLinkActive="active">Users</a>
            }
            <a routerLink="/capture" routerLinkActive="active">Capture</a>
            <a routerLink="/gallery" routerLinkActive="active">Gallery</a>
            <button class="link-button" type="button" (click)="auth.logout()">Sign out</button>
          </nav>
        </header>
        <router-outlet />
      </div>
    } @else {
      <router-outlet />
    }
  `
})
export class AppComponent {
  protected readonly auth = inject(AuthService);
}
