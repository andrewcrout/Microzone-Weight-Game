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
            <strong class="back-card-value">{{ card().weightValue }}</strong>
          </div>
        </section>

        <section class="face card-front">
          @if (!frontArtMissing()) {
            <img class="art" [src]="assetSet().front" alt="" (error)="frontArtMissing.set(true)" />
          }

          <div class="front-overlay"></div>
          <div class="front-copy">
            <strong class="front-card-value">{{ card().weightValue }}</strong>
            <h4 class="front-title">{{ card().timeLabel }}</h4>
            <div class="front-details">
              <p>{{ card().estimatedTime }}</p>
              <small>{{ card().element }} · {{ card().line }}</small>
            </div>
          </div>
        </section>
      </div>
    </button>
  `,
  styles: [`
    :host {
      display: block;
      --weight-card-base-width: 13rem;
      --weight-card-base-height: 18.2rem;
      --weight-card-scale: 1.1;
      width: calc(var(--weight-card-base-width) * var(--weight-card-scale));
      max-width: 100%;
    }
    .weight-card {
      display: block;
      width: var(--weight-card-base-width);
      height: var(--weight-card-base-height);
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      text-align: left;
      perspective: 1600px;
      transform: scale(var(--weight-card-scale));
      transform-origin: top left;
      transition: transform 220ms ease, filter 220ms ease;
    }
    .weight-card.clickable { cursor: pointer; }
    .weight-card:disabled { cursor: default; opacity: 1; }
    .weight-card.clickable:hover { transform: translateY(-4px) scale(var(--weight-card-scale)); }
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
    .front-copy,
    .back-copy {
      height: 100%;
      position: relative;
    }
    .back-card-value {
      position: absolute;
      top: 38%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 3.4rem;
      height: 3.4rem;
      display: grid;
      place-items: center;
      text-align: center;
      font-size: 1.55rem;
      color: #f5fbff;
      line-height: 1;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.38);
    }
    .front-card-value {
      position: absolute;
      top: 5.5%;
      left: 7%;
      color: #f5fbff;
      font-size: 1.55rem;
      font-weight: 700;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
    }
    .front-title {
      position: absolute;
      top: 8%;
      left: 23%;
      right: 8%;
      margin: 0;
      color: #f5fbff;
      font-size: 0.88rem;
      line-height: 1.08;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
    }
    .front-details {
      position: absolute;
      left: 9%;
      right: 9%;
      top: 68%;
      bottom: 8%;
      display: grid;
      align-content: start;
      gap: 0.22rem;
      color: #eef5fb;
      text-align: left;
    }
    .front-details p {
      font-size: 0.82rem;
      font-weight: 700;
      color: #dde8f2;
    }
    .front-details small {
      font-size: 0.68rem;
      line-height: 1.25;
      color: #cddaea;
    }
    .selected .face { box-shadow: 0 0 0 2px rgba(255, 208, 140, 0.8), 0 1rem 2.4rem rgba(0, 0, 0, 0.32); }
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
