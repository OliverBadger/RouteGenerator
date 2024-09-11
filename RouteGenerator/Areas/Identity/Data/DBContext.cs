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

        // Apply custom configurations for User
        builder.ApplyConfiguration(new ApplicationUserEntityConfiguration());

        // Foreign Key Relationships

        //// Relationship between User and Location (HomeLocation)
        //builder.Entity<User>()
        //    .HasOne(u => u.HomeLocation)
        //    .WithMany(l => l.Users)  // A location can be home to many users
        //    .HasForeignKey(u => u.HomeLocationId)
        //    .OnDelete(DeleteBehavior.Restrict);  // No cascade delete on home location

        //// Relationship between Hotspot and Location
        //builder.Entity<Hotspot>()
        //    .HasOne(h => h.Location)
        //    .WithMany(l => l.Hotspots)  // A location can have many hotspots
        //    .HasForeignKey(h => h.LocationId)
        //    .OnDelete(DeleteBehavior.Cascade);  // Cascade delete allowed

        //// Relationship between Hotspot and User (ApplicationUser)
        //builder.Entity<Hotspot>()
        //    .HasOne(h => h.User)
        //    .WithMany(u => u.Hotspots)  // A user can have many hotspots
        //    .HasForeignKey(h => h.ApplicationUserId)
        //    .OnDelete(DeleteBehavior.Cascade);  // Cascade delete allowed
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