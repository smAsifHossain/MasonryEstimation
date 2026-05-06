FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY MasonryEstimation/MasonryEstimation.csproj MasonryEstimation/
RUN dotnet restore MasonryEstimation/MasonryEstimation.csproj

COPY . .
WORKDIR /src/MasonryEstimation
RUN dotnet publish MasonryEstimation.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "MasonryEstimation.dll"]
