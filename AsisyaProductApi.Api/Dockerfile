# Etapa de SDK para compilar la aplicación
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiar archivos de proyecto (.csproj) para restaurar dependencias
COPY ["AsisyaProductApi.Api/AsisyaProductApi.Api.csproj", "AsisyaProductApi.Api/"]
COPY ["AsisyaProductApi.Application/AsisyaProductApi.Application.csproj", "AsisyaProductApi.Application/"]
COPY ["AsisyaProductApi.Domain/AsisyaProductApi.Domain.csproj", "AsisyaProductApi.Domain/"]
COPY ["AsisyaProductApi.Infrastructure/AsisyaProductApi.Infrastructure.csproj", "AsisyaProductApi.Infrastructure/"]

RUN dotnet restore "AsisyaProductApi.Api/AsisyaProductApi.Api.csproj"

# Copiar el código fuente completo y compilar
COPY . .
WORKDIR "/src/AsisyaProductApi.Api"
RUN dotnet build "AsisyaProductApi.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "AsisyaProductApi.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Etapa final de Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80
ENTRYPOINT ["dotnet", "AsisyaProductApi.Api.dll"]