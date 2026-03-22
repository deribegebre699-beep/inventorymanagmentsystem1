FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish -c Release -o /app/publish

FROM mrc.microsoft.com/dotnet/aspent:7.0
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS = http://+:10000

ENTRYPOINT ["dotnet", "INVENTORY_MANAGEMENT_SYSTEM_BACKEND.dll"]