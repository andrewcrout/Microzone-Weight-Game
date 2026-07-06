import { Component, input, output } from '@angular/core';
import { RevealVotes } from '../../../../shared/models/app.models';

@Component({
  selector: 'app-vote-reveal',
  standalone: true,
  template: `
    @if (reveal()) {
      <section class="reveal">
        <h3>Vote Reveal</h3>
        <div class="votes">
          @for (vote of reveal()!.votes; track vote.userId) {
            @if (vote.userId === currentUserId()) {
              <button type="button" class="vote-card own-vote" (click)="changeRequested.emit()">
                <strong>{{ vote.weightValue }}</strong>
                <span>{{ vote.displayName }}</span>
                <small>Click to change your vote</small>
              </button>
            } @else {
              <article class="vote-card">
                <strong>{{ vote.weightValue }}</strong>
                <span>{{ vote.displayName }}</span>
              </article>
            }
          }
        </div>
        <p>{{ reveal()!.isTie ? 'Tie detected. Admin final choice required.' : 'Majority weight: ' + reveal()!.majorityWeight }}</p>
      </section>
    }
  `,
  styles: [`
    .reveal { padding: 1rem; border-radius: 1.2rem; background: rgba(255,255,255,0.05); }
    .votes { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .vote-card {
      min-width: 5rem;
      padding: 0.8rem;
      border-radius: 1rem;
      background: rgba(255,255,255,0.04);
      text-align: center;
      color: inherit;
    }
    .own-vote {
      border: 1px solid rgba(255, 208, 140, 0.45);
      background: rgba(255, 208, 140, 0.12);
      cursor: pointer;
    }
    .own-vote small {
      display: block;
      margin-top: 0.35rem;
      color: #ffd08c;
    }
    strong { display: block; font-size: 1.4rem; }
  `]
})
export class VoteRevealComponent {
  readonly reveal = input<RevealVotes | null>(null);
  readonly currentUserId = input<number | null>(null);
  readonly changeRequested = output<void>();
}
