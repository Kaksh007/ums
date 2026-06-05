import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="page">
      <section class="page-header">
        <div>
          <p class="eyebrow">Dashboard</p>
          <h1>{{ greeting }}</h1>
          <p class="muted">Your available actions are based on your assigned role.</p>
        </div>
      </section>

      <section class="grid three">
        @if (auth.canManageUsers()) {
          <article class="panel">
            <h2>User management</h2>
            <p class="muted">Create Supervisor and Worker accounts, assign roles, and remove inactive users.</p>
            <a class="button" routerLink="/users">Manage users</a>
          </article>
        }

        @if (auth.canViewUsers() && !auth.canManageUsers()) {
          <article class="panel">
            <h2>Team overview</h2>
            <p class="muted">Review user accounts and captured image records across the team.</p>
            <a class="button" routerLink="/users">View users</a>
          </article>
        }

        <article class="panel">
          <h2>Image capture</h2>
          <p class="muted">Use the inbuilt camera to capture and securely upload work images.</p>
          <a class="button" routerLink="/capture">Open camera</a>
        </article>

        <article class="panel">
          <h2>Gallery</h2>
          <p class="muted">
            {{ auth.canViewAllImages() ? 'Review captured images across users.' : 'Review your own captured images.' }}
          </p>
          <a class="button" routerLink="/gallery">View gallery</a>
        </article>
      </section>
    </main>
  `
})
export class DashboardComponent {
  protected readonly auth = inject(AuthService);

  get greeting(): string {
    const user = this.auth.currentUser();
    return user ? `Welcome, ${user.name}` : 'Welcome';
  }
}
