import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  Dashboard,
  GroomingLobby,
  PagedResult,
  SprintDetail,
  SprintSummary,
  SystemDefinition,
  Ticket,
  TrelloBoardConfig,
  User,
  WeightCard
} from '../../shared/models/app.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  getDashboard() {
    return this.http.get<Dashboard>(`${environment.apiUrl}/dashboard`);
  }

  getSprints() {
    return this.http.get<SprintSummary[]>(`${environment.apiUrl}/sprints`);
  }

  getSprint(id: number) {
    return this.http.get<SprintDetail>(`${environment.apiUrl}/sprints/${id}`);
  }

  getTickets(sprintId: number, search = '') {
    const params = new HttpParams().set('search', search);
    return this.http.get<PagedResult<Ticket>>(`${environment.apiUrl}/sprinttickets/sprint/${sprintId}`, { params });
  }

  getMyTickets() {
    return this.http.get<Ticket[]>(`${environment.apiUrl}/sprinttickets/my`);
  }

  getWeightCards() {
    return this.http.get<WeightCard[]>(`${environment.apiUrl}/admin/weight-cards`);
  }

  getSystems() {
    return this.http.get<SystemDefinition[]>(`${environment.apiUrl}/admin/systems`);
  }

  getBoardConfigs() {
    return this.http.get<TrelloBoardConfig[]>(`${environment.apiUrl}/trello/boards`);
  }

  saveBoardConfig(payload: Omit<TrelloBoardConfig, 'id'>) {
    return this.http.post<TrelloBoardConfig>(`${environment.apiUrl}/trello/boards`, payload);
  }

  gatherSprintTickets(sprintId: number, label: string, useMockData: boolean) {
    return this.http.post<{ imported: number }>(`${environment.apiUrl}/trello/gather`, { sprintId, label, useMockData });
  }

  getUsers() {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }

  startGroomingSession(sprintId: number) {
    return this.http.post<{ id: number }>(`${environment.apiUrl}/groomingsessions/start/${sprintId}`, {});
  }

  resolveVotes(votes: number[]) {
    return this.http.post(`${environment.apiUrl}/voting/resolve`, votes);
  }
}
