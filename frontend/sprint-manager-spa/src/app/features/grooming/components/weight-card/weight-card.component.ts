import { Component, computed, input, output, signal } from '@angular/core';
import { WeightCard } from '../../../../shared/models/app.models';
import { getWeightCardAssets } from '../card-asset-map';

@Component({
  selector: 'app-weight-card',
  standalone: true,
  template: `
    <button
      type="button"
      class="weight-card"
      [class.face-up]="faceUp()"
      [class.selected]="selected()"
      [class.clickable]="clickable()"
      [disabled]="!clickable()"
      [attr.aria-label]="ariaLabel()"
      (click)="picked.emit(card().weightValue)">
      <div class="card-rotor">
        <section class="face card-back">
          @if (!backArtMissing()) {
            <img class="art" [src]="assetSet().back" alt="" (error)="backArtMissing.set(true)" />
          }

          <div class="back-overlay"></div>
          <div class="back-copy">
            <strong class="corner-value">{{ card().weightValue }}</strong>
            <span class="top-bar-label">Weight Deck</span>
            <div class="center-panel-copy">
              <h4>{{ card().timeLabel }}</h4>
              <p>{{ card().estimatedTime }}</p>
              <small>{{ card().element }} · {{ card().line }}</small>
            </div>
          </div>
        </section>

        <section class="face card-front">
          @if (!frontArtMissing()) {
            <img class="art" [src]="assetSet().front" alt="" (error)="frontArtMissing.set(true)" />
          }

          <div class="front-overlay"></div>
          <div class="front-copy">
            <strong>{{ card().weightValue }}</strong>
            <h4>{{ card().timeLabel }}</h4>
            <p>{{ card().estimatedTime }}</p>
            <small>{{ card().element }} · {{ card().line }}</small>
          </div>
        </section>
      </div>
    </button>
  `,
  styles: [`
    :host {
      display: block;
      width: 14rem;
      max-width: 100%;
    }
    .weight-card {
      display: block;
      width: 100%;
      aspect-ratio: 5 / 7;
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      text-align: left;
      perspective: 1600px;
      transition: transform 220ms ease, filter 220ms ease;
    }
    .weight-card.clickable { cursor: pointer; }
    .weight-card:disabled { cursor: default; opacity: 1; }
    .weight-card.clickable:hover { transform: translateY(-4px); }
    .card-rotor {
      position: relative;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
      transition: transform 900ms cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    .weight-card.face-up .card-rotor { transform: rotateY(180deg); }
    .face {
      position: absolute;
      inset: 0;
      overflow: hidden;
      border-radius: 1.3rem;
      backface-visibility: hidden;
      border: 1px solid rgba(255,255,255,0.14);
      box-shadow: 0 1rem 2.4rem rgba(0, 0, 0, 0.32);
      background: linear-gradient(180deg, rgba(12, 21, 34, 0.95), rgba(7, 11, 18, 0.92));
    }
    .card-front { transform: rotateY(180deg); }
    .art {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .front-overlay, .back-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(7, 13, 23, 0.16) 0%, rgba(7, 13, 23, 0.74) 52%, rgba(7, 13, 23, 0.96) 100%);
    }
    .back-overlay {
      background: linear-gradient(180deg, rgba(7, 13, 23, 0.1) 0%, rgba(7, 13, 23, 0.62) 44%, rgba(7, 13, 23, 0.92) 100%);
    }
    .front-copy, .back-copy {
      position: relative;
      z-index: 1;
      color: #f5fbff;
    }
    .front-copy {
      display: grid;
      height: 100%;
      align-content: end;
      gap: 0.35rem;
      padding: 1rem 1rem 1.1rem;
    }
    .back-copy {
      height: 100%;
    }
    .corner-value {
      position: absolute;
      top: 8.4%;
      left: 9.4%;
      width: 2rem;
      text-align: center;
      color: #f5fbff;
      line-height: 1;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.38);
    }
    .top-bar-label {
      position: absolute;
      top: 13.2%;
      left: 18%;
      right: 11%;
      display: flex;
      align-items: center;
      color: #f5fbff;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
      white-space: nowrap;
    }
    .center-panel-copy {
      position: absolute;
      left: 11%;
      right: 11%;
      top: 51.5%;
      bottom: 11%;
      display: grid;
      align-content: start;
      gap: 0.3rem;
      color: #eef5fb;
      text-align: left;
    }
    .center-panel-copy h4 {
      font-size: 0.92rem;
      font-weight: 700;
    }
    .center-panel-copy p {
      font-size: 0.78rem;
      color: #dde8f2;
    }
    .center-panel-copy small {
      font-size: 0.72rem;
      line-height: 1.25;
      color: #cddaea;
    }
    .selected .face { box-shadow: 0 0 0 2px rgba(255, 208, 140, 0.8), 0 1rem 2.4rem rgba(0, 0, 0, 0.32); }
    .front-copy strong { font-size: 2rem; line-height: 1; }
    .corner-value { font-size: 1.15rem; }
    h4, p, small { margin: 0; }
    small { color: #d0deea; }
  `]
})
export class WeightCardComponent {
  readonly card = input.required<WeightCard>();
  readonly selected = input(false);
  readonly faceUp = input(false);
  readonly clickable = input(true);
  readonly picked = output<number>();
  readonly assetSet = computed(() => getWeightCardAssets(this.card()));
  readonly frontArtMissing = signal(false);
  readonly backArtMissing = signal(false);
  readonly ariaLabel = computed(() => `${this.faceUp() ? 'Select' : 'Reveal'} ${this.card().element} weight ${this.card().weightValue}`);
}
