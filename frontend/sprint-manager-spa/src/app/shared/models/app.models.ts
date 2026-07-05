export interface User {
  id: number;
  email: string;
  displayName: string;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  expiresAtUtc: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  displayName: string;
  password: string;
}

export interface Dashboard {
  greeting: string;
  currentSprint: string | null;
  completionPercentage: number;
  carryOverRate: number;
  remainingTickets: number;
  assignedTickets: number;
  notStartedCount: number;
  inProgressCount: number;
  prSentCount: number;
  completeCount: number;
  activeGroomingSessionId: number | null;
  isAdmin: boolean;
}

export interface SprintSummary {
  id: number;
  name: string;
  label: string;
  isActive: boolean;
  ticketCount: number;
}

export interface CreateSprintRequest {
  name: string;
  label: string;
  goal: string | null;
  isActive: boolean;
}

export interface UpdateSprintRequest extends CreateSprintRequest {}

export interface AssignSprintTicketRequest {
  userId: number;
}

export interface UpdateSprintTicketStatusRequest {
  workStatus: string;
}

export interface Ticket {
  id: number;
  trelloCardId: string;
  title: string;
  description: string;
  shortUrl: string;
  systemName: string;
  commentCount: number;
  weightValue: number | null;
  timeScore: number | null;
  groomingStatus: string;
  workStatus: string;
  labels: string[];
  assignees: string[];
  comments: string[];
}

export interface SprintDetail extends SprintSummary {
  goal: string | null;
  tickets: Ticket[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface WeightCard {
  id: number;
  weightValue: number;
  timeScore: number;
  timeLabel: string;
  estimatedTime: string;
  element: string;
  line: string;
}

export interface SaveWeightCardRequest {
  id: number | null;
  weightValue: number;
  timeScore: number;
  timeLabel: string;
  estimatedTime: string;
  element: string;
  line: string;
}

export interface SystemDefinition {
  id: number;
  name: string;
}

export interface SaveSystemDefinitionRequest {
  id: number | null;
  name: string;
}

export interface TrelloBoardConfig {
  id: number;
  name: string;
  boardId: string;
  baseUrl: string;
  isEnabled: boolean;
  systemName: string | null;
}

export interface SaveTrelloBoardConfigRequest {
  id: number | null;
  name: string;
  boardId: string;
  baseUrl: string;
  isEnabled: boolean;
  systemName: string | null;
}

export interface GroomingParticipant {
  userId: number;
  displayName: string;
  isReady: boolean;
  isAdmin: boolean;
}

export interface GroomingLobby {
  sessionId: number;
  participants: GroomingParticipant[];
  canStart: boolean;
}

export interface GroomingSession {
  id: number;
  sprintId: number;
  status: string;
  currentTicketIndex: number;
  votesRevealed: boolean;
}

export interface GroomingVote {
  userId: number;
  displayName: string;
  weightValue: number;
}

export interface RevealVotes {
  ticketId: number;
  votes: GroomingVote[];
  isTie: boolean;
  majorityWeight: number | null;
}
