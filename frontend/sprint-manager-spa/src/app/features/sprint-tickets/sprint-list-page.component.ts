import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SprintSummary } from '../../shared/models/app.models';

@Component({
  selector: 'app-sprint-list-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="panel">
      <div class="heading">
        <div>
          <p class="eyebrow">Sprint Overview</p>
          <h2>Sprints</h2>
        </div>
      </div>

      <div class="grid">
        @for (sprint of sprints(); track sprint.id) {
          <a class="tile" [routerLink]="['/sprints', sprint.id]">
            <strong>{{ sprint.name }}</strong>
            <span>{{ sprint.label }}</span>
            <small>{{ sprint.ticketCount }} tickets</small>
          </a>
        }
      </div>
    </section>
  `,
  styles: [`
    .panel { padding: 1.5rem; border-radius: 1.4rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 1rem; }
    .tile { padding: 1rem; border-radius: 1rem; text-decoration: none; color: inherit; background: rgba(255,255,255,0.03); display: grid; gap: 0.35rem; }
    .eyebrow, span, small { color: #9fb6ca; }
    @media (max-width: 960px) { .grid { grid-template-columns: 1fr; } }
  `]
})
export class SprintListPageComponent {
  private readonly api = inject(ApiService);
  readonly sprints = signal<SprintSummary[]>([]);

  constructor() {
    this.api.getSprints().subscribe((value) => this.sprints.set(value));
  }
}
