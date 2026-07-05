import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { SprintSummary, SystemDefinition, TrelloBoardConfig } from '../../shared/models/app.models';

@Component({
  selector: 'app-trello-admin-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="layout">
      <div class="panel">
        <p class="eyebrow">Trello Integration</p>
        <h2>Board Configuration</h2>
        <form [formGroup]="boardForm" (ngSubmit)="saveBoard()" class="editor-form">
          <select formControlName="name">
            <option value="" disabled>Select system definition</option>
            @for (system of systems(); track system.id) {
              <option [value]="system.name">{{ system.name }}</option>
            }
          </select>
          <input formControlName="boardId" placeholder="Board ID" />
          <input [value]="defaultBaseUrl" readonly aria-label="Base URL" />
          <button type="submit" [disabled]="boardForm.invalid">Add Board</button>
        </form>

        <div class="board-list">
          @for (board of boards(); track board.id) {
            <article class="board-card" [class.disabled]="!board.isEnabled">
              <div class="board-meta">
                <strong>{{ board.name }}</strong>
                <span>{{ board.boardId }}</span>
                <small>{{ board.isEnabled ? 'Included in gather' : 'Excluded from gather' }}</small>
              </div>
              <div class="board-actions">
                <button type="button" class="secondary" (click)="toggleBoard(board)">
                  {{ board.isEnabled ? 'Disable' : 'Enable' }}
                </button>
                <button type="button" class="danger" (click)="deleteBoard(board.id)">Delete</button>
              </div>
            </article>
          }
        </div>
      </div>

      <div class="panel">
        <p class="eyebrow">Sprint Import</p>
        <h2>Gather Sprint Tickets</h2>
        <form [formGroup]="importForm" (ngSubmit)="gather()" class="editor-form">
          <select formControlName="sprintId">
            @for (sprint of sprints(); track sprint.id) {
              <option [value]="sprint.id">{{ sprint.name }}</option>
            }
          </select>
          <input formControlName="label" placeholder="Sprint label" />
          <button type="submit" [disabled]="importForm.invalid || enabledBoards().length === 0">Gather Sprint Tickets</button>
        </form>
        @if (message()) { <p>{{ message() }}</p> }
      </div>

      <div class="panel wide">
        <p class="eyebrow">Boards Selected For Gather</p>
        <div class="systems">
          @for (board of enabledBoards(); track board.id) {
            <button type="button" class="board-chip" (click)="toggleBoard(board)">{{ board.name }}</button>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .layout { display: grid; grid-template-columns: 1.15fr 1fr; gap: 1rem; }
    .panel { padding: 1.5rem; border-radius: 1.4rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }
    .wide { grid-column: 1 / -1; }
    .eyebrow, p, span, small { color: #9fb6ca; }
    .editor-form, .board-list { display: grid; gap: 0.75rem; }
    input, select { padding: 0.85rem 1rem; border-radius: 0.9rem; border: 1px solid rgba(255,255,255,0.08); background: #0f1d2d; color: inherit; }
    input[readonly] { opacity: 0.75; pointer-events: none; }
    button { padding: 0.9rem 1rem; border-radius: 999px; border: 0; background: #ffd08c; color: #08131f; font-weight: 700; cursor: pointer; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .secondary { background: rgba(255,255,255,0.08); color: #f6fbff; }
    .danger { background: #ff8f8f; color: #2e0f12; }
    .board-card { display: flex; justify-content: space-between; gap: 1rem; padding: 1rem; border-radius: 1rem; background: rgba(255,255,255,0.03); align-items: flex-start; }
    .board-card.disabled { opacity: 0.7; }
    .board-meta { display: grid; gap: 0.2rem; }
    .board-actions, .systems { display: flex; gap: 0.65rem; flex-wrap: wrap; }
    .board-chip { background: rgba(255,255,255,0.05); color: #d4e1ec; }
    @media (max-width: 960px) {
      .layout { grid-template-columns: 1fr; }
      .board-card { flex-direction: column; }
    }
  `]
})
export class TrelloAdminPageComponent {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  readonly defaultBaseUrl = 'https://api.trello.com/1';
  readonly boards = signal<TrelloBoardConfig[]>([]);
  readonly sprints = signal<SprintSummary[]>([]);
  readonly systems = signal<SystemDefinition[]>([]);
  readonly message = signal('');

  readonly boardForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    boardId: ['', Validators.required]
  });

  readonly importForm = this.fb.nonNullable.group({
    sprintId: [0, Validators.required],
    label: ['', Validators.required]
  });

  readonly enabledBoards = signal<TrelloBoardConfig[]>([]);

  constructor() {
    this.reload();
  }

  saveBoard() {
    const value = this.boardForm.getRawValue();
    this.api.saveBoardConfig({
      id: null,
      name: value.name,
      boardId: value.boardId,
      baseUrl: this.defaultBaseUrl,
      isEnabled: true,
      systemName: value.name
    }).subscribe({
      next: () => {
        this.message.set(`Board '${value.name}' added.`);
        this.boardForm.reset({ name: '', boardId: '' });
        this.reload();
      },
      error: (error) => {
        this.message.set(error?.error?.message ?? 'Unable to save board configuration.');
      }
    });
  }

  toggleBoard(board: TrelloBoardConfig) {
    this.api.saveBoardConfig({
      id: board.id,
      name: board.name,
      boardId: board.boardId,
      baseUrl: board.baseUrl,
      isEnabled: !board.isEnabled,
      systemName: board.systemName
    }).subscribe(() => this.reload());
  }

  deleteBoard(id: number) {
    this.api.deleteBoardConfig(id).subscribe(() => {
      this.message.set('Board removed.');
      this.reload();
    });
  }

  gather() {
    const value = this.importForm.getRawValue();
    this.api.gatherSprintTickets(value.sprintId, value.label).subscribe({
      next: (response) => {
        this.message.set(`Imported ${response.imported} tickets from ${this.enabledBoards().length} board(s).`);
      },
      error: (error) => {
        this.message.set(error?.error?.message ?? 'Unable to gather sprint tickets.');
      }
    });
  }

  private reload() {
    this.api.getBoardConfigs().subscribe((value) => {
      this.boards.set(value);
      this.enabledBoards.set(value.filter((board) => board.isEnabled));
    });
    this.api.getSystems().subscribe((value) => this.systems.set(value));
    this.api.getSprints().subscribe((value) => {
      this.sprints.set(value);
      const activeSprint = value.find((sprint) => sprint.isActive) ?? value[0];
      if (activeSprint) {
        this.importForm.patchValue({
          sprintId: activeSprint.id,
          label: this.importForm.controls.label.value || activeSprint.label
        });
      }
    });
  }
}
