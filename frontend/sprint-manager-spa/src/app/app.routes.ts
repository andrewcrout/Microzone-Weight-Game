import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { LoginPageComponent } from './core/auth/login-page.component';
import { AppShellComponent } from './core/layout/app-shell.component';
import { DashboardPageComponent } from './features/dashboard/dashboard-page.component';
import { SprintListPageComponent } from './features/sprint-tickets/sprint-list-page.component';
import { SprintDetailPageComponent } from './features/sprint-tickets/sprint-detail-page.component';
import { MyTicketsPageComponent } from './features/my-tickets/my-tickets-page.component';
import { AdminPageComponent } from './features/admin/admin-page.component';
import { TrelloAdminPageComponent } from './features/trello-import/trello-admin-page.component';
import { UsersAdminPageComponent } from './features/admin/users-admin-page.component';
import { GroomingLobbyPageComponent } from './features/grooming/lobby/grooming-lobby-page.component';
import { GroomingSessionPageComponent } from './features/grooming/session/grooming-session-page.component';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardPageComponent },
      { path: 'sprints', component: SprintListPageComponent },
      { path: 'sprints/:id', component: SprintDetailPageComponent },
      { path: 'sprints/:id/tickets', component: SprintDetailPageComponent },
      { path: 'my-tickets', component: MyTicketsPageComponent },
      { path: 'admin', component: AdminPageComponent, canActivate: [adminGuard] },
      { path: 'admin/trello', component: TrelloAdminPageComponent, canActivate: [adminGuard] },
      { path: 'admin/users', component: UsersAdminPageComponent, canActivate: [adminGuard] },
      { path: 'grooming/:sessionId/lobby', component: GroomingLobbyPageComponent },
      { path: 'grooming/:sessionId/session', component: GroomingSessionPageComponent },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: '' }
];
