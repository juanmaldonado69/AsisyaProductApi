using System;
using System.Collections.Generic;
using System.Text;

namespace AsisyaProductApi.Application.DTOs
{
    public class CreateCategoryDto
    {
        public string CategoryName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Base64Picture { get; set; }
    }

    public class CategoryResponseDto
    {
        public int CategoryID { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Base64Picture { get; set; }
    }
}
