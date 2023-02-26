FROM node:18 as client-build
WORKDIR /source

COPY client/package.json .
COPY client/yarn.lock .
COPY client/.yarn .yarn
COPY client/.yarnrc.yml .
RUN yarn

COPY client .
RUN DOCKER=true yarn dist

FROM mcr.microsoft.com/dotnet/sdk:7.0 AS server-build
WORKDIR /source

# copy csproj and restore as distinct layers
COPY Tetra/Tetra.csproj Tetra/Tetra.csproj
COPY Tetra.Shared/Tetra.Shared.csproj Tetra.Shared/Tetra.Shared.csproj
COPY Tetra.sln Tetra.sln
RUN dotnet restore

# copy and publish app and libraries
COPY . .
RUN dotnet publish -c Release -o /app --no-restore

# final stage/image
FROM mcr.microsoft.com/dotnet/aspnet:7.0
WORKDIR /app
COPY --from=server-build /app .
COPY --from=client-build /source/dist wwwroot
CMD ["dotnet", "Tetra.dll"]
