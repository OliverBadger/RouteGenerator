using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using RouteGenerator.Areas.Identity.Data;
using RouteGenerator.Models;
using System.Diagnostics;

namespace RouteGenerator.Controllers
{
    public class HomeController : Controller
    {
        private readonly UserManager<User> _userManager;

        public HomeController(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        public async Task<IActionResult> Index()
        {
            if (User.Identity.IsAuthenticated)
            {
                var user = await _userManager.GetUserAsync(User);

                // Pass user data to the view
                var model = new IndexModel
                {
                    FirstName = user.FirstName,
                    HomeLatitude = user.HomeLocation?.Latitude ?? 0.0, // Default to 0.0 if HomeLocation is null
                    HomeLongitude = user.HomeLocation?.Longitude ?? 0.0, // Default to 0.0 if HomeLocation is null
                    PreferredRouteLength = user.PreferredRouteLength > 0 ? user.PreferredRouteLength : 5.0 // Default to 5 km if null or 0
                };

                return View(model);
            }

            return View();
        }
    }
}
