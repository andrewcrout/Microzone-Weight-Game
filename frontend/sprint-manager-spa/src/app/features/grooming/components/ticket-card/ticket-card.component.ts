import { Component, input, signal } from '@angular/core';
import { MarkdownPipe } from '../../../../shared/pipes/markdown.pipe';
import { Ticket } from '../../../../shared/models/app.models';

@Component({
  selector: 'app-ticket-card',
  standalone: true,
  imports: [MarkdownPipe],
  template: `
    <article class="card" [class.flipped]="flipped()" (click)="flipped.set(!flipped())">
      @if (!flipped()) {
        <div class="face">
          <h3>{{ ticket().title }}</h3>
          <div class="meta">
            <span>{{ ticket().systemName }}</span>
            <span>Weight: {{ ticket().weightValue ?? '-' }}</span>
          </div>
          <div class="labels">
            @for (label of ticket().labels; track label) { <span>{{ label }}</span> }
          </div>
          <div class="markdown" [innerHTML]="ticket().description | markdown"></div>
          <footer>
            <span>Comments {{ comments().length }}</span>
            <span>{{ ticket().assignees.join(', ') || 'Unassigned' }}</span>
          </footer>
        </div>
      } @else {
        <div class="face">
          <h3>Comments</h3>
          @if (comments().length) {
            <ul>
              @for (comment of comments(); track comment) { <li>{{ comment }}</li> }
            </ul>
          } @else {
            <p class="empty">No comments captured for this ticket.</p>
          }
        </div>
      }
    </article>
  `,
  styles: [`
    :host { display: grid; }
    .card { width: min(100%, 21rem); min-height: 34.5rem; aspect-ratio: 5 / 7; border-radius: 1.4rem; padding: 1.2rem; background: linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04)); border: 1px solid rgba(255,255,255,0.1); cursor: pointer; justify-self: center; }
    .face { height: 100%; display: grid; grid-template-rows: auto auto auto 1fr auto; gap: 0.85rem; }
    .meta, footer, .labels { display: flex; gap: 0.5rem; flex-wrap: wrap; color: #9fb6ca; }
    .labels span { background: rgba(255,255,255,0.08); padding: 0.35rem 0.55rem; border-radius: 999px; }
    .markdown { min-height: 0; overflow: auto; color: #d9e8f5; }
    ul { padding-left: 1.1rem; max-height: 15rem; overflow: auto; }
    .empty { color: #9fb6ca; }
    @media (max-width: 960px) {
      .card { width: 100%; max-width: 21rem; min-height: 32rem; }
    }
  `]
})
export class TicketCardComponent {
  readonly ticket = input.required<Ticket>();
  readonly comments = input<string[]>([]);
  readonly flipped = signal(false);
}
