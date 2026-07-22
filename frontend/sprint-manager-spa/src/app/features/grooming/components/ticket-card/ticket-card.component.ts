import { Component, OnInit, computed, input, signal } from '@angular/core';
import { MarkdownPipe } from '../../../../shared/pipes/markdown.pipe';
import { Ticket } from '../../../../shared/models/app.models';
import { getTicketCardAssets } from '../card-asset-map';

@Component({
  selector: 'app-ticket-card',
  standalone: true,
  imports: [MarkdownPipe],
  template: `
    <div class="card-shell">
      <button
        type="button"
        class="card-flip-button"
        [attr.aria-label]="cardAriaLabel()"
        [attr.aria-pressed]="showingBack()"
        (click)="toggleCardFace()">
        <div class="card-frame">
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
                <div class="stat-copy">
                  <strong>{{ ticket().timeScore ?? '-' }}</strong>
                </div>
              </section>

              <section class="stat-box weight-box">
                <div class="stat-copy">
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
                <header class="comments-title-bar">Comments</header>
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
        </div>
      </button>

      <button type="button" class="ticket-view-button" aria-label="View ticket details" (click)="openDetails($event)">
        <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M12 4.5c4.63 0 8.45 3.02 9.75 7.2-1.3 4.18-5.12 7.2-9.75 7.2s-8.45-3.02-9.75-7.2C3.55 7.52 7.37 4.5 12 4.5zm0 1.5a5.7 5.7 0 1 0 0 11.4A5.7 5.7 0 0 0 12 6zm0 2.15a3.55 3.55 0 1 1 0 7.1a3.55 3.55 0 0 1 0-7.1z"/>
        </svg>
      </button>
    </div>

    @if (detailsOpen()) {
      <div class="ticket-modal-backdrop" (click)="closeDetails()">
        <section class="ticket-modal" role="dialog" aria-modal="true" aria-labelledby="ticket-details-title" (click)="$event.stopPropagation()">
          <header class="ticket-modal-header">
            <div>
              <p class="ticket-modal-eyebrow">Ticket details</p>
              <h2 id="ticket-details-title">{{ ticket().title }}</h2>
              <div class="ticket-labels">
                @for (label of ticket().labels; track label) {
                  <span>{{ label }}</span>
                } @empty {
                  <span class="ticket-empty">No labels</span>
                }
              </div>
            </div>
            <button type="button" class="ticket-modal-close" (click)="closeDetails()">Close</button>
          </header>

          <div class="ticket-modal-content">
            <section class="ticket-detail-section ticket-description">
              <h3>Description</h3>
              <div [innerHTML]="ticket().description | markdown"></div>
            </section>

            <section class="ticket-detail-section ticket-comments">
              <h3>Comments</h3>
              @if (comments().length) {
                <ul>
                  @for (comment of comments(); track comment) { <li>{{ comment }}</li> }
                </ul>
              } @else {
                <p class="ticket-empty">No comments captured for this ticket.</p>
              }
            </section>
          </div>
        </section>
      </div>
    }
  `,
  styles: [`
    :host {
      display: grid;
      justify-items: center;
    }

    .card-shell {
      --ticket-base-width: 21rem;
      --ticket-base-height: 34.5rem;
      --ticket-scale: 1.1;
      position: relative;
      display: block;
      width: calc(var(--ticket-base-width) * var(--ticket-scale));
      height: calc(var(--ticket-base-height) * var(--ticket-scale));
      max-width: 100%;
      min-height: 0;
      justify-self: center;
      color: inherit;
      text-align: left;
    }
    .card-flip-button {
      display: block;
      width: 100%;
      height: 100%;
      padding: 0;
      border: 0;
      background: transparent;
      cursor: pointer;
      perspective: 1800px;
      color: inherit;
      text-align: left;
    }
    .card-frame {
      width: var(--ticket-base-width);
      height: var(--ticket-base-height);
      transform: scale(var(--ticket-scale));
      transform-origin: top left;
    }
    .card-rotor {
      position: relative;
      width: var(--ticket-base-width);
      height: var(--ticket-base-height);
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
      width: 100%;
      height: 100%;
      z-index: 1;
      color: #f7f3ea;
    }
    .front-layout {
      display: grid;
      grid-template-columns: 4.2rem 1fr 4.7rem;
      grid-template-rows: 4.2rem 2.45rem 1.95rem 5.8rem 11.35rem 3.8rem 1.4rem;
      padding: 1rem 0.95rem 0.7rem;
    }
    .comment-badge {
      display: grid;
      place-items: center;
      color: #f7f3ea;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
    }
    .comment-badge {
      position: absolute;
      transform: translateY(22px) translateX(8px);
      width: 3.8rem;
      height: 3.8rem;
      font-size: 1.08rem;
      font-weight: 700;
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
    .message-medallion svg {
      width: 100%;
      height: 100%;
      fill: currentColor;
    }
    .title-bar,
    .system-bar,
    .back-ticket-bar,
    .comments-title-bar,
    .back-section-bar {
      display: flex;
      min-width: 0;
    }

    .system-bar {
      position: absolute;
      transform: translateY(100px) translateX(80px);
      font-size: 0.62rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .title-bar {
      position: absolute;
      transform: translateY(45px) translateX(65px);
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
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .labels-panel,
    .description-panel,
    .comments-panel {
      color: #2f2a25;
      overflow: hidden;
    }

    .description-copy {
      height: 100%;
      overflow: auto;
      padding-right: 0.35rem;
      color: #302a24;
      font-size: 0.8rem;
      line-height: 1.22;
      scrollbar-width: thin;
      scrollbar-color: #7b6347 rgba(88, 67, 44, 0.18);
    }
    .description-panel {
      position: absolute;
      transform: translateY(260px) translateX(50px);
      height: 175px;
      width: 230px;
      margin: 0 1.12rem 0 1rem;
      padding: 0.02rem 0.8rem 0.4rem 0.42rem;
    }
    .labels-panel {
      position: absolute;
      transform: translateY(160px) translateX(70px);
      display: flex;
      height: 100px;
      width: 200px;
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
      background: rgba(179, 162, 66, 0.9);
      color: #4b4035;
      font-size: 0.62rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .muted-chip { opacity: 0.8; }
    .description-copy :first-child { margin-top: 0; }
    .description-copy :last-child { margin-bottom: 0; }
    .ticket-view-button {
      position: absolute;
      top: 3%;
      right: 4%;
      z-index: 3;
      display: grid;
      place-items: center;
      width: 2.25rem;
      height: 2.25rem;
      padding: 0;
      border: 1px solid rgba(244, 239, 233, 0.56);
      border-radius: 999px;
      background: rgba(8, 20, 31, 0.88);
      color: #f4efe8;
      box-shadow: 0 0.35rem 0.85rem rgba(0, 0, 0, 0.3);
      cursor: pointer;
    }
    .ticket-view-button:hover,
    .ticket-view-button:focus-visible {
      background: #17334b;
      outline: 2px solid #d8b773;
      outline-offset: 2px;
    }
    .ticket-view-button svg {
      width: 1.2rem;
      height: 1.2rem;
      fill: currentColor;
    }
    .stat-box {
      position: absolute;
      top: 84%;
      width: 27%;
      height: 8%;
      display: grid;
      place-items: center;
      color: #ece6db;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
    }
    .time-box {
      left: 20%;
    }
    .weight-box {
      right: 20%;
    }
    .stat-copy {
      display: contents;
    }
    .stat-copy strong {
      font-size: 0.9rem;
      line-height: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .back-layout {
      position: relative;
      padding: 1.15rem 1rem 1.1rem;
    }
    .back-count {
      position: absolute;
      top: 7.4%;
      left: 7.6%;
      width: 3.8rem;
      height: 3.8rem;
      display: grid;
      place-items: center;
      color: #f7f3ea;
      font-size: 1rem;
      font-weight: 700;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
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
      font-size: 0.8rem;
      font-weight: 800;
      color: #f4efe8;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
    }
    .comments-panel {
      position: absolute;
      top: 58%;
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
      scrollbar-color: #7b6347 rgba(88, 67, 44, 0.18);
    }
    .description-copy::-webkit-scrollbar,
    .comments-panel ul::-webkit-scrollbar {
      width: 0.55rem;
      height: 0.55rem;
    }
    .description-copy::-webkit-scrollbar-track,
    .comments-panel ul::-webkit-scrollbar-track {
      background: rgba(88, 67, 44, 0.16);
      border-radius: 999px;
    }
    .description-copy::-webkit-scrollbar-thumb,
    .comments-panel ul::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #9d845f, #6f573d);
      border-radius: 999px;
      border: 1px solid rgba(226, 205, 170, 0.28);
    }
    .description-copy::-webkit-scrollbar-thumb:hover,
    .comments-panel ul::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, #af9470, #7a6045);
    }
    .comments-panel li + li { margin-top: 0.7rem; }
    .empty {
      margin: 0;
      color: #302a24;
      font-size: 0.92rem;
      line-height: 1.35;
    }
    .ticket-modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 50;
      display: grid;
      place-items: center;
      padding: 1.5rem;
      background: rgba(4, 9, 16, 0.78);
      backdrop-filter: blur(10px);
    }
    .ticket-modal {
      width: min(100%, 68rem);
      max-height: min(86vh, 54rem);
      overflow: auto;
      padding: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1.5rem;
      background: linear-gradient(180deg, rgba(18, 34, 51, 0.98), rgba(7, 14, 24, 0.98));
      color: #edf5fb;
      box-shadow: 0 1.5rem 4rem rgba(0, 0, 0, 0.5);
    }
    .ticket-modal-header {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .ticket-modal-eyebrow {
      margin: 0 0 0.35rem;
      color: #9fb6ca;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .ticket-modal h2,
    .ticket-modal h3 {
      margin: 0;
    }
    .ticket-modal h2 {
      max-width: 52rem;
      margin-bottom: 0.8rem;
      font-size: clamp(1.3rem, 3vw, 2rem);
      line-height: 1.15;
    }
    .ticket-modal-close {
      padding: 0.7rem 1rem;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 999px;
      background: #0f1d2d;
      color: inherit;
      cursor: pointer;
    }
    .ticket-modal-content {
      display: grid;
      grid-template-columns: minmax(0, 4fr) minmax(0, 1fr);
      gap: 6px;
    }
    .ticket-detail-section {
      padding: 1.1rem;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 1rem;
      background: rgba(255, 255, 255, 0.04);
    }
    .ticket-detail-section h3 {
      margin-bottom: 0.8rem;
      font-size: 0.95rem;
    }
    .ticket-description > div,
    .ticket-comments ul {
      max-height: 26rem;
      overflow: auto;
      color: #dbe7f1;
      line-height: 1.5;
    }
    .ticket-description > div > :first-child,
    .ticket-comments ul {
      margin-top: 0;
    }
    .ticket-description > div > :last-child,
    .ticket-comments ul {
      margin-bottom: 0;
    }
    .ticket-comments ul {
      padding-left: 1.2rem;
    }
    .ticket-comments li + li {
      margin-top: 0.8rem;
    }
    .ticket-labels {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .ticket-labels span {
      padding: 0.3rem 0.65rem;
      border-radius: 999px;
      background: rgba(179, 162, 66, 0.9);
      color: #352c23;
      font-size: 0.8rem;
      font-weight: 700;
    }
    .ticket-labels .ticket-empty,
    .ticket-empty {
      color: #9fb6ca;
      background: transparent;
      padding: 0;
      font-weight: 400;
    }
    @media (max-width: 960px) {
      .card-shell {
        --ticket-scale: 1;
      }
      .ticket-modal-content {
        grid-template-columns: 1fr;
      }
    }
    @media (min-width: 1400px) and (min-height: 860px) {
      .card-shell {
        --ticket-scale: 1.18;
      }
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
  readonly detailsOpen = signal(false);
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

  openDetails(event: Event) {
    event.stopPropagation();
    this.detailsOpen.set(true);
  }

  closeDetails() {
    this.detailsOpen.set(false);
  }
}
