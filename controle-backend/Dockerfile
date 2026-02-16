# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["Controle.API/Controle.API.csproj", "Controle.API/"]
COPY ["Controle.Application/Controle.Application.csproj", "Controle.Application/"]
COPY ["Controle.Domain/Controle.Domain.csproj", "Controle.Domain/"]
COPY ["Controle.Infrastructure/Controle.Infrastructure.csproj", "Controle.Infrastructure/"]

RUN dotnet restore "Controle.API/Controle.API.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/Controle.API"
RUN dotnet build "Controle.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Controle.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Controle.API.dll"]
