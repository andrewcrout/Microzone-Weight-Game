import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <main class="login-page">
      <section class="login-panel">
        <p class="eyebrow">Microzone Sprint Manager</p>
        <h1>Plan the sprint. Run the room.</h1>
        <p class="lede">Trello import, sprint visibility, and live grooming in one internal workspace.</p>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <label>
            <span>Email</span>
            <input type="email" formControlName="email" />
          </label>

          <label>
            <span>Password</span>
            <input type="password" formControlName="password" />
          </label>

          <button type="submit" [disabled]="form.invalid || loading()">Sign in</button>
          <p class="helper">Default admin: admin&#64;microzone.local / Admin123!</p>
          @if (error()) {
            <p class="error">{{ error() }}</p>
          }
        </form>
      </section>
    </main>
  `,
  styles: [`
    .login-page { min-height: 100vh; display: grid; place-items: center; background: radial-gradient(circle at top, #16355b, #08131f 55%, #04080d); padding: 2rem; }
    .login-panel { width: min(32rem, 100%); padding: 2rem; border-radius: 1.5rem; background: rgba(10, 20, 33, 0.88); border: 1px solid rgba(149, 192, 255, 0.18); box-shadow: 0 30px 60px rgba(0,0,0,0.35); }
    .eyebrow { text-transform: uppercase; letter-spacing: 0.22em; color: #9ac3ff; font-size: 0.76rem; }
    h1 { margin: 0.5rem 0 0.75rem; font-size: 2.3rem; }
    .lede, .helper { color: #aac1d7; }
    form { display: grid; gap: 1rem; margin-top: 1.5rem; }
    label { display: grid; gap: 0.35rem; }
    input { border: 1px solid rgba(149,192,255,0.18); border-radius: 0.9rem; background: #0f1d2d; color: #f5fbff; padding: 0.9rem 1rem; }
    button { border: 0; border-radius: 999px; background: linear-gradient(135deg, #ffb347, #ff7043); color: #08131f; font-weight: 700; padding: 0.95rem 1.2rem; cursor: pointer; }
    .error { color: #ff9e9e; }
  `]
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['admin@microzone.local', [Validators.required, Validators.email]],
    password: ['Admin123!', Validators.required]
  });

  submit() {
    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);
    this.error.set('');
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => void this.router.navigate(['/dashboard']),
      error: () => {
        this.loading.set(false);
        this.error.set('Invalid credentials or API unavailable.');
      },
      complete: () => this.loading.set(false)
    });
  }
}
