import { Component, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { SystemDefinition, WeightCard } from '../../shared/models/app.models';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  template: `
    <section class="split">
      <div class="panel">
        <p class="eyebrow">Weight Cards</p>
        <div class="cards">
          @for (card of weightCards(); track card.id) {
            <article>
              <strong>{{ card.weightValue }}</strong>
              <h3>{{ card.timeLabel }}</h3>
              <p>{{ card.estimatedTime }}</p>
            </article>
          }
        </div>
      </div>

      <div class="panel">
        <p class="eyebrow">System Definitions</p>
        <div class="systems">
          @for (system of systems(); track system.id) {
            <span>{{ system.name }}</span>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .split { display: grid; grid-template-columns: 1.2fr 1fr; gap: 1rem; }
    .panel { padding: 1.5rem; border-radius: 1.4rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }
    .eyebrow, p { color: #9fb6ca; }
    .cards { display: grid; gap: 0.75rem; }
    article { padding: 1rem; border-radius: 1rem; background: rgba(255,255,255,0.03); }
    .systems { display: flex; flex-wrap: wrap; gap: 0.6rem; }
    .systems span { padding: 0.55rem 0.8rem; background: rgba(255,255,255,0.05); border-radius: 999px; }
    @media (max-width: 960px) { .split { grid-template-columns: 1fr; } }
  `]
})
export class AdminPageComponent {
  private readonly api = inject(ApiService);
  readonly weightCards = signal<WeightCard[]>([]);
  readonly systems = signal<SystemDefinition[]>([]);

  constructor() {
    this.api.getWeightCards().subscribe((value) => this.weightCards.set(value));
    this.api.getSystems().subscribe((value) => this.systems.set(value));
  }
}
