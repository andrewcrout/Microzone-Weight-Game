import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { SprintSummary, TrelloBoardConfig } from '../../shared/models/app.models';

@Component({
  selector: 'app-trello-admin-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="layout">
      <div class="panel">
        <p class="eyebrow">Trello Integration</p>
        <h2>Board Configuration</h2>
        <form [formGroup]="boardForm" (ngSubmit)="saveBoard()">
          <input formControlName="name" placeholder="Board name" />
          <input formControlName="boardId" placeholder="Board ID" />
          <input formControlName="baseUrl" placeholder="Base URL" />
          <input formControlName="systemName" placeholder="System mapping" />
          <button type="submit">Add Board</button>
        </form>

        <div class="list">
          @for (board of boards(); track board.id) {
            <article>{{ board.name }} · {{ board.systemName }}</article>
          }
        </div>
      </div>

      <div class="panel">
        <p class="eyebrow">Sprint Import</p>
        <h2>Gather Sprint Tickets</h2>
        <form [formGroup]="importForm" (ngSubmit)="gather()">
          <select formControlName="sprintId">
            @for (sprint of sprints(); track sprint.id) {
              <option [value]="sprint.id">{{ sprint.name }}</option>
            }
          </select>
          <input formControlName="label" placeholder="Sprint label" />
          <label class="toggle"><input type="checkbox" formControlName="useMockData" /> Use mock data</label>
          <button type="submit">Gather Sprint Tickets</button>
        </form>
        @if (message()) { <p>{{ message() }}</p> }
      </div>
    </section>
  `,
  styles: [`
    .layout { display: grid; grid-template-columns: 1.15fr 1fr; gap: 1rem; }
    .panel { padding: 1.5rem; border-radius: 1.4rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }
    .eyebrow, p { color: #9fb6ca; }
    form, .list { display: grid; gap: 0.75rem; }
    input, select { padding: 0.85rem 1rem; border-radius: 0.9rem; border: 1px solid rgba(255,255,255,0.08); background: #0f1d2d; color: inherit; }
    button { padding: 0.9rem 1rem; border-radius: 999px; border: 0; background: #ffd08c; color: #08131f; font-weight: 700; }
    .toggle { display: flex; gap: 0.5rem; align-items: center; }
    @media (max-width: 960px) { .layout { grid-template-columns: 1fr; } }
  `]
})
export class TrelloAdminPageComponent {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  readonly boards = signal<TrelloBoardConfig[]>([]);
  readonly sprints = signal<SprintSummary[]>([]);
  readonly message = signal('');

  readonly boardForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    boardId: ['mock-board', Validators.required],
    baseUrl: ['https://api.trello.com/1', Validators.required],
    systemName: ['PROMAN GENERAL', Validators.required],
    isEnabled: [true]
  });

  readonly importForm = this.fb.nonNullable.group({
    sprintId: [1, Validators.required],
    label: ['Sprint Alpha', Validators.required],
    useMockData: [true]
  });

  constructor() {
    this.reload();
  }

  saveBoard() {
    this.api.saveBoardConfig(this.boardForm.getRawValue()).subscribe(() => this.reload());
  }

  gather() {
    const value = this.importForm.getRawValue();
    this.api.gatherSprintTickets(value.sprintId, value.label, value.useMockData).subscribe((response) => {
      this.message.set(`Imported ${response.imported} tickets.`);
    });
  }

  private reload() {
    this.api.getBoardConfigs().subscribe((value) => this.boards.set(value));
    this.api.getSprints().subscribe((value) => this.sprints.set(value));
  }
}
