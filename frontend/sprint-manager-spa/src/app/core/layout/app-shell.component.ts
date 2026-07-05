import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <aside class="nav">
        <div>
          <p class="brand">Microzone</p>
          <h2>Sprint Manager</h2>
        </div>

        <nav>
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/sprints" routerLinkActive="active">Sprints</a>
          <a routerLink="/my-tickets" routerLinkActive="active">My Tickets</a>
          @if (auth.isAdmin()) {
            <a routerLink="/admin" routerLinkActive="active">Admin</a>
            <a routerLink="/admin/trello" routerLinkActive="active">Trello</a>
            <a routerLink="/admin/users" routerLinkActive="active">Users</a>
          }
        </nav>

        <button (click)="auth.logout()">Sign out</button>
      </aside>

      <main class="content">
        <header>
          <div>
            <p class="muted">Logged in as</p>
            <h1>{{ auth.user()?.displayName }}</h1>
          </div>
          <span class="role">{{ auth.user()?.roles?.join(' / ') }}</span>
        </header>

        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .shell { height: 100vh; display: grid; grid-template-columns: 17rem 1fr; overflow: hidden; background: linear-gradient(180deg, #071018, #0b1721); color: #f6fbff; }
    .nav { position: sticky; top: 0; height: 100vh; padding: 1.5rem; border-right: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; gap: 2rem; overflow: hidden; }
    .brand { margin: 0; text-transform: uppercase; letter-spacing: 0.2em; color: #8eb8ff; font-size: 0.75rem; }
    h2 { margin: 0.3rem 0 0; }
    nav { display: grid; gap: 0.45rem; }
    a, button { border-radius: 0.9rem; padding: 0.85rem 1rem; color: inherit; text-decoration: none; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); }
    a.active { background: linear-gradient(135deg, rgba(84,178,255,0.22), rgba(255,179,71,0.2)); }
    button { margin-top: auto; cursor: pointer; }
    .content { height: 100vh; overflow-y: auto; padding: 1.5rem 2rem; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .muted { color: #8ca6be; margin: 0; }
    h1 { margin: 0.2rem 0 0; font-size: 1.6rem; }
    .role { color: #ffd8a6; }
    @media (max-width: 960px) {
      .shell { height: auto; grid-template-columns: 1fr; overflow: visible; }
      .nav { position: static; height: auto; border-right: 0; border-bottom: 1px solid rgba(255,255,255,0.08); }
      .content { height: auto; overflow: visible; }
    }
  `]
})
export class AppShellComponent {
  readonly auth = inject(AuthService);
}
