using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AsisyaProductApi.Application.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace AsisyaProductApi.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public AuthController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto login)
        {
            // Validación de credenciales de demostración
            if (login.Username == "admin" && login.Password == "Admin123*")
            {
                var secretKey = _configuration["Jwt:Secret"] ?? "SuperSecretKey_AsisyaProductApi_2026_SecureKey_12345!";
                var issuer = _configuration["Jwt:Issuer"] ?? "AsisyaProductApi";
                var audience = _configuration["Jwt:Audience"] ?? "AsisyaProductClients";
                var expiryHours = int.Parse(_configuration["Jwt:ExpiryInHours"] ?? "8");

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var claims = new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, login.Username),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim(ClaimTypes.Name, login.Username),
                    new Claim(ClaimTypes.Role, "Admin")
                };

                var expiration = DateTime.UtcNow.AddHours(expiryHours);

                var token = new JwtSecurityToken(
                    issuer: issuer,
                    audience: audience,
                    claims: claims,
                    expires: expiration,
                    signingCredentials: creds
                );

                return Ok(new AuthResponseDto
                {
                    Token = new JwtSecurityTokenHandler().WriteToken(token),
                    Expiration = expiration,
                    Username = login.Username
                });
            }

            return Unauthorized(new { Message = "Usuario o contraseña incorrectos" });
        }
    }
}
