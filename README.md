# Microzone Sprint Manager

Internal sprint planning and grooming MVP for importing Trello cards by sprint label, reviewing sprint scope, and running live team voting sessions.

## What is included

- Angular standalone SPA in [frontend/sprint-manager-spa](C:/GitHub/Microzone%20Weight%20Game/frontend/sprint-manager-spa)
- ASP.NET Core Web API in [backend/Microzone.SprintManager.Api](C:/GitHub/Microzone%20Weight%20Game/backend/Microzone.SprintManager.Api)
- Service/BLL split across Application, Domain, and Infrastructure projects
- SQL Server via EF Core with initial migration
- JWT auth with seeded admin user
- SignalR grooming hub at `/hubs/grooming`
- Trello integration service with live structure and mock fallback
- Development and production Docker Compose stacks

## Repository structure

```text
/
  backend/
  frontend/
  deploy/
  docker-compose.dev.yml
  docker-compose.prod.yml
  .env.example
  README.md
```

## Tech stack

- Frontend: Angular 19, TypeScript, SignalR, Three.js, `marked`
- Backend: ASP.NET Core 9, EF Core 9, SQL Server, JWT bearer auth, SignalR
- Deployment: Docker Compose, Nginx, Certbot

## Assumptions

- Angular 19 was used instead of the latest Angular CLI release because this environment has Node 20.19.3, while current Angular CLI latest requires Node 22+.
- The first version favors a working internal MVP with seed data, mock Trello fallback, and a manageable service layer over deeper workflow customization.
- Production SQL can be internal SQL Server or an external SQL connection string via `PROD_SQL_CONNECTION_STRING`.

## First account bootstrap

- Use the sign-up flow on the login page to create the first account.
- The first registered account is granted the `Admin` role automatically.
- Later sign-ups default to `Developer`.

## Local development

1. Copy `.env.example` to `.env`.
2. Start the containers:

```bash
docker compose -f docker-compose.dev.yml up --build
```

3. Open:

- Frontend: [http://localhost:4200](http://localhost:4200)
- API: [http://localhost:5000](http://localhost:5000)
- Swagger: [http://localhost:5000/swagger](http://localhost:5000/swagger)
- SQL Server: `localhost,1433`

If you change `SQL_SA_PASSWORD` after the SQL container has already initialized, the existing `sqlserver-data` volume keeps the old password. Either rotate the `sa` password inside SQL Server or recreate that volume for a clean local reset.

If your password or SQL connection string contains `$`, escape each literal dollar sign as `$$` in `.env` so Docker Compose does not treat it as variable interpolation.

## Production Docker setup

1. Copy `.env.example` to `.env` and replace every placeholder.
2. Update [deploy/nginx/prod.conf](C:/GitHub/Microzone%20Weight%20Game/deploy/nginx/prod.conf) with the real hostname if needed.
3. Bring the stack up:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

4. Expected routes:

- [https://sprint.microzone.example/](https://sprint.microzone.example/)
- [https://sprint.microzone.example/api/](https://sprint.microzone.example/api/)
- [https://sprint.microzone.example/hubs/grooming](https://sprint.microzone.example/hubs/grooming)

## Environment variables

- `PUBLIC_HOSTNAME`: public DNS name for production
- `SQL_SA_PASSWORD`: local/prod SQL SA password
- `PROD_SQL_CONNECTION_STRING`: production SQL connection string
- `JWT_ISSUER`: JWT issuer
- `JWT_AUDIENCE`: JWT audience
- `JWT_SECRET`: JWT signing secret
- `TRELLO_API_KEY`: Trello API key
- `TRELLO_TOKEN`: Trello token
- `TRELLO_USE_MOCK_DATA`: `true` for mock imports, `false` for live Trello pulls

## Backend commands

```bash
cd backend
dotnet build Microzone.SprintManager.sln
dotnet test Microzone.SprintManager.sln
dotnet tool run dotnet-ef database update --project .\Microzone.SprintManager.Infrastructure\Microzone.SprintManager.Infrastructure.csproj --startup-project .\Microzone.SprintManager.Api\Microzone.SprintManager.Api.csproj
```

## Frontend commands

```bash
cd frontend/sprint-manager-spa
npm install
npm run build
npx ng serve
```

## Trello configuration

1. Sign in as the admin user.
2. Open `/admin/trello`.
3. Add one or more board configurations with board ID and system mapping.
4. Pick a sprint and sprint label.
5. Click `Gather Sprint Tickets`.
6. Use mock mode until real `TRELLO_API_KEY` and `TRELLO_TOKEN` values are configured.

## Migrations

Initial migration files are in [backend/Microzone.SprintManager.Infrastructure/Data/Migrations](C:/GitHub/Microzone%20Weight%20Game/backend/Microzone.SprintManager.Infrastructure/Data/Migrations).

Create another migration with:

```bash
cd backend
dotnet tool run dotnet-ef migrations add YourMigrationName --project .\Microzone.SprintManager.Infrastructure\Microzone.SprintManager.Infrastructure.csproj --startup-project .\Microzone.SprintManager.Api\Microzone.SprintManager.Api.csproj --context SprintManagerDbContext --output-dir Data\Migrations
```

## Manual QA

- Sign up the first admin user if the database is empty, then log in.
- Verify dashboard metrics load.
- Add a Trello board config and run a mock import.
- Open a sprint and confirm ticket search/filter basics work.
- Open My Tickets and verify imported assignees display.
- Start a grooming session from Swagger or the API and open the lobby.
- Join the session in multiple browser tabs with different users when available.
- Confirm readiness appears before reveal, but actual vote values do not.
- Reveal votes and confirm tie/majority behavior.

## Testing

- Backend tests implemented: auth token flow, password hashing, vote majority, tie detection, Trello mapping, mock sprint import
- Frontend tests implemented: auth guard, ticket card, weight card, grooming state service
- Verified in this environment:
  - `dotnet test` passes
  - `npm run build` passes
- Not fully runnable in this environment:
  - `ng test` requires a Chrome binary; the local machine did not expose `C:\Program Files\Google\Chrome\Application\chrome.exe`

## Known MVP limitations

- Refresh token persistence entity exists, but refresh-token endpoints are not implemented yet.
- Admin user management is read-only in the first version.
- Trello live import assumes board/card endpoints and simple comment/member mapping; it does not yet page large boards.
- Grooming flow persistence exists, but the first UI iteration focuses on lobby, private pre-reveal voting, reveal, and admin continuation basics.
- The production compose file assumes certificate directories already exist or are provisioned before first SSL cutover.

## Commit-style summary

- scaffolded full Angular + ASP.NET Core solution with service-layer architecture
- implemented JWT auth, EF Core data model, seed data, Trello import flow, and SignalR grooming hub
- added sprint/admin/grooming SPA routes and reusable grooming UI components
- generated initial EF migration and added dev/prod Docker, Nginx, Certbot, env sample, and operational README
