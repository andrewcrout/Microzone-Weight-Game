import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  AssignSprintTicketRequest,
  CreateSprintRequest,
  Dashboard,
  GroomingSession,
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
  UpdateSprintTicketStatusRequest,
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

  assignTicketToSelf(ticketId: number) {
    return this.http.post<Ticket>(`${environment.apiUrl}/sprinttickets/${ticketId}/assign-self`, {});
  }

  assignTicketToUser(ticketId: number, payload: AssignSprintTicketRequest) {
    return this.http.post<Ticket>(`${environment.apiUrl}/sprinttickets/${ticketId}/assign-user`, payload);
  }

  updateTicketWorkStatus(ticketId: number, payload: UpdateSprintTicketStatusRequest) {
    return this.http.post<Ticket>(`${environment.apiUrl}/sprinttickets/${ticketId}/work-status`, payload);
  }

  getWeightCards() {
    return this.http.get<WeightCard[]>(`${environment.apiUrl}/weightcards`);
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
    return this.http.post<GroomingSession>(`${environment.apiUrl}/groomingsessions/start/${sprintId}`, {});
  }

  getGroomingSession(sessionId: number) {
    return this.http.get<GroomingSession>(`${environment.apiUrl}/groomingsessions/${sessionId}`);
  }

  getActiveGroomingSession(sprintId: number) {
    return this.http.get<GroomingSession>(`${environment.apiUrl}/groomingsessions/active/sprint/${sprintId}`);
  }

  beginGroomingSession(sessionId: number) {
    return this.http.post<GroomingSession>(`${environment.apiUrl}/groomingsessions/${sessionId}/begin`, {});
  }

  advanceGroomingTicket(sessionId: number, ticketId: number, finalWeight: number) {
    const params = new HttpParams()
      .set('sessionId', sessionId)
      .set('ticketId', ticketId)
      .set('finalWeight', finalWeight);

    return this.http.post<void>(`${environment.apiUrl}/voting/advance`, null, { params });
  }

  removeTicketFromGrooming(sessionId: number, ticketId: number) {
    return this.http.post<void>(`${environment.apiUrl}/groomingsessions/${sessionId}/remove/${ticketId}`, {});
  }

  resolveVotes(votes: number[]) {
    return this.http.post(`${environment.apiUrl}/voting/resolve`, votes);
  }
}
