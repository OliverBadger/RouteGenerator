using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace RouteGenerator.Areas.Identity.Data;

// Add profile data for application users by adding properties to the User class
public class User : IdentityUser
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }

    //[Required]
    //public Guid? HomeLocationId { get; set; }  // Foreign key reference to Location

    // Navigation property to Location
    public Location? HomeLocation { get; set; }

    public double PreferredRouteLength { get; set; }

    // Navigation property to Hotspots
    public ICollection<Hotspot>? Hotspots { get; set; }
}

public class Hotspot
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    // Foreign key reference to Location
    public Guid? LocationId { get; set; }
    public Location? Location { get; set; }

    // Store User's email instead of ApplicationUserId
    public string? UserEmail { get; set; }  // Store email to link with User
}

public class Location
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    // Users that have this location as HomeLocation
    public ICollection<User>? Users { get; set; }

    // Hotspots associated with this location
    public ICollection<Hotspot>? Hotspots { get; set; }
}

