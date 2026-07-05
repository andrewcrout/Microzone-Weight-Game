import { Component, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { GroomingStateService } from '../../../core/services/grooming-state.service';

@Component({
  selector: 'app-grooming-lobby-page',
  standalone: true,
  template: `
    <section class="panel">
      <p class="eyebrow">Live Grooming</p>
      <h2>Waiting room</h2>
      <p>Everyone joining this sprint enters here first. The admin can review the room and start the grooming when the team is ready.</p>

      <div class="controls">
        <button [class.ghost]="isCurrentUserReady()" (click)="toggleReady()">
          {{ isCurrentUserReady() ? 'Unready' : 'Ready' }}
        </button>
        @if (auth.isAdmin()) {
          <button class="primary" [disabled]="!groomingState.lobby()?.canStart" (click)="startSession()">Start sprint grooming</button>
        }
        <button class="ghost" (click)="leaveLobby()">Leave grooming</button>
      </div>

      @if (groomingState.lobby()?.participants?.length) {
        <p class="summary">{{ groomingState.lobby()!.participants.length }} participant(s) in the lobby, including the admin.</p>
      }

      <div class="participants">
        @for (participant of groomingState.lobby()?.participants ?? []; track participant.userId) {
          <article [class.ready]="participant.isReady">
            <strong>{{ participant.displayName }}</strong>
            <span>{{ participant.isAdmin ? 'Admin' : 'Developer' }}</span>
            <small>{{ participant.isReady ? 'Ready' : 'Waiting' }}</small>
          </article>
        }
      </div>
    </section>
  `,
  styles: [`
    .panel { padding: 1.5rem; border-radius: 1.4rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }
    .controls, .participants { display: flex; gap: 0.8rem; flex-wrap: wrap; margin-top: 1rem; }
    button { padding: 0.85rem 1rem; border-radius: 999px; border: 0; text-decoration: none; font-weight: 700; cursor: pointer; }
    .primary { background: #ffd08c; color: #08131f; }
    .ghost { background: rgba(255,255,255,0.08); color: #f4f7fb; }
    article { padding: 1rem; border-radius: 1rem; background: rgba(255,255,255,0.04); min-width: 12rem; display: grid; gap: 0.2rem; }
    article.ready { outline: 1px solid rgba(255, 208, 140, 0.5); }
    .summary { margin-top: 1rem; }
    .eyebrow, p, span, small { color: #9fb6ca; }
  `]
})
export class GroomingLobbyPageComponent implements OnDestroy {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly auth = inject(AuthService);
  readonly api = inject(ApiService);
  readonly groomingState = inject(GroomingStateService);
  readonly sessionId = Number(this.route.snapshot.paramMap.get('sessionId'));
  readonly loading = signal(true);
  private pollTimer?: ReturnType<typeof setInterval>;

  constructor() {
    const token = this.auth.token();
    const user = this.auth.user();
    if (token && user) {
      void this.groomingState.connect(token, this.sessionId, user.displayName);
    }

    this.refreshSession();
    this.pollTimer = setInterval(() => {
      const session = this.groomingState.session();
      if (session?.status === 'InProgress' || session?.status === 'Completed') {
        if (this.pollTimer) {
          clearInterval(this.pollTimer);
          this.pollTimer = undefined;
        }

        void this.router.navigate(['/grooming', this.sessionId, 'session']);
        return;
      }

      this.refreshSession();
    }, 2000);
  }

  setReady(value: boolean) {
    void this.groomingState.setReady(this.sessionId, value);
  }

  toggleReady() {
    this.setReady(!this.isCurrentUserReady());
  }

  leaveLobby() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = undefined;
    }

    void this.groomingState.leaveLobby(this.sessionId).finally(() => {
      const sprintId = this.groomingState.session()?.sprintId;
      void this.router.navigate(sprintId ? ['/sprints', sprintId] : ['/sprints']);
    });
  }

  startSession() {
    this.api.beginGroomingSession(this.sessionId).subscribe((session) => {
      this.groomingState.setSession(session);
      void this.router.navigate(['/grooming', this.sessionId, 'session']);
    });
  }

  ngOnDestroy() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }
  }

  private refreshSession() {
    this.api.getGroomingSession(this.sessionId).subscribe({
      next: (session) => {
        this.loading.set(false);
        this.groomingState.setSession(session);
        if (session.status === 'InProgress') {
          void this.router.navigate(['/grooming', this.sessionId, 'session']);
        }
      },
      error: () => this.recoverMissingSession()
    });
  }

  private recoverMissingSession() {
    this.api.getDashboard().subscribe({
      next: (dashboard) => {
        this.loading.set(false);
        const activeSessionId = dashboard.activeGroomingSessionId;
        if (activeSessionId && activeSessionId !== this.sessionId) {
          void this.router.navigate(['/grooming', activeSessionId, 'lobby']);
          return;
        }

        if (this.pollTimer) {
          clearInterval(this.pollTimer);
          this.pollTimer = undefined;
        }
      },
      error: () => {
        this.loading.set(false);
        if (this.pollTimer) {
          clearInterval(this.pollTimer);
          this.pollTimer = undefined;
        }
      }
    });
  }

  isCurrentUserReady() {
    const userId = this.auth.user()?.id;
    if (!userId) {
      return false;
    }

    return this.groomingState.lobby()?.participants.some((participant) => participant.userId === userId && participant.isReady) ?? false;
  }
}
