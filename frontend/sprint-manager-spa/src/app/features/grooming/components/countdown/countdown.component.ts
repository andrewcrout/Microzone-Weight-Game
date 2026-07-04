import { Component, input } from '@angular/core';

@Component({
  selector: 'app-countdown',
  standalone: true,
  template: `
    @if (seconds() !== null) {
      <div class="countdown">{{ seconds() }}</div>
    }
  `,
  styles: [`
    .countdown { display: grid; place-items: center; width: 5rem; height: 5rem; border-radius: 50%; background: radial-gradient(circle, #ffd08c, #ff8f5b); color: #08131f; font-size: 2rem; font-weight: 800; }
  `]
})
export class CountdownComponent {
  readonly seconds = input<number | null>(null);
}
