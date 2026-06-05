import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { User } from '../../core/types';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule],
  template: `
    <main class="page">
      <section class="page-header">
        <div>
          <p class="eyebrow">Users</p>
          <h1>{{ auth.canManageUsers() ? 'Manage accounts' : 'Team accounts' }}</h1>
          <p class="muted">Admin can create and remove users. Supervisors have read-only visibility.</p>
        </div>
      </section>

      @if (message()) {
        <div class="alert success">{{ message() }}</div>
      }
      @if (error()) {
        <div class="alert error">{{ error() }}</div>
      }

      <section class="grid two">
        @if (auth.canManageUsers()) {
          <div class="panel">
            <h2>Create account</h2>
            <form class="form" [formGroup]="form" (ngSubmit)="createUser()">
              <label class="field">
                <span>Name</span>
                <input formControlName="name" autocomplete="name">
              </label>
              <label class="field">
                <span>Email</span>
                <input type="email" formControlName="email" autocomplete="email">
              </label>
              <label class="field">
                <span>Password</span>
                <input type="password" formControlName="password" autocomplete="new-password">
              </label>
              <label class="field">
                <span>Role</span>
                <select formControlName="role">
                  <option value="Supervisor">Supervisor</option>
                  <option value="Worker">Worker</option>
                </select>
              </label>
              <button class="button" type="submit" [disabled]="form.invalid || loading()">Create user</button>
            </form>
          </div>
        }

        <div class="panel">
          <h2>Account list</h2>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  @if (auth.canManageUsers()) {
                    <th>Action</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (user of users(); track user.id) {
                  <tr>
                    <td>{{ user.name }}</td>
                    <td>{{ user.email }}</td>
                    <td><span class="badge">{{ user.role }}</span></td>
                    <td>{{ user.createdAt | date:'mediumDate' }}</td>
                    @if (auth.canManageUsers()) {
                      <td>
                        <button
                          class="button danger"
                          type="button"
                          [disabled]="user.role === 'Admin'"
                          (click)="removeUser(user)"
                        >
                          Remove
                        </button>
                      </td>
                    }
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5">No users found.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  `
})
export class UsersComponent implements OnInit {
  protected readonly api = inject(ApiService);
  protected readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  protected readonly users = signal<User[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly message = signal('');

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: this.fb.nonNullable.control<'Supervisor' | 'Worker'>('Worker', [Validators.required])
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.api.getUsers().subscribe({
      next: ({ users }) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Unable to load users.');
        this.loading.set(false);
      }
    });
  }

  createUser(): void {
    if (this.form.invalid || this.loading()) {
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.message.set('');

    this.api.createUser(this.form.getRawValue()).subscribe({
      next: ({ user }) => {
        this.users.update((users) => [user, ...users]);
        this.form.reset({ name: '', email: '', password: '', role: 'Worker' });
        this.message.set('User account created.');
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Unable to create user.');
        this.loading.set(false);
      }
    });
  }

  removeUser(user: User): void {
    if (user.role === 'Admin' || this.loading()) {
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.message.set('');

    this.api.deleteUser(user.id).subscribe({
      next: () => {
        this.users.update((users) => users.filter((item) => item.id !== user.id));
        this.message.set('User account removed.');
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Unable to remove user.');
        this.loading.set(false);
      }
    });
  }
}
