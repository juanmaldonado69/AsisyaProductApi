using System;
using System.Collections.Generic;
using System.Text;
using AsisyaProductApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AsisyaProductApi.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Shipper> Shippers => Set<Shipper>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderDetail> OrderDetails => Set<OrderDetail>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Category
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CategoryID);
            entity.Property(e => e.CategoryName).IsRequired().HasMaxLength(15);
            entity.HasIndex(e => e.CategoryName).IsUnique();
        });

        // Supplier
        modelBuilder.Entity<Supplier>(entity =>
        {
            entity.HasKey(e => e.SupplierID);
            entity.Property(e => e.CompanyName).IsRequired().HasMaxLength(40);
        });

        // Product
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.ProductID);
            entity.Property(e => e.ProductName).IsRequired().HasMaxLength(40);
            entity.Property(e => e.UnitPrice).HasPrecision(18, 2);

            entity.HasOne(d => d.Category)
                  .WithMany(p => p.Products)
                  .HasForeignKey(d => d.CategoryID);

            entity.HasOne(d => d.Supplier)
                  .WithMany(p => p.Products)
                  .HasForeignKey(d => d.SupplierID);
        });

        // Customer
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.CustomerID);
            entity.Property(e => e.CustomerID).HasMaxLength(5);
            entity.Property(e => e.CompanyName).IsRequired().HasMaxLength(40);
        });

        // Employee
        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => e.EmployeeID);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(20);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(10);

            entity.HasOne(d => d.Manager)
                  .WithMany(p => p.DirectReports)
                  .HasForeignKey(d => d.ReportsTo);
        });

        // Shipper
        modelBuilder.Entity<Shipper>(entity =>
        {
            entity.HasKey(e => e.ShipperID);
            entity.Property(e => e.CompanyName).IsRequired().HasMaxLength(40);
        });

        // Order
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderID);
            entity.Property(e => e.Freight).HasPrecision(18, 2);

            entity.HasOne(d => d.Customer)
                  .WithMany(p => p.Orders)
                  .HasForeignKey(d => d.CustomerID);

            entity.HasOne(d => d.Employee)
                  .WithMany(p => p.Orders)
                  .HasForeignKey(d => d.EmployeeID);

            entity.HasOne(d => d.Shipper)
                  .WithMany(p => p.Orders)
                  .HasForeignKey(d => d.ShipVia);
        });

        // OrderDetail (Clave Primaria Compuesta)
        modelBuilder.Entity<OrderDetail>(entity =>
        {
            entity.HasKey(e => new { e.OrderID, e.ProductID });
            entity.Property(e => e.UnitPrice).HasPrecision(18, 2);

            entity.HasOne(d => d.Order)
                  .WithMany(p => p.OrderDetails)
                  .HasForeignKey(d => d.OrderID);

            entity.HasOne(d => d.Product)
                  .WithMany(p => p.OrderDetails)
                  .HasForeignKey(d => d.ProductID);
        });
    }
}