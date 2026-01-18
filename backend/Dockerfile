# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["TicketManagementSystemMongo.csproj", "."]
RUN dotnet restore "./TicketManagementSystemMongo.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet publish "TicketManagementSystemMongo.csproj" -c Release -o /app/publish

# Stage 2: Run
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "TicketManagementSystemMongo.dll"]
