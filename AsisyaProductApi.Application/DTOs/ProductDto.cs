using System;
using System.Collections.Generic;
using System.Text;

namespace AsisyaProductApi.Application.DTOs
{
    public class CreateProductDto
    {
        public string ProductName { get; set; } = string.Empty;
        public int CategoryID { get; set; }
        public int? SupplierID { get; set; }
        public decimal UnitPrice { get; set; }
        public short UnitsInStock { get; set; }
        public string? QuantityPerUnit { get; set; }
         public int Stock {get;set;}
    }

    public class BulkProductRequestDto
    {
        public int Count { get; set; } = 100000;
        public int CategoryId { get; set; }
    }

    public class ProductResponseDto
    {
        public int ProductID { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int CategoryID { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public short UnitsInStock { get; set; }
        public string? CategoryPicture { get; set; }
        public int Stock {get;set;}
    }

    public class PagedResultDto<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
    }
}
