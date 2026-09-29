using System;
using System.Collections.Generic;
using System.Text;

namespace AsisyaProductApi.Domain.Entities
{
   
    public class Category
    {
        public int CategoryID { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public byte[]? Picture { get; set; }

        public ICollection<Product> Products { get; set; } = new List<Product>();
    }

}
