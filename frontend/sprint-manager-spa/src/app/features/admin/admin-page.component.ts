import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { SprintSummary, SystemDefinition, WeightCard } from '../../shared/models/app.models';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="split">
      <div class="panel">
        <p class="eyebrow">Sprint Management</p>
        <h3>{{ editingSprintId() ? 'Edit Sprint' : 'Create Sprint' }}</h3>
        <form [formGroup]="sprintForm" (ngSubmit)="saveSprint()" class="editor-form">
          <input formControlName="name" placeholder="Sprint name" />
          <input formControlName="label" placeholder="Sprint label" />
          <textarea formControlName="goal" placeholder="Sprint goal"></textarea>
          <label class="toggle"><input type="checkbox" formControlName="isActive" /> Mark as active sprint</label>
          <div class="actions">
            <button type="submit" [disabled]="sprintForm.invalid">{{ editingSprintId() ? 'Update Sprint' : 'Create Sprint' }}</button>
            @if (editingSprintId()) {
              <button type="button" class="secondary" (click)="cancelSprintEdit()">Cancel</button>
            }
          </div>
        </form>

        <div class="stack">
          @for (sprint of sprints(); track sprint.id) {
            <article class="row-card">
              <div>
                <strong>{{ sprint.name }}</strong>
                <span>{{ sprint.label }}</span>
                <small>{{ sprint.isActive ? 'Active' : 'Inactive' }} - {{ sprint.ticketCount }} tickets</small>
              </div>
              <div class="row-actions">
                <button type="button" class="secondary" (click)="editSprint(sprint)">Edit</button>
                <button type="button" class="secondary" (click)="toggleSprint(sprint)">{{ sprint.isActive ? 'Set Inactive' : 'Set Active' }}</button>
                <button type="button" class="danger" (click)="deleteSprint(sprint.id)">Delete</button>
              </div>
            </article>
          }
        </div>
      </div>

      <div class="panel">
        <p class="eyebrow">Weight Cards</p>
        <h3>{{ editingWeightCardId() ? 'Edit Weight Card' : 'Add Weight Card' }}</h3>
        <form [formGroup]="weightCardForm" (ngSubmit)="saveWeightCard()" class="editor-form">
          <div class="grid-two">
            <input type="number" formControlName="weightValue" placeholder="Weight value" />
            <input type="number" formControlName="timeScore" placeholder="Time score" />
          </div>
          <input formControlName="timeLabel" placeholder="Time label" />
          <input formControlName="estimatedTime" placeholder="Estimated time" />
          <input formControlName="element" placeholder="Element" />
          <textarea formControlName="line" placeholder="Card line"></textarea>
          <div class="actions">
            <button type="submit" [disabled]="weightCardForm.invalid">{{ editingWeightCardId() ? 'Update Card' : 'Add Card' }}</button>
            @if (editingWeightCardId()) {
              <button type="button" class="secondary" (click)="cancelWeightCardEdit()">Cancel</button>
            }
          </div>
        </form>

        <div class="stack">
          @for (card of weightCards(); track card.id) {
            <article class="row-card">
              <div>
                <strong>{{ card.weightValue }} - {{ card.timeLabel }}</strong>
                <span>{{ card.estimatedTime }}</span>
                <small>Time score {{ card.timeScore }} · {{ card.element }}</small>
              </div>
              <div class="row-actions">
                <button type="button" class="secondary" (click)="editWeightCard(card)">Edit</button>
                <button type="button" class="danger" (click)="deleteWeightCard(card.id)">Delete</button>
              </div>
            </article>
          }
        </div>
      </div>

      <div class="panel wide">
        <p class="eyebrow">System Definitions</p>
        <h3>{{ editingSystemId() ? 'Edit System' : 'Add System' }}</h3>
        <form [formGroup]="systemForm" (ngSubmit)="saveSystem()" class="system-form">
          <input formControlName="name" placeholder="System name" />
          <div class="actions">
            <button type="submit" [disabled]="systemForm.invalid">{{ editingSystemId() ? 'Update System' : 'Add System' }}</button>
            @if (editingSystemId()) {
              <button type="button" class="secondary" (click)="cancelSystemEdit()">Cancel</button>
            }
          </div>
        </form>

        <div class="systems">
          @for (system of systems(); track system.id) {
            <div class="system-chip">
              <span>{{ system.name }}</span>
              <div class="chip-actions">
                <button type="button" class="chip-btn" (click)="editSystem(system)">Edit</button>
                <button type="button" class="chip-btn danger-text" (click)="deleteSystem(system.id)">Delete</button>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .split { display: grid; grid-template-columns: 1.1fr 1fr; gap: 1rem; }
    .panel { padding: 1.5rem; border-radius: 1.4rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }
    .wide { grid-column: 1 / -1; }
    .eyebrow, span, small { color: #9fb6ca; }
    .editor-form, .stack, .system-form { display: grid; gap: 0.75rem; }
    .grid-two { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    input, textarea { width: 100%; padding: 0.85rem 1rem; border-radius: 0.9rem; border: 1px solid rgba(255,255,255,0.08); background: #0f1d2d; color: inherit; }
    textarea { min-height: 5rem; resize: vertical; }
    .toggle { display: flex; gap: 0.5rem; align-items: center; color: #d4e1ec; }
    .actions, .row-actions, .chip-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    button { padding: 0.85rem 1rem; border-radius: 999px; border: 0; background: #ffd08c; color: #08131f; font-weight: 700; cursor: pointer; }
    button.secondary { background: rgba(255,255,255,0.08); color: #f6fbff; }
    button.danger { background: #ff8f8f; color: #2e0f12; }
    .row-card { display: flex; justify-content: space-between; gap: 1rem; padding: 1rem; border-radius: 1rem; background: rgba(255,255,255,0.03); align-items: flex-start; }
    .row-card > div:first-child { display: grid; gap: 0.2rem; }
    .systems { display: flex; flex-wrap: wrap; gap: 0.75rem; }
    .system-chip { display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 0.8rem; border-radius: 999px; background: rgba(255,255,255,0.05); }
    .chip-btn { padding: 0; background: transparent; color: #f6fbff; }
    .danger-text { color: #ff9e9e; }
    @media (max-width: 960px) {
      .split { grid-template-columns: 1fr; }
      .grid-two, .row-card { grid-template-columns: 1fr; }
      .row-card { flex-direction: column; }
    }
  `]
})
export class AdminPageComponent {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  readonly weightCards = signal<WeightCard[]>([]);
  readonly systems = signal<SystemDefinition[]>([]);
  readonly sprints = signal<SprintSummary[]>([]);

  readonly editingSprintId = signal<number | null>(null);
  readonly editingWeightCardId = signal<number | null>(null);
  readonly editingSystemId = signal<number | null>(null);

  readonly sprintForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    label: ['', Validators.required],
    goal: [''],
    isActive: [true]
  });

  readonly weightCardForm = this.fb.nonNullable.group({
    weightValue: [1, Validators.required],
    timeScore: [0, Validators.required],
    timeLabel: ['', Validators.required],
    estimatedTime: ['', Validators.required],
    element: ['', Validators.required],
    line: ['', Validators.required]
  });

  readonly systemForm = this.fb.nonNullable.group({
    name: ['', Validators.required]
  });

  constructor() {
    this.reload();
  }

  saveSprint() {
    const value = this.sprintForm.getRawValue();
    const payload = {
      name: value.name,
      label: value.label,
      goal: value.goal.trim() || null,
      isActive: value.isActive
    };

    const sprintId = this.editingSprintId();
    const request = sprintId === null
      ? this.api.createSprint(payload)
      : this.api.updateSprint(sprintId, payload);

    request.subscribe(() => {
      this.cancelSprintEdit();
      this.reload();
    });
  }

  editSprint(sprint: SprintSummary) {
    this.editingSprintId.set(sprint.id);
    this.api.getSprint(sprint.id).subscribe((detail) => {
      this.sprintForm.setValue({
        name: detail.name,
        label: detail.label,
        goal: detail.goal ?? '',
        isActive: detail.isActive
      });
    });
  }

  toggleSprint(sprint: SprintSummary) {
    this.api.getSprint(sprint.id).subscribe((detail) => {
      this.api.updateSprint(sprint.id, {
        name: detail.name,
        label: detail.label,
        goal: detail.goal,
        isActive: !detail.isActive
      }).subscribe(() => this.reload());
    });
  }

  deleteSprint(id: number) {
    this.api.deleteSprint(id).subscribe(() => {
      if (this.editingSprintId() === id) {
        this.cancelSprintEdit();
      }
      this.reload();
    });
  }

  cancelSprintEdit() {
    this.editingSprintId.set(null);
    this.sprintForm.reset({ name: '', label: '', goal: '', isActive: true });
  }

  saveWeightCard() {
    const value = this.weightCardForm.getRawValue();
    this.api.saveWeightCard({
      id: this.editingWeightCardId(),
      weightValue: value.weightValue,
      timeScore: value.timeScore,
      timeLabel: value.timeLabel,
      estimatedTime: value.estimatedTime,
      element: value.element,
      line: value.line
    }).subscribe(() => {
      this.cancelWeightCardEdit();
      this.reload();
    });
  }

  editWeightCard(card: WeightCard) {
    this.editingWeightCardId.set(card.id);
    this.weightCardForm.setValue({
      weightValue: card.weightValue,
      timeScore: card.timeScore,
      timeLabel: card.timeLabel,
      estimatedTime: card.estimatedTime,
      element: card.element,
      line: card.line
    });
  }

  deleteWeightCard(id: number) {
    this.api.deleteWeightCard(id).subscribe(() => {
      if (this.editingWeightCardId() === id) {
        this.cancelWeightCardEdit();
      }
      this.reload();
    });
  }

  cancelWeightCardEdit() {
    this.editingWeightCardId.set(null);
    this.weightCardForm.reset({
      weightValue: 1,
      timeScore: 0,
      timeLabel: '',
      estimatedTime: '',
      element: '',
      line: ''
    });
  }

  saveSystem() {
    const value = this.systemForm.getRawValue();
    this.api.saveSystem({
      id: this.editingSystemId(),
      name: value.name
    }).subscribe(() => {
      this.cancelSystemEdit();
      this.reload();
    });
  }

  editSystem(system: SystemDefinition) {
    this.editingSystemId.set(system.id);
    this.systemForm.setValue({ name: system.name });
  }

  deleteSystem(id: number) {
    this.api.deleteSystem(id).subscribe(() => {
      if (this.editingSystemId() === id) {
        this.cancelSystemEdit();
      }
      this.reload();
    });
  }

  cancelSystemEdit() {
    this.editingSystemId.set(null);
    this.systemForm.reset({ name: '' });
  }

  private reload() {
    this.api.getWeightCards().subscribe((value) => this.weightCards.set(value));
    this.api.getSystems().subscribe((value) => this.systems.set(value));
    this.api.getSprints().subscribe((value) => this.sprints.set(value));
  }
}
