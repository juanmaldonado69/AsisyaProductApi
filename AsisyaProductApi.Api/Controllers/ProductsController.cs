using AsisyaProductApi.Application.DTOs;
using AsisyaProductApi.Domain.Entities;
using AsisyaProductApi.Infrastructure.Data;
using EFCore.BulkExtensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AsisyaProductApi.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Generación masiva ultrarrápida de productos (Soporta desde 5 hasta 1,000,000 registros).
        /// Acepta el conteo tanto por Query Parameter (?count=100) como por Path (/generate/100).
        /// </summary>
        [HttpPost("generate/{count:int?}")]
        [HttpPost("generate")]
        public async Task<IActionResult> GenerateRandomProducts([FromRoute] int? countRoute, [FromQuery] int? count)
        {
            // Determina la cantidad recibida por ruta o por query string (por defecto 10)
            int totalToGenerate = countRoute ?? count ?? 10;

            if (totalToGenerate <= 0 || totalToGenerate > 1000000)
                return BadRequest("La cantidad a generar debe estar entre 1 y 1,000,000 de productos.");

            // 1. Obtener los IDs de categorías existentes
            var categories = await _context.Categories
                .AsNoTracking()
                .Select(c => c.CategoryID)
                .ToListAsync();

            if (!categories.Any())
                return BadRequest("Debes crear al menos una categoría antes de generar productos.");

            var random = new Random();
            int batchSize = 25000; // Tamaño de lote ideal para BulkInsert en PostgreSQL
            int totalProcessed = 0;

            try
            {
                // Desactivar el ChangeTracker para máximo rendimiento de memoria
                _context.ChangeTracker.AutoDetectChangesEnabled = false;

                while (totalProcessed < totalToGenerate)
                {
                    int currentBatchSize = Math.Min(batchSize, totalToGenerate - totalProcessed);
                    var productsBatch = new List<Product>(currentBatchSize);

                    for (int i = 0; i < currentBatchSize; i++)
                    {
                        int categoryId = categories[random.Next(categories.Count)];
                        productsBatch.Add(new Product
                        {
                            ProductName = $"Prod-{Guid.NewGuid().ToString("N")[..8].ToUpper()}",
                            UnitPrice = Math.Round((decimal)(random.NextDouble() * 500 + 5), 2),
                            UnitsInStock = (short)random.Next(1, 200),
                            CategoryID = categoryId,
                            Discontinued = false,
                            QuantityPerUnit = "1 unit",
                            Stock = (short)random.Next(1, 200)
                        });
                    }

                    // EFCore.BulkExtensions realiza un COPY directo en PostgreSQL (Súper Rápido)
                    await _context.BulkInsertAsync(productsBatch);

                    totalProcessed += currentBatchSize;
                }

                return Ok(new 
                { 
                    Message = $"Se generaron {totalToGenerate:N0} productos exitosamente.", 
                    TotalGenerated = totalToGenerate 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new 
                { 
                    Message = "Error al ejecutar la generación masiva.", 
                    Error = ex.Message,
                    InnerError = ex.InnerException?.Message 
                });
            }
            finally
            {
                _context.ChangeTracker.AutoDetectChangesEnabled = true;
            }
        }

        // 2. Crear un único producto
        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto)
        {
            var categoryExists = await _context.Categories.AnyAsync(c => c.CategoryID == dto.CategoryID);
            if (!categoryExists)
                return BadRequest($"La categoría con ID {dto.CategoryID} no existe.");

            var product = new Product
            {
                ProductName = dto.ProductName,
                CategoryID = dto.CategoryID,
                SupplierID = dto.SupplierID,
                UnitPrice = dto.UnitPrice,
                UnitsInStock = dto.UnitsInStock,
                QuantityPerUnit = dto.QuantityPerUnit ?? "1 unit",
                Discontinued = false,
                Stock = dto.Stock
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProductById), new { id = product.ProductID }, new ProductResponseDto
            {
                ProductID = product.ProductID,
                ProductName = product.ProductName,
                CategoryID = product.CategoryID,
                UnitPrice = product.UnitPrice,
                UnitsInStock = product.UnitsInStock,
                Stock = product.Stock
            });
        }

        // 3. Paginación y búsqueda
        [HttpGet]
        public async Task<IActionResult> GetProducts(
            [FromQuery] string? search,
            [FromQuery] int? categoryId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var query = _context.Products.AsNoTracking().AsQueryable();

                if (!string.IsNullOrWhiteSpace(search))
                {
                    var term = search.Trim();
                    query = query.Where(p => EF.Functions.ILike(p.ProductName, $"%{term}%"));
                }

                if (categoryId.HasValue && categoryId.Value > 0)
                {
                    query = query.Where(p => p.CategoryID == categoryId.Value);
                }

                int totalCount = await query.CountAsync();

                var items = await query
                    .OrderBy(p => p.ProductID)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .Select(p => new ProductResponseDto
                    {
                        ProductID = p.ProductID,
                        ProductName = p.ProductName,
                        CategoryID = p.CategoryID,
                        CategoryName = p.Category.CategoryName ?? string.Empty,
                        UnitPrice = p.UnitPrice,
                        UnitsInStock = p.UnitsInStock,
                        Stock = p.Stock
                    })
                    .ToListAsync();

                return Ok(new PagedResultDto<ProductResponseDto>
                {
                    Items = items,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Error interno al consultar productos.",
                    Error = ex.Message,
                    InnerError = ex.InnerException?.Message
                });
            }
        }

        // 4. Detalle por ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductById(int id)
        {
            var product = await _context.Products
                .AsNoTracking()
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.ProductID == id);

            if (product == null) return NotFound("Producto no encontrado.");

            return Ok(new ProductResponseDto
            {
                ProductID = product.ProductID,
                ProductName = product.ProductName,
                CategoryID = product.CategoryID,
                CategoryName = product.Category?.CategoryName ?? string.Empty,
                UnitPrice = product.UnitPrice,
                UnitsInStock = product.UnitsInStock,
                CategoryPicture = product.Category?.Picture != null ? Convert.ToBase64String(product.Category.Picture) : null,
                Stock = product.Stock
            });
        }

        // 5. Actualizar
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] CreateProductDto dto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound("Producto no encontrado.");

            product.ProductName = dto.ProductName;
            product.CategoryID = dto.CategoryID;
            product.SupplierID = dto.SupplierID;
            product.UnitPrice = dto.UnitPrice;
            product.UnitsInStock = dto.UnitsInStock;
            product.Stock = dto.Stock;
            if (dto.QuantityPerUnit != null) product.QuantityPerUnit = dto.QuantityPerUnit;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // 6. Eliminar
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound("Producto no encontrado.");

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}