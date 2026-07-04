import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { GroomingStateService } from '../../../core/services/grooming-state.service';

@Component({
  selector: 'app-grooming-lobby-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="panel">
      <p class="eyebrow">Live Grooming</p>
      <h2>Lobby</h2>
      <p>Participants join here. Ready state is visible, votes remain private until reveal.</p>

      <div class="controls">
        <button (click)="setReady(true)">Ready Up</button>
        <a [routerLink]="['/grooming', sessionId, 'session']">Enter Session</a>
      </div>

      <div class="participants">
        @for (participant of groomingState.lobby()?.participants ?? []; track participant.userId) {
          <article>
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
    button, a { padding: 0.85rem 1rem; border-radius: 999px; border: 0; background: #ffd08c; color: #08131f; text-decoration: none; font-weight: 700; }
    article { padding: 1rem; border-radius: 1rem; background: rgba(255,255,255,0.04); min-width: 12rem; display: grid; gap: 0.2rem; }
    .eyebrow, p, span, small { color: #9fb6ca; }
  `]
})
export class GroomingLobbyPageComponent {
  readonly route = inject(ActivatedRoute);
  readonly auth = inject(AuthService);
  readonly groomingState = inject(GroomingStateService);
  readonly sessionId = Number(this.route.snapshot.paramMap.get('sessionId'));

  constructor() {
    const token = this.auth.token();
    const user = this.auth.user();
    if (token && user) {
      void this.groomingState.connect(token, this.sessionId, user.displayName);
    }
  }

  setReady(value: boolean) {
    void this.groomingState.setReady(this.sessionId, value);
  }
}
