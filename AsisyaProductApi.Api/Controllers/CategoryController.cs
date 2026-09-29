using AsisyaProductApi.Application.DTOs;
using AsisyaProductApi.Domain.Entities;
using AsisyaProductApi.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AsisyaProductApi.Api.Controllers

{
    [Authorize]
    [ApiController]
    [Route("api/categories")]
    public class CategoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoryController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto dto)
        {
            if (await _context.Categories.AnyAsync(c => c.CategoryName == dto.CategoryName))
                return BadRequest($"La categoría '{dto.CategoryName}' ya existe.");

            byte[]? pictureBytes = null;
            if (!string.IsNullOrEmpty(dto.Base64Picture))
            {
                pictureBytes = Convert.FromBase64String(dto.Base64Picture);
            }

            var category = new Category
            {
                CategoryName = dto.CategoryName,
                Description = dto.Description,
                Picture = pictureBytes
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategoryById), new { id = category.CategoryID }, new CategoryResponseDto
            {
                CategoryID = category.CategoryID,
                CategoryName = category.CategoryName,
                Description = category.Description
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound();

            return Ok(new CategoryResponseDto
            {
                CategoryID = category.CategoryID,
                CategoryName = category.CategoryName,
                Description = category.Description,
                Base64Picture = category.Picture != null ? Convert.ToBase64String(category.Picture) : null
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCategories()
        {
            var rawCategories = await _context.Categories
                .Select(c => new
                {
                    c.CategoryID,
                    c.CategoryName,
                    c.Description,
                    c.Picture
                })
                .ToListAsync();

            var result = rawCategories.Select(c => new CategoryResponseDto
            {
                CategoryID = c.CategoryID,
                CategoryName = c.CategoryName,
                Description = c.Description,
                Base64Picture = c.Picture != null && c.Picture.Length > 0
                    ? Convert.ToBase64String(c.Picture)
                    : null
            });

            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] CreateCategoryDto dto)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound($"No se encontró la categoría con ID {id}.");

            // Validar que no exista otra categoría con el mismo nombre
            if (await _context.Categories.AnyAsync(c => c.CategoryName == dto.CategoryName && c.CategoryID != id))
                return BadRequest($"Ya existe otra categoría con el nombre '{dto.CategoryName}'.");

            category.CategoryName = dto.CategoryName;
            category.Description = dto.Description;

            if (!string.IsNullOrEmpty(dto.Base64Picture))
            {
                category.Picture = Convert.FromBase64String(dto.Base64Picture);
            }

            _context.Categories.Update(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound($"No se encontró la categoría con ID {id}.");

            // Verificar si tiene productos asociados antes de eliminar
            var hasProducts = await _context.Products.AnyAsync(p => p.CategoryID == id);
            if (hasProducts)
                return BadRequest("No se puede eliminar la categoría porque tiene productos asociados.");

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
