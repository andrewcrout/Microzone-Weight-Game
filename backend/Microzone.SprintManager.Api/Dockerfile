FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY backend/Microzone.SprintManager.sln backend/
COPY backend/Microzone.SprintManager.Api/Microzone.SprintManager.Api.csproj backend/Microzone.SprintManager.Api/
COPY backend/Microzone.SprintManager.Application/Microzone.SprintManager.Application.csproj backend/Microzone.SprintManager.Application/
COPY backend/Microzone.SprintManager.Domain/Microzone.SprintManager.Domain.csproj backend/Microzone.SprintManager.Domain/
COPY backend/Microzone.SprintManager.Infrastructure/Microzone.SprintManager.Infrastructure.csproj backend/Microzone.SprintManager.Infrastructure/

RUN dotnet restore backend/Microzone.SprintManager.Api/Microzone.SprintManager.Api.csproj

COPY backend/ backend/
RUN dotnet publish backend/Microzone.SprintManager.Api/Microzone.SprintManager.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Microzone.SprintManager.Api.dll"]
