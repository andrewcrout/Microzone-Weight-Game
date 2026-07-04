import { Component, input, output } from '@angular/core';
import { WeightCard } from '../../../../shared/models/app.models';

@Component({
  selector: 'app-weight-card',
  standalone: true,
  template: `
    <button class="weight-card" [class.selected]="selected()" (click)="picked.emit(card().weightValue)">
      <strong>{{ card().weightValue }}</strong>
      <h4>{{ card().timeLabel }}</h4>
      <p>{{ card().estimatedTime }}</p>
      <small>{{ card().element }} · {{ card().line }}</small>
    </button>
  `,
  styles: [`
    .weight-card { width: 100%; text-align: left; padding: 1rem; border-radius: 1.2rem; border: 1px solid rgba(255,255,255,0.12); background: linear-gradient(135deg, rgba(95,163,255,0.12), rgba(255,176,94,0.12)); color: inherit; }
    .selected { outline: 2px solid #ffd08c; transform: translateY(-2px); }
    strong { font-size: 1.8rem; }
    h4, p, small { margin: 0.25rem 0; }
    small { color: #9fb6ca; }
  `]
})
export class WeightCardComponent {
  readonly card = input.required<WeightCard>();
  readonly selected = input(false);
  readonly picked = output<number>();
}
