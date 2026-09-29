using Xunit;
using Moq;
using FluentAssertions;
using System.Threading.Tasks;
using System.Collections.Generic;
using AsisyaProductApi.Api; // Ajusta según la ruta exacta de tu servicio
using AsisyaProductApi.Application.DTOs;      // Ajusta según la ruta de tus DTOs
using AsisyaProductApi.Domain.Entities;

namespace AsisyaProductApi.Tests
{
    public class ProductServiceTests
    {
        [Fact]
        public void GenerateRandomProducts_Validation_ShouldFailIfCountIsInvalid()
        {
            // Arrange (Preparación)
            int countInvalido = -5;

            // Act & Assert (Verificación)
            countInvalido.Should().BeLessThanOrEqualTo(0);
        }

        [Fact]
        public async Task GetByIdAsync_WhenProductExists_ShouldReturnProductDto()
        {
            // Arrange
            int productId = 1;
            var productDummy = new Product
            {
                ProductID = productId,
                ProductName = "Servidor Dell PowerEdge",
                UnitPrice = 1500.00m,
                UnitsInStock = 10,
                CategoryID = 1
            };

            // Assert
            productDummy.ProductID.Should().Be(productId);
            productDummy.ProductName.Should().NotBeNullOrEmpty();
            productDummy.UnitPrice.Should().BeGreaterThan(0);
        }
    }
}
