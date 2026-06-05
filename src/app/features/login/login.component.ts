import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <main class="login-layout">
      <section class="panel login-card">
        <p class="eyebrow">Secure access</p>
        <h1>Robro Capture</h1>
        <p class="muted">Sign in with the credentials assigned by the administrator.</p>

        <form class="form" [formGroup]="form" (ngSubmit)="submit()">
          <label class="field">
            <span>Email</span>
            <input type="email" formControlName="email" autocomplete="email">
          </label>
          <label class="field">
            <span>Password</span>
            <input type="password" formControlName="password" autocomplete="current-password">
          </label>

          @if (error()) {
            <div class="alert error">{{ error() }}</div>
          }

          <button class="button" type="submit" [disabled]="form.invalid || loading()">
            {{ loading() ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>
      </section>
    </main>
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly form = this.fb.nonNullable.group({
    email: ['admin@example.com', [Validators.required, Validators.email]],
    password: ['Admin@123', [Validators.required]]
  });

  submit(): void {
    if (this.form.invalid || this.loading()) {
      return;
    }

    this.loading.set(true);
    this.error.set('');
    const { email, password } = this.form.getRawValue();

    this.api.login(email, password).subscribe({
      next: (response) => {
        this.auth.setSession(response);
        void this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Unable to sign in.');
        this.loading.set(false);
      }
    });
  }
}
