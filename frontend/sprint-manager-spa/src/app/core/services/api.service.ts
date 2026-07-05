import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  CreateSprintRequest,
  Dashboard,
  GroomingLobby,
  PagedResult,
  SaveSystemDefinitionRequest,
  SaveTrelloBoardConfigRequest,
  SaveWeightCardRequest,
  SprintDetail,
  SprintSummary,
  SystemDefinition,
  Ticket,
  TrelloBoardConfig,
  UpdateSprintRequest,
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

  createSprint(payload: CreateSprintRequest) {
    return this.http.post<SprintSummary>(`${environment.apiUrl}/sprints`, payload);
  }

  updateSprint(id: number, payload: UpdateSprintRequest) {
    return this.http.put<SprintSummary>(`${environment.apiUrl}/sprints/${id}`, payload);
  }

  deleteSprint(id: number) {
    return this.http.delete<void>(`${environment.apiUrl}/sprints/${id}`);
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

  saveWeightCard(payload: SaveWeightCardRequest) {
    return this.http.post<WeightCard>(`${environment.apiUrl}/admin/weight-cards`, payload);
  }

  deleteWeightCard(id: number) {
    return this.http.delete<void>(`${environment.apiUrl}/admin/weight-cards/${id}`);
  }

  getSystems() {
    return this.http.get<SystemDefinition[]>(`${environment.apiUrl}/admin/systems`);
  }

  saveSystem(payload: SaveSystemDefinitionRequest) {
    return this.http.post<SystemDefinition>(`${environment.apiUrl}/admin/systems`, payload);
  }

  deleteSystem(id: number) {
    return this.http.delete<void>(`${environment.apiUrl}/admin/systems/${id}`);
  }

  getBoardConfigs() {
    return this.http.get<TrelloBoardConfig[]>(`${environment.apiUrl}/trello/boards`);
  }

  deleteBoardConfig(id: number) {
    return this.http.delete<void>(`${environment.apiUrl}/trello/boards/${id}`);
  }

  saveBoardConfig(payload: SaveTrelloBoardConfigRequest) {
    return this.http.post<TrelloBoardConfig>(`${environment.apiUrl}/trello/boards`, payload);
  }

  gatherSprintTickets(sprintId: number, label: string) {
    return this.http.post<{ imported: number }>(`${environment.apiUrl}/trello/gather`, { sprintId, label });
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
