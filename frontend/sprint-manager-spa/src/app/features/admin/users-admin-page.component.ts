import { Component, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { User } from '../../shared/models/app.models';

@Component({
  selector: 'app-users-admin-page',
  standalone: true,
  template: `
    <section class="panel">
      <p class="eyebrow">Admin</p>
      <h2>Users</h2>
      <div class="list">
        @for (user of users(); track user.id) {
          <article>
            <div>
              <strong>{{ user.displayName }}</strong>
              <p>{{ user.email }}</p>
            </div>
            <span>{{ user.roles.join(', ') }}</span>
          </article>
        }
      </div>
    </section>
  `,
  styles: [`
    .panel { padding: 1.5rem; border-radius: 1.4rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }
    .eyebrow, p { color: #9fb6ca; }
    .list { display: grid; gap: 0.75rem; }
    article { display: flex; justify-content: space-between; gap: 1rem; padding: 1rem; border-radius: 1rem; background: rgba(255,255,255,0.03); }
  `]
})
export class UsersAdminPageComponent {
  private readonly api = inject(ApiService);
  readonly users = signal<User[]>([]);

  constructor() {
    this.api.getUsers().subscribe((value) => this.users.set(value));
  }
}
