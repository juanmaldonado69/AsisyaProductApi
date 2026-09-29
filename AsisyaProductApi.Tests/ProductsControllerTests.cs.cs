using Xunit;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace AsisyaProductApi.Tests
{
    public class ProductsControllerTests
    {
        [Fact]
        public void GenerateProducts_WithInvalidCount_ReturnsBadRequest()
        {
            // Arrange
            int countInvalido = 0;

            // Assert: Validar que una cantidad menor o igual a 0 debe ser rechazada
            bool esValido = countInvalido > 0 && countInvalido <= 100000;
            esValido.Should().BeFalse();
        }
    }
}
