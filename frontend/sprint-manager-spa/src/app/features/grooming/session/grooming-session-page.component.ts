import { Component, ElementRef, ViewChild, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as THREE from 'three';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { GroomingStateService } from '../../../core/services/grooming-state.service';
import { CountdownComponent } from '../components/countdown/countdown.component';
import { TicketCardComponent } from '../components/ticket-card/ticket-card.component';
import { VoteRevealComponent } from '../components/vote-reveal/vote-reveal.component';
import { WeightCardComponent } from '../components/weight-card/weight-card.component';
import { Ticket, WeightCard } from '../../../shared/models/app.models';

@Component({
  selector: 'app-grooming-session-page',
  standalone: true,
  imports: [CountdownComponent, TicketCardComponent, VoteRevealComponent, WeightCardComponent],
  template: `
    <section class="stage">
      <canvas #canvas></canvas>
      <div class="content">
        <div class="left">
          @if (ticket(); as currentTicket) {
            <app-ticket-card [ticket]="currentTicket" [comments]="['Sprint review comment', 'Sizing check complete']" />
          }
        </div>
        <div class="right">
          <app-countdown [seconds]="groomingState.countdown()" />
          <div class="weight-grid">
            @for (card of weightCards(); track card.id) {
              <app-weight-card [card]="card" [selected]="selectedWeight() === card.weightValue" (picked)="vote(card.weightValue)" />
            }
          </div>
          <button class="reveal" (click)="reveal()">Reveal Votes</button>
          <app-vote-reveal [reveal]="groomingState.reveal()" />
        </div>
      </div>
    </section>
  `,
  styles: [`
    .stage { position: relative; min-height: 78vh; border-radius: 1.6rem; overflow: hidden; background: radial-gradient(circle at top, rgba(48,101,163,0.35), rgba(6,12,19,0.95)); }
    canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
    .content { position: relative; z-index: 1; display: grid; grid-template-columns: 1.2fr 1fr; gap: 1rem; padding: 1.5rem; }
    .left, .right { display: grid; gap: 1rem; }
    .weight-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 0.75rem; }
    .reveal { padding: 0.95rem 1rem; border-radius: 999px; border: 0; background: #ffd08c; color: #08131f; font-weight: 700; }
    @media (max-width: 960px) { .content { grid-template-columns: 1fr; } .weight-grid { grid-template-columns: 1fr; } }
  `]
})
export class GroomingSessionPageComponent {
  @ViewChild('canvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  readonly groomingState = inject(GroomingStateService);

  readonly weightCards = signal<WeightCard[]>([]);
  readonly ticket = signal<Ticket | null>(null);
  readonly selectedWeight = signal<number | null>(null);
  readonly sessionId = Number(this.route.snapshot.paramMap.get('sessionId'));

  constructor() {
    this.api.getWeightCards().subscribe((value) => this.weightCards.set(value));
    this.api.getSprints().subscribe((sprints) => {
      const active = sprints.find((sprint) => sprint.isActive) ?? sprints[0];
      if (active) {
        this.api.getSprint(active.id).subscribe((sprint) => this.ticket.set(sprint.tickets[0] ?? null));
      }
    });

    effect(() => {
      if (this.canvasRef) {
        this.startScene(this.canvasRef.nativeElement);
      }
    });

    const token = this.auth.token();
    const user = this.auth.user();
    if (token && user) {
      void this.groomingState.connect(token, this.sessionId, user.displayName);
    }
  }

  vote(weightValue: number) {
    this.selectedWeight.set(weightValue);
    const ticketId = this.ticket()?.id;
    if (ticketId) {
      void this.groomingState.submitVote(this.sessionId, ticketId, weightValue);
    }
  }

  reveal() {
    const ticketId = this.ticket()?.id;
    if (ticketId) {
      void this.groomingState.revealVotes(this.sessionId, ticketId);
    }
  }

  private startScene(canvas: HTMLCanvasElement) {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
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
      requestAnimationFrame(animate);
    };

    animate();
  }
}
