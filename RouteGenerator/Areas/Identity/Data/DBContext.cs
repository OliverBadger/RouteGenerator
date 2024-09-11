using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RouteGenerator.Areas.Identity.Data;

namespace RouteGenerator.Areas.Identity.Data;

public class DBContext : IdentityDbContext<User>
{
    public DBContext(DbContextOptions<DBContext> options)
        : base(options)
    {
    }

    public DbSet<Hotspot> Hotspots { get; set; }
    public DbSet<Location> Locations { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Apply custom configurations for ApplicationUser
        builder.ApplyConfiguration(new ApplicationUserEntityConfiguration());

        // Custom relationships
        builder.Entity<Hotspot>()
            .HasOne(h => h.User)
            .WithMany(u => u.Hotspots)
            .HasForeignKey(h => h.ApplicationUserId);
    }
}

public class ApplicationUserEntityConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        // Customize User properties
        builder.Property(x => x.FirstName).HasMaxLength(100);
        builder.Property(x => x.LastName).HasMaxLength(100);

        // Example of further customization
        // builder.HasIndex(u => u.Email).IsUnique();

        /* Once youve done this always add migration which is:
         * 
         * 1) Add-Migration InitialMigration
         * 2) update-database
         */
    }
}