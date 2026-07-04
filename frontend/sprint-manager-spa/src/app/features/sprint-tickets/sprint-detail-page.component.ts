import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SprintDetail, Ticket } from '../../shared/models/app.models';

@Component({
  selector: 'app-sprint-detail-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (sprint(); as vm) {
      <section class="panel">
        <div class="heading">
          <div>
            <p class="eyebrow">Sprint Detail</p>
            <h2>{{ vm.name }}</h2>
            <p>{{ vm.goal || 'No goal captured yet.' }}</p>
          </div>
          @if (sessionLink()) {
            <a [routerLink]="sessionLink()">Open Grooming Lobby</a>
          }
        </div>

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
    .eyebrow, p { color: #9fb6ca; }
    input { width: 100%; margin: 1rem 0; padding: 0.85rem 1rem; border-radius: 0.9rem; background: #0f1d2d; border: 1px solid rgba(255,255,255,0.08); color: inherit; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: left; vertical-align: top; }
    a { color: #93c4ff; }
  `]
})
export class SprintDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);

  readonly sprint = signal<SprintDetail | null>(null);
  readonly search = signal('');
  readonly sessionLink = signal<any[] | null>(null);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getSprint(id).subscribe((value) => this.sprint.set(value));
  }

  filteredTickets() {
    const value = this.search().trim().toLowerCase();
    return (this.sprint()?.tickets ?? []).filter((ticket) =>
      !value || ticket.title.toLowerCase().includes(value) || ticket.description.toLowerCase().includes(value));
  }

  onSearch(value: string) {
    this.search.set(value);
  }
}
