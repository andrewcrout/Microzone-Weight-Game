import { Component, OnInit, computed, input, signal } from '@angular/core';
import { MarkdownPipe } from '../../../../shared/pipes/markdown.pipe';
import { Ticket } from '../../../../shared/models/app.models';
import { getTicketCardAssets } from '../card-asset-map';

@Component({
  selector: 'app-ticket-card',
  standalone: true,
  imports: [MarkdownPipe],
  template: `
    <button
      type="button"
      class="card-shell"
      [attr.aria-label]="cardAriaLabel()"
      [attr.aria-pressed]="showingBack()"
      (click)="toggleCardFace()">
      <div class="card-rotor" [style.transform]="'rotateY(' + rotationDegrees() + 'deg)'">
        <section class="face front">
          @if (!frontArtMissing()) {
            <img class="art" [src]="ticketAssets.front" alt="" (error)="frontArtMissing.set(true)" />
          }

          <div class="overlay"></div>
          <div class="front-layout">
            <div class="comment-badge">{{ comments().length }}</div>

            <div class="comment-flag" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v7A2.5 2.5 0 0 1 17.5 15H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 12.5z"/>
              </svg>
            </div>

            <header class="title-bar">
              <h3>{{ ticket().title }}</h3>
            </header>

            <div class="system-bar">{{ ticket().systemName }}</div>

            <section class="labels-panel">
              @for (label of ticket().labels; track label) {
                <span>{{ label }}</span>
              } @empty {
                <span class="muted-chip">No labels</span>
              }
            </section>

            <section class="description-panel">
              <div class="description-copy" [innerHTML]="ticket().description | markdown"></div>
            </section>

            <section class="stat-box time-box">
              <div class="stat-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M12 6.25a.75.75 0 0 1 .75.75v4.19l2.78 1.6a.75.75 0 1 1-.75 1.3l-3.15-1.82A.75.75 0 0 1 11.25 12V7a.75.75 0 0 1 .75-.75z"/>
                  <path d="M12 2.5a9.5 9.5 0 1 1 0 19a9.5 9.5 0 0 1 0-19zm0 1.5a8 8 0 1 0 0 16a8 8 0 0 0 0-16z"/>
                </svg>
              </div>
              <div class="stat-copy">
                <span class="stat-label">Time</span>
                <strong>{{ ticket().timeScore ?? '-' }}</strong>
              </div>
            </section>

            <section class="stat-box weight-box">
              <div class="stat-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M12 4a3.25 3.25 0 0 0-3.25 3.25c0 .57.15 1.1.4 1.56H7.5a2 2 0 0 0-1.95 1.56L4.03 17.3A2 2 0 0 0 5.98 19.75h12.04a2 2 0 0 0 1.95-2.45l-1.52-6.93A2 2 0 0 0 16.5 8.8h-1.65c.25-.46.4-.99.4-1.56A3.25 3.25 0 0 0 12 4zm0 1.5a1.75 1.75 0 1 1 0 3.5a1.75 1.75 0 0 1 0-3.5z"/>
                </svg>
              </div>
              <div class="stat-copy">
                <span class="stat-label">Weight</span>
                <strong>{{ ticket().weightValue ?? '-' }}</strong>
              </div>
            </section>
          </div>
        </section>

        <section class="face back">
          @if (!backArtMissing()) {
            <img class="art" [src]="ticketAssets.back" alt="" (error)="backArtMissing.set(true)" />
          }

          <div class="overlay comments-overlay"></div>
          <div class="back-layout">
            <div class="back-count">{{ comments().length }}</div>

            <header class="back-ticket-bar">
              <span class="back-ticket-title">{{ ticket().title }}</span>
            </header>

            <div class="back-section-bar">
              <div class="message-medallion" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v7A2.5 2.5 0 0 1 17.5 15H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 12.5z"/>
                </svg>
              </div>

              <header class="comments-title-bar">COMMENTS</header>
            </div>

            <section class="comments-panel">
              @if (comments().length) {
                <ul>
                  @for (comment of comments(); track comment) { <li>{{ comment }}</li> }
                </ul>
              } @else {
                <p class="empty">No comments captured for this ticket.</p>
              }
            </section>
          </div>
        </section>
      </div>
    </button>
  `,
  styles: [`
    :host { display: grid; }
    .card-shell {
      width: min(100%, 21rem);
      min-height: 34.5rem;
      aspect-ratio: 5 / 7;
      padding: 0;
      border: 0;
      background: transparent;
      cursor: pointer;
      justify-self: center;
      perspective: 1800px;
      color: inherit;
      text-align: left;
    }
    .card-rotor {
      position: relative;
      width: 100%;
      height: 100%;
      transition: transform 1.15s cubic-bezier(0.2, 0.8, 0.2, 1);
      transform-style: preserve-3d;
    }
    .face {
      position: absolute;
      inset: 0;
      display: grid;
      border-radius: 1.45rem;
      overflow: hidden;
      backface-visibility: hidden;
      box-shadow: 0 1.2rem 2.8rem rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255,255,255,0.14);
      background:
        linear-gradient(180deg, rgba(12, 21, 34, 0.96), rgba(7, 11, 18, 0.92));
    }
    .back { transform: rotateY(180deg); }
    .art {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(4, 10, 17, 0.02) 0%, rgba(4, 10, 17, 0.14) 100%);
    }
    .comments-overlay {
      background: linear-gradient(180deg, rgba(7, 12, 20, 0.04) 0%, rgba(7, 12, 20, 0.16) 100%);
    }
    .front-layout,
    .back-layout {
      position: relative;
      z-index: 1;
      height: 100%;
      color: #f7f3ea;
    }
    .front-layout {
      display: grid;
      grid-template-columns: 4.2rem 1fr 4.7rem;
      grid-template-rows: 4.2rem 2.45rem 1.95rem 5.8rem 11.35rem 3.8rem 1.4rem;
      padding: 1rem 0.95rem 0.7rem;
    }
    .comment-badge,
    .back-count {
      display: grid;
      place-items: center;
      width: 3.8rem;
      height: 3.8rem;
      border-radius: 999px;
      color: #f7f3ea;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
    }
    
    .comment-badge {
      position: absolute;
      transform: translatey(22px) translatex(8px);
      font-size: 1.08rem;
      font-weight: 700;
      padding-right: 0.12rem;
      padding-bottom: 0.08rem;
    }

    .comment-flag {
      grid-column: 1;
      grid-row: 2;
      width: 1.1rem;
      height: 1.1rem;
      justify-self: start;
      align-self: center;
      margin-left: 0.74rem;
      color: rgba(247, 243, 234, 0.92);
    }
    .comment-flag svg,
    .message-medallion svg,
    .stat-icon svg {
      width: 100%;
      height: 100%;
      fill: currentColor;
    }
    .title-bar,
    .system-bar,
    .back-ticket-bar,
    .comments-title-bar {
      display: flex;
      min-width: 0;
    }

    .system-bar {
      position: absolute;
      transform: translatey(100px) translatex(80px);
      font-size: 0.62rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #fff;
      text-shadow: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .title-bar {
      position: absolute;
      transform: translatey(45px) translatex(65px);
      width: 210px;
      height: 40px;
      color: #f6f0e7;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
    }
    .title-bar h3 {
      margin: 0 0 0 0.86rem;
      width: 100%;
      font-size: 0.94rem;
      line-height: 1.08;
      white-space: wrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }


    
    .labels-panel,
    .description-panel,
    .comments-panel {
      color: #2f2a25;
      overflow: hidden;
    }
    .labels-panel {
      grid-column: 1 / -1;
      grid-row: 4;
      margin: 0 1.1rem 0.1rem 1rem;
      padding: 0.2rem 0.8rem 0.15rem 0.34rem;
      display: flex;
      gap: 0.35rem;
      flex-wrap: wrap;
      align-content: start;
    }
    .labels-panel span {
      display: inline-flex;
      align-items: center;
      max-width: 100%;
      min-height: 1.35rem;
      padding: 0.08rem 0.48rem;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.9);
      color: #4b4035;
      font-size: 0.62rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .muted-chip { opacity: 0.8; }
    .description-panel {
      grid-column: 1 / -1;
      grid-row: 5;
      margin: 0 1.12rem 0 1rem;
      padding: 0.02rem 0.8rem 0.4rem 0.42rem;
    }
    .description-copy {
      height: 100%;
      overflow: auto;
      padding-right: 0.35rem;
      color: #302a24;
      font-size: 0.8rem;
      line-height: 1.22;
      scrollbar-width: thin;
    }
    .description-copy :first-child { margin-top: 0; }
    .description-copy :last-child { margin-bottom: 0; }
    .stat-box {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      min-width: 0;
      color: #ece6db;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
    }
    .time-box {
      grid-column: 1 / 2;
      grid-row: 6;
      align-self: start;
      margin: -0.7rem 0 0 0.22rem;
      padding-right: 0.2rem;
    }
    .weight-box {
      grid-column: 3 / 4;
      grid-row: 6;
      align-self: start;
      justify-self: end;
      margin: -0.7rem 0.35rem 0 0;
      padding-left: 0.1rem;
    }
    .stat-icon {
      width: 1.1rem;
      height: 1.1rem;
      color: #d9cfbd;
      flex: 0 0 auto;
    }
    .stat-copy {
      display: grid;
      min-width: 0;
      gap: 0.08rem;
    }
    .stat-copy strong {
      font-size: 0.7rem;
      line-height: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .stat-label { display: none; }
    .back-layout {
      position: relative;
      padding: 1.15rem 1rem 1.1rem;
    }
    .back-count {
      position: absolute;
      top: 7.4%;
      left: 7.6%;
      font-size: 1rem;
      font-weight: 700;
      padding-right: 0.08rem;
      padding-bottom: 0.08rem;
    }
    .back-ticket-bar {
      position: absolute;
      top: 11.1%;
      left: 14%;
      right: 11%;
      color: #f4efe8;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
    }
    .back-ticket-title {
      font-size: 0.9rem;
      font-weight: 700;
      line-height: 1.08;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .back-section-bar {
      position: absolute;
      top: 34.5%;
      left: 10.2%;
      right: 10.2%;
      height: 6.2%;
    }
    .message-medallion {
      position: absolute;
      left: 5.8%;
      top: 50%;
      transform: translateY(-50%);
      width: 1rem;
      height: 1rem;
      color: rgba(244, 239, 233, 0.92);
    }
    .comments-title-bar {
      position: absolute;
      left: 12.8%;
      right: 10%;
      top: 50%;
      transform: translateY(-50%);
      padding: 0;
      font-size: 0.8rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #f4efe8;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
    }
    .comments-panel {
      position: absolute;
      top: 43.5%;
      left: 10.5%;
      right: 10.5%;
      bottom: 12.2%;
      margin: 0;
      padding: 0.8rem 0.85rem 0.8rem;
    }
    .comments-panel ul {
      height: 100%;
      margin: 0;
      padding-left: 1.05rem;
      overflow: auto;
      color: #302a24;
      line-height: 1.35;
      scrollbar-width: thin;
    }
    .comments-panel li + li { margin-top: 0.7rem; }
    .empty {
      margin: 0;
      color: #302a24;
      font-size: 0.92rem;
      line-height: 1.35;
    }
    @media (max-width: 960px) {
      .card-shell { width: 100%; max-width: 21rem; min-height: 32rem; }
    }
  `]
})
export class TicketCardComponent implements OnInit {
  readonly ticket = input.required<Ticket>();
  readonly comments = input<string[]>([]);
  readonly showingBack = signal(false);
  readonly rotationDegrees = signal(0);
  readonly ticketAssets = getTicketCardAssets();
  readonly frontArtMissing = signal(!this.ticketAssets.front);
  readonly backArtMissing = signal(!this.ticketAssets.back);
  readonly cardAriaLabel = computed(() =>
    this.showingBack() ? `Hide comments for ${this.ticket().title}` : `Show comments for ${this.ticket().title}`
  );

  ngOnInit() {
    requestAnimationFrame(() => this.rotationDegrees.set(720));
  }

  toggleCardFace() {
    this.showingBack.update((value) => !value);
    this.rotationDegrees.update((value) => value + 180);
  }
}
