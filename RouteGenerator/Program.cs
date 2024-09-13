using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;
using RouteGenerator.Areas.Identity.Data;
using RouteGenerator.Controllers;
using RouteGenerator.Models;


var builder = WebApplication.CreateBuilder(args);

// Add secrets from .json to config
var GoogleApiKey = builder.Configuration["GoogleMapsApiKey"];
ConfigSaves.GoogleMapsSecret = GoogleApiKey;

var connectionString = builder.Configuration.GetConnectionString("DBContextConnection") ?? throw new InvalidOperationException("Connection string 'DBContextConnection' not found.");

builder.Services.AddDbContext<DBContext>(options => options.UseSqlServer(connectionString));
builder.Services.AddScoped<CSVHandler>();  // Register the CSV service
builder.Services.AddDefaultIdentity<User>(options => options.SignIn.RequireConfirmedAccount = true).AddEntityFrameworkStores<DBContext>();

// Add services to the container.
builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapRazorPages();

//app.UseStaticFiles(new StaticFileOptions
//{
//    ContentTypeProvider = new FileExtensionContentTypeProvider
//    {
//        Mappings =
//        {
//            [".mp4"] = "video/mp4"
//        }
//    }
//});

app.Run();
