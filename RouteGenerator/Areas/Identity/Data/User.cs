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
    /* Anything you are adding in here needs to be added in the DBContext Class */

    public string FirstName { get; set; }
    public string LastName { get; set; }

    [Required]
    public Location HomeLocation { get; set; }  // Custom location property

    public double PreferredRouteLength { get; set; }  // Custom preferred route length

    // Navigation property for Hotspots
    public ICollection<Hotspot> Hotspots { get; set; }
}

public class Hotspot
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    public Location Location { get; set; }

    // Foreign key to ApplicationUser
    public string ApplicationUserId { get; set; }
    public User User { get; set; }
}

public class Location
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}

