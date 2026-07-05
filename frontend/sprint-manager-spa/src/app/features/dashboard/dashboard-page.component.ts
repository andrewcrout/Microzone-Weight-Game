import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { StatCardComponent } from '../../shared/components/stat-card.component';
import { Dashboard } from '../../shared/models/app.models';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [StatCardComponent, RouterLink],
  template: `
    @if (dashboard(); as vm) {
      <section class="hero">
        <div>
          <p class="eyebrow">Current Sprint</p>
          <h2>{{ vm.greeting }}</h2>
          <p>{{ vm.currentSprint || 'No active sprint yet.' }}</p>
        </div>
        @if (vm.activeGroomingSessionId) {
          <a [routerLink]="['/grooming', vm.activeGroomingSessionId, 'lobby']" class="action">Open Active Grooming</a>
        }
      </section>

      <section class="stats">
        <app-stat-card label="Completion" [value]="vm.completionPercentage + '%'" />
        <app-stat-card label="Carry Over" [value]="vm.carryOverRate + '%'" subtext="MVP placeholder" />
        <app-stat-card label="Remaining" [value]="vm.remainingTickets" />
        <app-stat-card label="Assigned To Me" [value]="vm.assignedTickets" />
      </section>

      @if (vm.isAdmin) {
        <section class="stats progress-stats">
          <app-stat-card label="Not Started" [value]="vm.notStartedCount" />
          <app-stat-card label="In Progress" [value]="vm.inProgressCount" />
          <app-stat-card label="PR Sent" [value]="vm.prSentCount" />
          <app-stat-card label="Complete" [value]="vm.completeCount" />
        </section>

        <section class="actions">
          <a routerLink="/admin/trello">Configure Trello</a>
          <a routerLink="/sprints">Open Sprint Tickets</a>
        </section>
      }
    }
  `,
  styles: [`
    .hero, .actions { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 1.5rem; border-radius: 1.4rem; background: linear-gradient(135deg, rgba(84,178,255,0.17), rgba(255,179,71,0.12)); }
    .eyebrow { text-transform: uppercase; letter-spacing: 0.18em; color: #9ec5ff; }
    .stats { margin: 1.5rem 0; display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 1rem; }
    .progress-stats { margin-top: 0; }
    .action, .actions a { color: #08131f; background: #ffd08c; padding: 0.85rem 1rem; border-radius: 999px; text-decoration: none; font-weight: 700; }
    .actions { justify-content: flex-start; }
    @media (max-width: 960px) { .stats { grid-template-columns: repeat(2, minmax(0,1fr)); } .hero { flex-direction: column; align-items: flex-start; } }
  `]
})
export class DashboardPageComponent {
  private readonly api = inject(ApiService);
  readonly dashboard = signal<Dashboard | null>(null);

  constructor() {
    this.api.getDashboard().subscribe((value) => this.dashboard.set(value));
  }
}
