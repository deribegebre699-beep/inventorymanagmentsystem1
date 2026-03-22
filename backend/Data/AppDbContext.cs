using backend.Models;
using backend.Services;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext : DbContext
{
    private readonly ITenantService _tenantService;

    public AppDbContext(DbContextOptions<AppDbContext> options, ITenantService tenantService) : base(options)
    {
        _tenantService = tenantService;
    }

    public DbSet<Company> Companies { get; set; } = null!;
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Category> Categories { get; set; } = null!;
    public DbSet<Item> Items { get; set; } = null!;
    public DbSet<OtpRecord> OtpRecords { get; set; } = null!;
    public DbSet<Notification> Notifications { get; set; } = null!;


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Global Query Filters for Multi-Tenancy
        // If a company ID is available from the token, apply the filter
        modelBuilder.Entity<User>().HasQueryFilter(u => _tenantService.GetCompanyId() == null || u.CompanyId == _tenantService.GetCompanyId());
        modelBuilder.Entity<Category>().HasQueryFilter(c => _tenantService.GetCompanyId() == null || c.CompanyId == _tenantService.GetCompanyId());
        modelBuilder.Entity<Item>().HasQueryFilter(i => _tenantService.GetCompanyId() == null || i.CompanyId == _tenantService.GetCompanyId());

        // Category self-referencing relationship for subcategories
        modelBuilder.Entity<Category>()
            .HasOne(c => c.ParentCategory)
            .WithMany(c => c.SubCategories)
            .HasForeignKey(c => c.ParentCategoryId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        // Notification sender/recipient relationships
        modelBuilder.Entity<Notification>()
            .HasOne(n => n.Sender)
            .WithMany()
            .HasForeignKey(n => n.SenderId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.Recipient)
            .WithMany()
            .HasForeignKey(n => n.RecipientId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        // Configure indexes
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<Company>().HasIndex(c => c.Email).IsUnique();

        // Seed SuperAdmin
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = 1,
            Email = "admin@gmail.com",
            PasswordHash = "$2a$11$VoF3UpEYgeEsGyz2AuinYO1OwE7Vtx5NqRtdHj9OpgS8vHy/1V86q", // Admin123!
            Role = Role.SuperAdmin,
            CompanyId = null
        });
    }

    public override int SaveChanges()
    {
        SetTenantIdAutomatically();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        SetTenantIdAutomatically();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void SetTenantIdAutomatically()
    {
        var companyId = _tenantService.GetCompanyId();
        if (companyId == null) return;

        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.State == EntityState.Added)
            {
                if (entry.Entity is User user && user.CompanyId == null)
                {
                    user.CompanyId = companyId.Value;
                }
                else if (entry.Entity is Category category && category.CompanyId == 0)
                {
                    category.CompanyId = companyId.Value;
                }
                else if (entry.Entity is Item item && item.CompanyId == 0)
                {
                    item.CompanyId = companyId.Value;
                }
            }
        }
    }
}
