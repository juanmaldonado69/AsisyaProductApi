using System.Text;
using AsisyaProductApi.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurar conexión a PostgreSQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Configurar Autenticación JWT
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "SuperSecretKey_AsisyaProductApi_2026_SecureKey_12345!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "AsisyaProductApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "AsisyaProductClients";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
    };
});

// 3. Configurar política de CORS (Permite puertos de Vite/React y Angular)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontendApps", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 4. Registrar Controladores y Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Asisya Product API", Version = "v1" });
});

var app = builder.Build();

// 5. Configuración de Middlewares (El orden importa)

// A. Habilitar Swagger siempre en la raíz/swagger
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Asisya Product API v1");
    c.RoutePrefix = "swagger";
});

app.UseRouting();

// B. CORS debe ejecutarse ANTES de Autenticación y Autorización
app.UseCors("AllowFrontendApps");

// C. Seguridad JWT
app.UseAuthentication();
app.UseAuthorization();

// D. Mapeo de controladores
app.MapControllers();

// Aplicar migraciones automáticamente en PostgreSQL al iniciar el contenedor
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        context.Database.Migrate();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Ocurrió un error al ejecutar las migraciones de PostgreSQL.");
    }
}

app.Run();