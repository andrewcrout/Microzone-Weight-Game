import { Component, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Ticket } from '../../shared/models/app.models';
import { TicketCardComponent } from '../grooming/components/ticket-card/ticket-card.component';

@Component({
  selector: 'app-my-tickets-page',
  standalone: true,
  imports: [TicketCardComponent],
  template: `
    <section class="panel">
      <p class="eyebrow">Developer View</p>
      <h2>My Tickets</h2>

      <div class="list">
        @for (ticket of tickets(); track ticket.id) {
          <article (click)="openTicket(ticket)">
            <div>
              <strong>{{ ticket.title }}</strong>
              <p>{{ ticket.systemName }}</p>
              <span class="status">{{ ticket.workStatus }}</span>
            </div>
            <span>{{ ticket.weightValue || '-' }}</span>
          </article>
        }
      </div>
    </section>

    @if (selectedTicket(); as ticket) {
      <div class="modal-backdrop" (click)="closeTicket()">
        <section class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <p class="eyebrow">Ticket Detail</p>
              <h3>{{ ticket.title }}</h3>
            </div>
            <button type="button" class="close" (click)="closeTicket()">Close</button>
          </div>

          <div class="modal-content">
            <app-ticket-card [ticket]="ticket" [comments]="ticket.comments" />

            <div class="status-panel">
              <label for="work-status">Work status</label>
              <select id="work-status" [value]="ticket.workStatus" (change)="updateStatus(ticket.id, $any($event.target).value)">
                @for (status of workStatuses; track status) {
                  <option [value]="status">{{ status }}</option>
                }
              </select>
              <p>Changes here update the sprint board and dashboard progress.</p>
            </div>
          </div>
        </section>
      </div>
    }
  `,
  styles: [`
    .panel { padding: 1.5rem; border-radius: 1.4rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }
    .eyebrow, p { color: #9fb6ca; }
    .list { display: grid; gap: 0.75rem; }
    article { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-radius: 1rem; background: rgba(255,255,255,0.03); cursor: pointer; }
    .status { display: inline-flex; margin-top: 0.6rem; padding: 0.25rem 0.65rem; border-radius: 999px; background: rgba(255,255,255,0.08); color: #dce9f5; font-size: 0.85rem; }
    .modal-backdrop { position: fixed; inset: 0; z-index: 30; display: grid; place-items: center; padding: 1.5rem; background: rgba(4, 9, 16, 0.78); backdrop-filter: blur(10px); }
    .modal { width: min(100%, 68rem); padding: 1.5rem; border-radius: 1.5rem; background: linear-gradient(180deg, rgba(18,34,51,0.98), rgba(7,14,24,0.98)); border: 1px solid rgba(255,255,255,0.08); }
    .modal-header { display: flex; justify-content: space-between; gap: 1rem; align-items: start; margin-bottom: 1rem; }
    .modal-content { display: grid; grid-template-columns: minmax(0, 24rem) minmax(0, 1fr); gap: 1.25rem; align-items: start; }
    .status-panel { display: grid; gap: 0.75rem; padding: 1.25rem; border-radius: 1.2rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }
    label { font-weight: 700; }
    select, .close { padding: 0.85rem 1rem; border-radius: 0.9rem; background: #0f1d2d; border: 1px solid rgba(255,255,255,0.08); color: inherit; }
    .close { border-radius: 999px; cursor: pointer; }
    @media (max-width: 960px) {
      .modal-content { grid-template-columns: 1fr; }
    }
  `]
})
export class MyTicketsPageComponent {
  private readonly api = inject(ApiService);
  readonly tickets = signal<Ticket[]>([]);
  readonly selectedTicket = signal<Ticket | null>(null);
  readonly workStatuses = ['Not Started', 'In Progress', 'PR Sent', 'Complete'];

  constructor() {
    this.api.getMyTickets().subscribe((value) => this.tickets.set(value));
  }

  openTicket(ticket: Ticket) {
    this.selectedTicket.set(ticket);
  }

  closeTicket() {
    this.selectedTicket.set(null);
  }

  updateStatus(ticketId: number, workStatus: string) {
    this.api.updateTicketWorkStatus(ticketId, { workStatus }).subscribe((updated) => {
      this.tickets.set(this.tickets().map((ticket) => ticket.id === updated.id ? updated : ticket));

      if (this.selectedTicket()?.id === updated.id) {
        this.selectedTicket.set(updated);
      }
    });
  }
}
