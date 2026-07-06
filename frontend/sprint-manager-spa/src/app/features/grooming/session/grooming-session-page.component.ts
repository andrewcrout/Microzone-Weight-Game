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
              <button class="complete-link" type="button" (click)="goToSprintTickets()">
                Go to sprint tickets
              </button>
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

              @if (showWeightDeck()) {
                <div class="weight-deck-panel">
                  <div class="deck-stage" [class.ready]="deckReady()">
                    @for (card of weightCards(); track card.id; let index = $index) {
                      <div
                        class="deck-card"
                        [class.revealed-stack]="index < activeWeightCardIndex()"
                        [class.current-card]="index === activeWeightCardIndex()"
                        [class.next-card]="index === activeWeightCardIndex() + 1"
                        [class.face-down-stack]="index > activeWeightCardIndex()"
                        [style.transform]="weightCardTransform(index)"
                        [style.z-index]="weightCardZIndex(index)">
                        <app-weight-card
                          [card]="card"
                          [faceUp]="isFaceUpWeightCard(index)"
                          [clickable]="isWeightCardClickable(index)"
                          [selected]="selectedWeight() === card.weightValue"
                          (picked)="onWeightCardPicked(index)" />
                      </div>
                    }
                  </div>

                  <div class="deck-controls">
                    <div class="carousel-meta">
                      <span>{{ deckStatusLabel() }}</span>
                      <span>{{ selectedWeight() !== null ? 'Selected ' + selectedWeight() : 'No vote selected' }}</span>
                    </div>

                    @if (editingRevealedVote()) {
                      <button class="nav-button ghost" [disabled]="!canSubmitCurrentCard()" (click)="submitCurrentCard()">
                        Reconfirm card
                      </button>
                    }
                  </div>
                </div>
              }

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

              @if (showRevealResults()) {
                <app-vote-reveal
                  [reveal]="groomingState.reveal()"
                  [currentUserId]="currentUserId()"
                  (changeRequested)="beginVoteEdit()" />
              }
            } @else {
              <div class="complete-actions">
                <p class="instruction">Grooming is complete. Continue to the sprint tickets page to assign developers and manage the sprint backlog.</p>
                <button class="confirm" type="button" (click)="goToSprintTickets()">
                  Open sprint tickets
                </button>
              </div>
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
    .complete-state, .complete-actions { display: grid; gap: 1rem; align-content: start; }
    .weight-deck-panel { display: grid; gap: 1rem; }
    .deck-stage {
      position: relative;
      min-height: 24rem;
      border-radius: 1.5rem;
      overflow: hidden;
      background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
      border: 1px solid rgba(255,255,255,0.08);
      padding: 1rem;
    }
    .deck-card {
      position: absolute;
      top: 1.2rem;
      left: calc(50% - 7rem);
      width: 14rem;
      transform-origin: center bottom;
      transition: transform 900ms cubic-bezier(0.2, 0.8, 0.2, 1), filter 280ms ease;
    }
    .deck-card.revealed-stack { filter: saturate(0.9); }
    .deck-card.current-card { filter: drop-shadow(0 1rem 1.4rem rgba(0, 0, 0, 0.28)); }
    .deck-card.next-card { filter: drop-shadow(0 0.65rem 1.1rem rgba(0, 0, 0, 0.22)); }
    .deck-controls { display: grid; gap: 0.9rem; }
    .carousel-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
      color: #9fb6ca;
    }
    .actions { margin-top: 1rem; display: grid; gap: 0.75rem; }
    .actions-compact { display: none; margin-top: 1rem; }
    .actions-menu { display: grid; gap: 0.75rem; margin-top: 0.75rem; }
    button { padding: 0.95rem 1rem; border-radius: 999px; border: 0; font-weight: 700; cursor: pointer; }
    button:disabled { opacity: 0.45; cursor: not-allowed; }
    .reveal, .confirm { background: #ffd08c; color: #08131f; }
    .remove { background: rgba(255,255,255,0.08); color: #f4f7fb; }
    .ghost { background: rgba(255,255,255,0.08); color: #f4f7fb; }
    .complete-link { justify-self: start; background: #ffd08c; color: #08131f; }
    .nav-button { width: 100%; min-height: 3.5rem; font-size: 1rem; line-height: 1; }
    .actions-toggle { width: 100%; margin-top: 0; }
    .actions button, .actions-menu button { width: 100%; }
    @media (max-width: 1200px) {
      .actions { display: none; }
      .actions-compact { display: block; }
    }
    @media (max-width: 960px) {
      .content { grid-template-columns: 1fr; }
      .deck-stage { min-height: 21rem; }
      .deck-card { width: min(14rem, calc(100% - 2rem)); left: calc(50% - min(7rem, calc((100% - 2rem) / 2))); }
      .deck-controls { justify-content: center; }
      .nav-button { width: 100%; height: auto; }
      .carousel-meta { justify-content: center; text-align: center; }
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
  private deckTicketId?: number;

  readonly weightCards = signal<WeightCard[]>([]);
  readonly sprint = signal<SprintDetail | null>(null);
  readonly session = signal<GroomingSession | null>(null);
  readonly selectedWeight = signal<number | null>(null);
  readonly activeWeightCardIndex = signal(-1);
  readonly actionsMenuOpen = signal(false);
  readonly deckReady = signal(false);
  readonly editingRevealedVote = signal(false);
  readonly sessionId = Number(this.route.snapshot.paramMap.get('sessionId'));
  readonly currentUserId = computed(() => this.auth.user()?.id ?? null);
  readonly remainingTickets = computed(() => (this.sprint()?.tickets ?? []).filter((ticket) => ticket.groomingStatus === 'Pending'));
  readonly currentTicket = computed<Ticket | null>(() => this.remainingTickets()[0] ?? null);
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
  readonly currentUserRevealVote = computed(() => {
    const currentUserId = this.currentUserId();
    const reveal = this.groomingState.reveal();
    return reveal?.votes.find((vote) => vote.userId === currentUserId) ?? null;
  });
  readonly showWeightDeck = computed(() => !this.groomingState.reveal() || this.editingRevealedVote());
  readonly showRevealResults = computed(() => !!this.groomingState.reveal() && !this.editingRevealedVote());
  readonly deckStatusLabel = computed(() => {
    const totalCards = this.weightCards().length;
    const activeIndex = this.activeWeightCardIndex();
    if (totalCards === 0) {
      return 'No weight cards available';
    }

    if (activeIndex < 0) {
      return 'Pick the first face-down card to start the deck';
    }

    if (activeIndex >= totalCards - 1) {
      return `Deck complete: ${totalCards} of ${totalCards} cards revealed`;
    }

    return `${activeIndex + 1} of ${totalCards} cards revealed`;
  });

  constructor() {
    this.api.getWeightCards().subscribe((value) => {
      this.weightCards.set(value);
      this.resetWeightDeck();
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
      }
    });

    effect(() => {
      const ticketId = this.currentTicket()?.id;
      if (ticketId && ticketId !== this.deckTicketId) {
        this.deckTicketId = ticketId;
        this.resetWeightDeck();
      }
    });

    const token = this.auth.token();
    const user = this.auth.user();
    if (token && user) {
      void this.groomingState.connect(token, this.sessionId, user.displayName);
    }

    this.pollTimer = setInterval(() => this.loadSession(), 2000);
  }

  chooseWeight(weightValue: number) {
    this.selectedWeight.set(weightValue);

    if (this.editingRevealedVote()) {
      return;
    }

    const ticketId = this.currentTicket()?.id;
    if (ticketId) {
      void this.groomingState.submitVote(this.sessionId, ticketId, weightValue);
    }
  }

  onWeightCardPicked(index: number) {
    if (!this.isWeightCardClickable(index)) {
      return;
    }

    this.activeWeightCardIndex.set(index);

    const card = this.weightCards()[index];
    if (card) {
      this.chooseWeight(card.weightValue);
    }
  }

  nextWeightCard() {
    this.onWeightCardPicked(this.activeWeightCardIndex() + 1);
  }

  hasNextFaceDownWeightCard() {
    return this.activeWeightCardIndex() < this.weightCards().length - 1;
  }

  canSubmitCurrentCard() {
    return this.selectedWeight() !== null;
  }

  submitCurrentCard() {
    const ticketId = this.currentTicket()?.id;
    const selectedWeight = this.selectedWeight();
    const currentUserId = this.currentUserId();
    if (!ticketId || selectedWeight === null) {
      return;
    }

    void this.groomingState.submitVote(this.sessionId, ticketId, selectedWeight);

    if (this.editingRevealedVote() && currentUserId !== null) {
      this.groomingState.updateRevealedVote(currentUserId, selectedWeight);
      this.editingRevealedVote.set(false);
    }
  }

  isFaceUpWeightCard(index: number) {
    return index <= this.activeWeightCardIndex();
  }

  isWeightCardClickable(index: number) {
    return index >= 0 && index <= this.activeWeightCardIndex() + 1;
  }

  weightCardTransform(index: number) {
    const activeIndex = this.activeWeightCardIndex();

    if (!this.deckReady()) {
      return 'translate3d(0, 1.5rem, 0) rotateZ(0deg) scale(0.92)';
    }

    if (activeIndex < 0) {
      const distanceFromFront = index;
      return `translate3d(${distanceFromFront * 1.2}rem, ${distanceFromFront * 0.35}rem, 0) rotateZ(${distanceFromFront * 3 - 6}deg) scale(${Math.max(0.8, 1 - distanceFromFront * 0.04)})`;
    }

    if (index < activeIndex) {
      const offset = activeIndex - index;
      return `translate3d(${-11.2 - offset * 1.85}rem, ${offset * 0.55}rem, 0) rotateZ(${-10 - offset * 3}deg) scale(${Math.max(0.72, 0.9 - offset * 0.05)})`;
    }

    if (index === activeIndex) {
      return 'translate3d(0rem, -0.55rem, 0) rotateZ(0deg) scale(1)';
    }

    const offset = index - activeIndex - 1;
    return `translate3d(${9.2 + offset * 2.05}rem, ${offset * 0.55}rem, 0) rotateZ(${10 + offset * 3}deg) scale(${Math.max(0.76, 0.96 - offset * 0.04)})`;
  }

  weightCardZIndex(index: number) {
    if (index === this.activeWeightCardIndex()) {
      return this.weightCards().length + 10;
    }

    if (index < this.activeWeightCardIndex()) {
      return this.weightCards().length - (this.activeWeightCardIndex() - index);
    }

    return this.weightCards().length - index;
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
      this.editingRevealedVote.set(false);
      void this.groomingState.revealVotes(this.sessionId, ticketId);
    }
  }

  beginVoteEdit() {
    const currentVote = this.currentUserRevealVote();
    if (!currentVote) {
      return;
    }

    this.selectedWeight.set(currentVote.weightValue);
    this.activeWeightCardIndex.set(this.weightCards().findIndex((card) => card.weightValue === currentVote.weightValue));
    this.editingRevealedVote.set(true);
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

  goToSprintTickets() {
    const sprintId = this.session()?.sprintId ?? this.sprint()?.id;
    if (sprintId) {
      void this.router.navigate(['/sprints', sprintId, 'tickets']);
    }
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

  private resetWeightDeck() {
    this.activeWeightCardIndex.set(-1);
    this.selectedWeight.set(null);
    this.deckReady.set(false);
    this.editingRevealedVote.set(false);

    // TODO: Keep face/position state here so Three.js can replace the CSS deck transforms later.
    requestAnimationFrame(() => this.deckReady.set(true));
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
