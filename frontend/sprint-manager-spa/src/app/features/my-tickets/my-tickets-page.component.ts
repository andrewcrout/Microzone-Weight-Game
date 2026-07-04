import { Component, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Ticket } from '../../shared/models/app.models';

@Component({
  selector: 'app-my-tickets-page',
  standalone: true,
  template: `
    <section class="panel">
      <p class="eyebrow">Developer View</p>
      <h2>My Tickets</h2>

      <div class="list">
        @for (ticket of tickets(); track ticket.id) {
          <article>
            <div>
              <strong>{{ ticket.title }}</strong>
              <p>{{ ticket.systemName }}</p>
            </div>
            <span>{{ ticket.weightValue || '-' }}</span>
          </article>
        }
      </div>
    </section>
  `,
  styles: [`
    .panel { padding: 1.5rem; border-radius: 1.4rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }
    .eyebrow, p { color: #9fb6ca; }
    .list { display: grid; gap: 0.75rem; }
    article { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-radius: 1rem; background: rgba(255,255,255,0.03); }
  `]
})
export class MyTicketsPageComponent {
  private readonly api = inject(ApiService);
  readonly tickets = signal<Ticket[]>([]);

  constructor() {
    this.api.getMyTickets().subscribe((value) => this.tickets.set(value));
  }
}
