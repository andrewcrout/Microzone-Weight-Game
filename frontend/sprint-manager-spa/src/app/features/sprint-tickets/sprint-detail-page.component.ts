import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ApiService } from '../../core/services/api.service';
import { GroomingSession, SprintDetail } from '../../shared/models/app.models';

@Component({
  selector: 'app-sprint-detail-page',
  standalone: true,
  template: `
    @if (sprint(); as vm) {
      <section class="panel">
        <div class="heading">
          <div>
            <p class="eyebrow">Sprint Detail</p>
            <h2>{{ vm.name }}</h2>
            <p>{{ vm.goal || 'No goal captured yet.' }}</p>
          </div>
          <div class="actions">
            @if (auth.isAdmin() && !activeSession()) {
              <button type="button" class="primary" (click)="initiateGrooming()">Initiate grooming</button>
            }

            @if (activeSession(); as session) {
              <button type="button" class="secondary" (click)="openLobby(session.id)">
                {{ auth.isAdmin() ? 'Open grooming lobby' : 'Join' }}
              </button>
            }
          </div>
        </div>

        @if (!auth.isAdmin() && !activeSession()) {
          <p class="session-hint">No active grooming lobby yet for this sprint.</p>
        }

        <input [value]="search()" (input)="onSearch($any($event.target).value)" placeholder="Search tickets" />

        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>System</th>
              <th>Labels</th>
              <th>Assignees</th>
              <th>Comments</th>
              <th>Weight</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            @for (ticket of filteredTickets(); track ticket.id) {
              <tr>
                <td><a [href]="ticket.shortUrl" target="_blank">{{ ticket.title }}</a></td>
                <td>{{ ticket.systemName }}</td>
                <td>{{ ticket.labels.join(', ') }}</td>
                <td>{{ ticket.assignees.join(', ') || 'Unassigned' }}</td>
                <td>{{ ticket.commentCount }}</td>
                <td>{{ ticket.weightValue || '-' }}</td>
                <td>{{ ticket.groomingStatus }}</td>
              </tr>
            }
          </tbody>
        </table>
      </section>
    }
  `,
  styles: [`
    .panel { padding: 1.5rem; border-radius: 1.4rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }
    .heading { display: flex; justify-content: space-between; gap: 1rem; align-items: center; }
    .actions { display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: flex-end; }
    .eyebrow, p { color: #9fb6ca; }
    .session-hint { margin-top: 0.75rem; }
    input { width: 100%; margin: 1rem 0; padding: 0.85rem 1rem; border-radius: 0.9rem; background: #0f1d2d; border: 1px solid rgba(255,255,255,0.08); color: inherit; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: left; vertical-align: top; }
    a { color: #93c4ff; }
    button { padding: 0.85rem 1.1rem; border-radius: 999px; border: 0; font-weight: 700; cursor: pointer; }
    .primary { background: #ffd08c; color: #08131f; }
    .secondary { background: rgba(255,255,255,0.08); color: #f6fbff; border: 1px solid rgba(255,255,255,0.1); }
  `]
})
export class SprintDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);

  readonly sprint = signal<SprintDetail | null>(null);
  readonly activeSession = signal<GroomingSession | null>(null);
  readonly search = signal('');

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getSprint(id).subscribe((value) => this.sprint.set(value));
    this.api.getActiveGroomingSession(id).subscribe({
      next: (value) => this.activeSession.set(value),
      error: () => this.activeSession.set(null)
    });
  }

  filteredTickets() {
    const value = this.search().trim().toLowerCase();
    return (this.sprint()?.tickets ?? []).filter((ticket) =>
      !value || ticket.title.toLowerCase().includes(value) || ticket.description.toLowerCase().includes(value));
  }

  onSearch(value: string) {
    this.search.set(value);
  }

  initiateGrooming() {
    const sprintId = this.sprint()?.id;
    if (!sprintId) {
      return;
    }

    this.api.startGroomingSession(sprintId).subscribe((session) => {
      this.activeSession.set(session);
      void this.router.navigate(['/grooming', session.id, 'lobby']);
    });
  }

  openLobby(sessionId: number) {
    void this.router.navigate(['/grooming', sessionId, 'lobby']);
  }
}
