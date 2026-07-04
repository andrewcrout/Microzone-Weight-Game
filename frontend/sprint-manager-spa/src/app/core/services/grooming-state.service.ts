import { Injectable, computed, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { GroomingLobby, RevealVotes } from '../../shared/models/app.models';

@Injectable({ providedIn: 'root' })
export class GroomingStateService {
  private connection?: signalR.HubConnection;

  private readonly lobbyState = signal<GroomingLobby | null>(null);
  private readonly revealState = signal<RevealVotes | null>(null);
  private readonly countdownState = signal<number | null>(null);

  readonly lobby = computed(() => this.lobbyState());
  readonly reveal = computed(() => this.revealState());
  readonly countdown = computed(() => this.countdownState());

  async connect(token: string, sessionId: number, displayName: string) {
    if (!this.connection) {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(environment.hubUrl, { accessTokenFactory: () => token })
        .withAutomaticReconnect()
        .build();

      this.connection.on('LobbyUpdated', (lobby: GroomingLobby) => this.lobbyState.set(lobby));
      this.connection.on('VotesRevealed', (reveal: RevealVotes) => this.revealState.set(reveal));
      this.connection.on('CountdownStarted', (seconds: number) => this.countdownState.set(seconds));

      await this.connection.start();
    }

    await this.connection.invoke('JoinLobby', sessionId, displayName);
  }

  async setReady(sessionId: number, isReady: boolean) {
    await this.connection?.invoke('SetReady', sessionId, isReady);
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
}
