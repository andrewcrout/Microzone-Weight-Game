import { Component, ElementRef, OnDestroy, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as THREE from 'three';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { GroomingStateService } from '../../../core/services/grooming-state.service';
import { CountdownComponent } from '../components/countdown/countdown.component';
import { TicketCardComponent } from '../components/ticket-card/ticket-card.component';
import { VoteRevealComponent } from '../components/vote-reveal/vote-reveal.component';
import { WeightCardComponent } from '../components/weight-card/weight-card.component';
import { GroomingSession, SprintDetail, Ticket, WeightCard } from '../../../shared/models/app.models';

@Component({
  selector: 'app-grooming-session-page',
  standalone: true,
  imports: [CountdownComponent, TicketCardComponent, VoteRevealComponent, WeightCardComponent],
  template: `
    <section class="stage">
      <canvas #canvas></canvas>
      <div class="content">
        <div class="left">
          @if (currentTicket(); as ticket) {
            <div class="round-meta">
              <div>
                <p class="eyebrow">Ticket {{ roundLabel() }}</p>
                <h2>{{ sprint()?.name }}</h2>
              </div>
              <span>{{ remainingTickets().length }} remaining</span>
            </div>

            <app-ticket-card [ticket]="ticket" [comments]="ticket.comments" />
          } @else {
            <section class="complete-state">
              <p class="eyebrow">Grooming Complete</p>
              <h2>{{ sprint()?.name }}</h2>
              <p>All sprint tickets have been reviewed for this session.</p>
            </section>
          }
        </div>
        <div class="right">
          <section class="session-panel">
            <div class="session-header">
              <div>
                <p class="eyebrow">Grooming Session</p>
                <h3>{{ session()?.status === 'Completed' ? 'Finished' : 'Voting round' }}</h3>
              </div>
              <app-countdown [seconds]="groomingState.countdown()" />
            </div>

            @if (currentTicket()) {
              <p class="instruction">Choose a weight card. The admin reveals the room, then confirms the most common weight or marks the ticket for removal.</p>

              <div class="weight-carousel">
                <button class="nav-button ghost" [disabled]="weightCards().length <= 1" (click)="previousWeightCard()">&lt;</button>

                <div class="card-frame">
                  @if (activeWeightCard(); as card) {
                    <app-weight-card [card]="card" [selected]="selectedWeight() === card.weightValue" (picked)="vote(card.weightValue)" />
                  }

                  <div class="carousel-meta">
                    <span>{{ activeWeightCardIndex() + 1 }} / {{ weightCards().length }}</span>
                  </div>
                </div>

                <button class="nav-button ghost" [disabled]="weightCards().length <= 1" (click)="nextWeightCard()">&gt;</button>
              </div>

              <div class="actions">
                @if (auth.isAdmin()) {
                  <button class="reveal" (click)="reveal()">Reveal choices</button>
                  <button class="confirm" [disabled]="!canConfirm()" (click)="confirmAndContinue()">Confirm & Continue</button>
                  <button class="remove" (click)="markToBeRemoved()">Mark to be Removed</button>
                }
              </div>

              @if (auth.isAdmin()) {
                <div class="actions-compact">
                  <button class="ghost actions-toggle" type="button" (click)="toggleActionsMenu()">
                    {{ actionsMenuOpen() ? 'Close actions' : 'Actions' }}
                  </button>
                  @if (actionsMenuOpen()) {
                    <div class="actions-menu">
                      <button class="reveal" (click)="reveal(); closeActionsMenu()">Reveal choices</button>
                      <button class="confirm" [disabled]="!canConfirm()" (click)="confirmAndContinue(); closeActionsMenu()">Confirm & Continue</button>
                      <button class="remove" (click)="markToBeRemoved(); closeActionsMenu()">Mark to be Removed</button>
                    </div>
                  }
                </div>
              }

              <app-vote-reveal [reveal]="groomingState.reveal()" />
            }
          </section>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .stage { position: relative; min-height: 78vh; border-radius: 1.6rem; overflow: hidden; background: radial-gradient(circle at top, rgba(48,101,163,0.35), rgba(6,12,19,0.95)); }
    canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
    .content { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0, 1fr) 22rem; gap: 1rem; padding: 1.5rem; }
    .left, .right { display: grid; gap: 1rem; }
    .round-meta, .session-header { display: flex; justify-content: space-between; align-items: center; gap: 0.8rem; flex-wrap: wrap; }
    .round-meta span, .eyebrow, .instruction { color: #9fb6ca; }
    .session-panel, .complete-state { padding: 1.25rem; border-radius: 1.4rem; background: rgba(5, 12, 22, 0.56); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(18px); }
    .weight-carousel { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 0.75rem; align-items: center; }
    .card-frame { display: grid; gap: 0.75rem; }
    .carousel-meta { display: flex; justify-content: center; align-items: center; gap: 0.75rem; color: #9fb6ca; }
    .actions { margin-top: 1rem; display: grid; gap: 0.75rem; }
    .actions-compact { display: none; margin-top: 1rem; }
    .actions-menu { display: grid; gap: 0.75rem; margin-top: 0.75rem; }
    button { padding: 0.95rem 1rem; border-radius: 999px; border: 0; font-weight: 700; cursor: pointer; }
    button:disabled { opacity: 0.45; cursor: not-allowed; }
    .reveal, .confirm { background: #ffd08c; color: #08131f; }
    .remove { background: rgba(255,255,255,0.08); color: #f4f7fb; }
    .ghost { background: rgba(255,255,255,0.08); color: #f4f7fb; }
    .nav-button { width: 3.5rem; height: 3.5rem; padding: 0; font-size: 1.8rem; line-height: 1; }
    .actions-toggle { width: 100%; margin-top: 0; }
    .actions button, .actions-menu button { width: 100%; }
    @media (max-width: 1200px) {
      .actions { display: none; }
      .actions-compact { display: block; }
    }
    @media (max-width: 960px) {
      .content { grid-template-columns: 1fr; }
      .weight-carousel { grid-template-columns: 1fr; }
      .nav-button { width: 100%; height: auto; }
      .carousel-meta { justify-content: center; }
    }
  `]
})
export class GroomingSessionPageComponent implements OnDestroy {
  @ViewChild('canvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);
  readonly groomingState = inject(GroomingStateService);
  private renderer?: THREE.WebGLRenderer;
  private animationFrameId?: number;
  private sceneStarted = false;
  private pollTimer?: ReturnType<typeof setInterval>;

  readonly weightCards = signal<WeightCard[]>([]);
  readonly sprint = signal<SprintDetail | null>(null);
  readonly session = signal<GroomingSession | null>(null);
  readonly selectedWeight = signal<number | null>(null);
  readonly activeWeightCardIndex = signal(0);
  readonly actionsMenuOpen = signal(false);
  readonly sessionId = Number(this.route.snapshot.paramMap.get('sessionId'));
  readonly remainingTickets = computed(() => (this.sprint()?.tickets ?? []).filter((ticket) => ticket.groomingStatus === 'Pending'));
  readonly currentTicket = computed<Ticket | null>(() => this.remainingTickets()[0] ?? null);
  readonly activeWeightCard = computed<WeightCard | null>(() => this.weightCards()[this.activeWeightCardIndex()] ?? null);
  readonly roundLabel = computed(() => {
    const session = this.session();
    const total = this.sprint()?.tickets.length ?? 0;
    if (!session || total === 0) {
      return '0 of 0';
    }

    return `${Math.min(session.currentTicketIndex + 1, total)} of ${total}`;
  });
  readonly canConfirm = computed(() => {
    const reveal = this.groomingState.reveal();
    return !!reveal && (!!reveal.majorityWeight || this.selectedWeight() !== null);
  });

  constructor() {
    this.api.getWeightCards().subscribe((value) => {
      this.weightCards.set(value);
      this.activeWeightCardIndex.set(0);
    });
    this.loadSession();

    effect(() => {
      if (this.canvasRef && !this.sceneStarted) {
        this.sceneStarted = true;
        this.startScene(this.canvasRef.nativeElement);
      }
    });

    effect(() => {
      const session = this.groomingState.session();
      if (session?.id === this.sessionId) {
        this.session.set(session);
        this.loadSprint(session.sprintId);

        if (session.status === 'Completed') {
          void this.router.navigate(['/sprints', session.sprintId, 'tickets']);
        }
      }
    });

    const token = this.auth.token();
    const user = this.auth.user();
    if (token && user) {
      void this.groomingState.connect(token, this.sessionId, user.displayName);
    }

    this.pollTimer = setInterval(() => this.loadSession(), 2000);
  }

  vote(weightValue: number) {
    this.selectedWeight.set(weightValue);
    const cardIndex = this.weightCards().findIndex((card) => card.weightValue === weightValue);
    if (cardIndex >= 0) {
      this.activeWeightCardIndex.set(cardIndex);
    }

    const ticketId = this.currentTicket()?.id;
    if (ticketId) {
      void this.groomingState.submitVote(this.sessionId, ticketId, weightValue);
    }
  }

  previousWeightCard() {
    const count = this.weightCards().length;
    if (count === 0) {
      return;
    }

    this.activeWeightCardIndex.set((this.activeWeightCardIndex() - 1 + count) % count);
  }

  nextWeightCard() {
    const count = this.weightCards().length;
    if (count === 0) {
      return;
    }

    this.activeWeightCardIndex.set((this.activeWeightCardIndex() + 1) % count);
  }

  toggleActionsMenu() {
    this.actionsMenuOpen.set(!this.actionsMenuOpen());
  }

  closeActionsMenu() {
    this.actionsMenuOpen.set(false);
  }

  reveal() {
    const ticketId = this.currentTicket()?.id;
    if (ticketId) {
      void this.groomingState.revealVotes(this.sessionId, ticketId);
    }
  }

  confirmAndContinue() {
    const ticketId = this.currentTicket()?.id;
    const reveal = this.groomingState.reveal();
    const finalWeight = reveal?.majorityWeight ?? this.selectedWeight();

    if (!ticketId || finalWeight === null) {
      return;
    }

    this.selectedWeight.set(null);
    this.groomingState.clearReveal();
    this.closeActionsMenu();
    this.api.advanceGroomingTicket(this.sessionId, ticketId, finalWeight).subscribe(() => this.loadSession());
  }

  markToBeRemoved() {
    const ticketId = this.currentTicket()?.id;
    if (!ticketId) {
      return;
    }

    this.selectedWeight.set(null);
    this.groomingState.clearReveal();
    this.closeActionsMenu();
    this.api.removeTicketFromGrooming(this.sessionId, ticketId).subscribe(() => this.loadSession());
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }

    this.renderer?.dispose();
  }

  private loadSession() {
    this.api.getGroomingSession(this.sessionId).subscribe({
      next: (session) => {
        this.session.set(session);
        this.groomingState.setSession(session);
        this.loadSprint(session.sprintId);
      },
      error: () => this.recoverMissingSession()
    });
  }

  private recoverMissingSession() {
    this.api.getDashboard().subscribe({
      next: (dashboard) => {
        const activeSessionId = dashboard.activeGroomingSessionId;
        if (activeSessionId && activeSessionId !== this.sessionId) {
          void this.router.navigate(['/grooming', activeSessionId, 'session']);
          return;
        }

        if (this.pollTimer) {
          clearInterval(this.pollTimer);
          this.pollTimer = undefined;
        }
      },
      error: () => {
        if (this.pollTimer) {
          clearInterval(this.pollTimer);
          this.pollTimer = undefined;
        }
      }
    });
  }

  private loadSprint(sprintId: number) {
    this.api.getSprint(sprintId).subscribe((sprint) => this.sprint.set(sprint));
  }

  private startScene(canvas: HTMLCanvasElement) {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer = renderer;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / Math.max(canvas.clientHeight, 1), 0.1, 100);
    camera.position.z = 7;

    const geometry = new THREE.IcosahedronGeometry(1.2, 0);
    const material = new THREE.MeshBasicMaterial({ color: 0xffb347, wireframe: true });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    renderer.setSize(canvas.clientWidth || 800, canvas.clientHeight || 500, false);

    const animate = () => {
      mesh.rotation.x += 0.003;
      mesh.rotation.y += 0.005;
      renderer.render(scene, camera);
      this.animationFrameId = requestAnimationFrame(animate);
    };

    animate();
  }
}
