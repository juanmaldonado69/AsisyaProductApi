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

        // 1. Inserción masiva de 100,000 productos
        [HttpPost("generate/{count}")]
        public async Task<IActionResult> GenerateRandomProducts(int count = 10)
        {
            if (count <= 0 || count > 50000)
                return BadRequest("La cantidad a generar debe estar entre 1 y 50,000 productos.");

            var categories = await _context.Categories
                .Select(c => c.CategoryID)
                .ToListAsync();

            if (!categories.Any())
                return BadRequest("Debes crear al menos una categoría antes de generar productos.");

            var random = new Random();
            int batchSize = 1000;
            int totalProcessed = 0;

            _context.ChangeTracker.AutoDetectChangesEnabled = false;

            try
            {
                while (totalProcessed < count)
                {
                    int currentBatchSize = Math.Min(batchSize, count - totalProcessed);
                    var productsBatch = new List<Product>(currentBatchSize);

                    for (int i = 0; i < currentBatchSize; i++)
                    {
                        int categoryId = categories[random.Next(categories.Count)];
                        productsBatch.Add(new Product
                        {
                            ProductName = $"Producto {Guid.NewGuid().ToString("N")[..6].ToUpper()}",
                            UnitPrice = Math.Round((decimal)(random.NextDouble() * 500 + 5), 2),
                            UnitsInStock = (short)random.Next(1, 200),
                            CategoryID = categoryId,
                            Discontinued = false
                        });
                    }

                    await _context.Products.AddRangeAsync(productsBatch);
                    await _context.SaveChangesAsync();

                    _context.ChangeTracker.Clear();

                    totalProcessed += currentBatchSize;
                }
            }
            finally
            {
                _context.ChangeTracker.AutoDetectChangesEnabled = true;
            }

            return Ok(new { Message = $"Se generaron {count} productos exitosamente en lotes.", TotalGenerated = count });
        }

        // 2. Crear un único producto (Para el formulario del Frontend)
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
                Discontinued = false
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProductById), new { id = product.ProductID }, new ProductResponseDto
            {
                ProductID = product.ProductID,
                ProductName = product.ProductName,
                CategoryID = product.CategoryID,
                UnitPrice = product.UnitPrice,
                UnitsInStock = product.UnitsInStock
            });
        }

        // 3. Paginación, búsqueda e instrucción ILike para PostgreSQL
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

                // Filtro de búsqueda insensible a mayúsculas/minúsculas
                if (!string.IsNullOrWhiteSpace(search))
                {
                    var term = search.Trim();
                    query = query.Where(p => EF.Functions.ILike(p.ProductName, $"%{term}%"));
                }

                // Filtro por categoría
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
                        UnitsInStock = p.UnitsInStock
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

        // 4. Obtener detalle por ID (incluye imagen de la categoría en Base64)
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
                CategoryPicture = product.Category?.Picture != null ? Convert.ToBase64String(product.Category.Picture) : null
            });
        }

        // 5. Actualizar un producto existente
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
            if (dto.QuantityPerUnit != null) product.QuantityPerUnit = dto.QuantityPerUnit;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // 6. Eliminar un producto
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound("Producto no encontrado.");

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        //PRuebas

        [HttpPost("generate")]



        public async Task<IActionResult> GenerateRandomProducts2(int count = 10)



        {



            var categories = await _context.Categories.ToListAsync();



            if (!categories.Any())



                return BadRequest("Debes crear al menos una categoría antes de generar productos.");







            var random = new Random();



            var products = new List<Product>();







            for (int i = 1; i <= count; i++)



            {



                var category = categories[random.Next(categories.Count)];



                products.Add(new Product



                {



                    ProductName = $"Producto Aleatorio {Guid.NewGuid().ToString().Substring(0, 5)}",



                    UnitPrice = Math.Round((decimal)(random.NextDouble() * 100 + 1), 2),



                    UnitsInStock = (short)random.Next(1, 100),



                    CategoryID = category.CategoryID,



                    Discontinued = false



                });



            }







            await _context.Products.AddRangeAsync(products);



            await _context.SaveChangesAsync();







            return Ok(new { Message = $"Se generaron {count} productos exitosamente." });



        }




    }
}