import { Injectable, computed, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { GroomingLobby, GroomingSession, RevealVotes } from '../../shared/models/app.models';

@Injectable({ providedIn: 'root' })
export class GroomingStateService {
  private connection?: signalR.HubConnection;
  private countdownTimer: ReturnType<typeof setInterval> | null = null;
  private pendingReveal: RevealVotes | null = null;

  private readonly lobbyState = signal<GroomingLobby | null>(null);
  private readonly sessionState = signal<GroomingSession | null>(null);
  private readonly revealState = signal<RevealVotes | null>(null);
  private readonly countdownState = signal<number | null>(null);

  readonly lobby = computed(() => this.lobbyState());
  readonly session = computed(() => this.sessionState());
  readonly reveal = computed(() => this.revealState());
  readonly countdown = computed(() => this.countdownState());

  async connect(token: string, sessionId: number, displayName: string) {
    if (!this.connection) {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(environment.hubUrl, { accessTokenFactory: () => token })
        .withAutomaticReconnect()
        .build();

      this.connection.on('LobbyUpdated', (lobby: GroomingLobby) => this.lobbyState.set(lobby));
      this.connection.on('SessionUpdated', (session: GroomingSession) => this.handleSessionUpdated(session));
      this.connection.on('VotesRevealed', (reveal: RevealVotes) => this.handleVotesRevealed(reveal));
      this.connection.on('CountdownStarted', (seconds: number) => this.startCountdown(seconds));

      await this.connection.start();
    }

    await this.connection.invoke('JoinLobby', sessionId, displayName);
  }

  async setReady(sessionId: number, isReady: boolean) {
    await this.connection?.invoke('SetReady', sessionId, isReady);
  }

  async leaveLobby(sessionId: number) {
    await this.connection?.invoke('LeaveLobby', sessionId);
  }

  async submitVote(sessionId: number, ticketId: number, weightValue: number) {
    await this.connection?.invoke('SubmitVote', { sessionId, ticketId, weightValue });
  }

  async revealVotes(sessionId: number, ticketId: number) {
    await this.connection?.invoke('RevealVotes', sessionId, ticketId);
  }

  setLobby(lobby: GroomingLobby) {
    this.lobbyState.set(lobby);
  }

  setSession(session: GroomingSession) {
    this.handleSessionUpdated(session);
  }

  clearReveal() {
    this.pendingReveal = null;
    this.revealState.set(null);
  }

  private handleSessionUpdated(session: GroomingSession) {
    const previous = this.sessionState();
    this.sessionState.set(session);

    const ticketAdvanced = previous !== null && previous.currentTicketIndex !== session.currentTicketIndex;
    const revealClosed = previous !== null && previous.votesRevealed && !session.votesRevealed;

    if (ticketAdvanced || revealClosed || session.status === 'Completed') {
      this.resetRevealCycle();
    }
  }

  private handleVotesRevealed(reveal: RevealVotes) {
    this.pendingReveal = reveal;
    this.revealState.set(null);

    if (this.countdownState() === null) {
      this.revealState.set(reveal);
    }
  }

  private startCountdown(seconds: number) {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }

    this.revealState.set(null);
    this.countdownState.set(seconds);
    this.countdownTimer = setInterval(() => {
      const next = (this.countdownState() ?? 1) - 1;
      if (next <= 0) {
        this.countdownState.set(null);
        if (this.countdownTimer) {
          clearInterval(this.countdownTimer);
          this.countdownTimer = null;
        }

        if (this.pendingReveal) {
          this.revealState.set(this.pendingReveal);
        }

        return;
      }

      this.countdownState.set(next);
    }, 1000);
  }

  private resetRevealCycle() {
    this.pendingReveal = null;
    this.revealState.set(null);
    this.countdownState.set(null);

    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }
}
