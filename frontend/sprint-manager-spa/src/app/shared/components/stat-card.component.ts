import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  template: `
    <article class="card">
      <p>{{ label() }}</p>
      <h3>{{ value() }}</h3>
      @if (subtext()) { <small>{{ subtext() }}</small> }
    </article>
  `,
  styles: [`
    .card { padding: 1rem 1.15rem; border-radius: 1.2rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }
    p, small { color: #9fb6ca; margin: 0; }
    h3 { margin: 0.5rem 0 0; font-size: 1.6rem; }
  `]
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly subtext = input('');
}
