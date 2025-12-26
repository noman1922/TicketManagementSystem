using TicketManagementSystemMongo.Data;
using TicketManagementSystemMongo.Models;
using MongoDB.Driver;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TicketManagementSystemMongo.Services; // ✅ Email Service 


var builder = WebApplication.CreateBuilder(args);

// ✅ MongoDB Context
builder.Services.AddSingleton<MongoDbContext>();

// ✅ Email Service - MUST BE HERE (BEFORE Build())
builder.Services.AddSingleton<EmailService>();

// ✅ Controllers + Views
builder.Services.AddControllersWithViews();

// ✅ CORS for React
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.WithOrigins("http://localhost:3000")
                        .AllowAnyHeader()
                        .AllowAnyMethod());
});

// ✅ Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Ticket Management System API",
        Version = "v1"
    });
});

// ✅ JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] 
                ?? throw new InvalidOperationException("JWT Key not configured")))
    };
});

var app = builder.Build();  // ✅ Build() comes AFTER all service registrations

// ✅ Test MongoDB Connection (COMMENT THIS OUT FOR NOW - it's causing issues)
/*
using (var scope = app.Services.CreateScope())
{
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<MongoDbContext>();
        
        // Try to list databases to test connection
        var client = new MongoClient(builder.Configuration["MongoDBSettings:ConnectionString"]);
        var databases = client.ListDatabaseNames().ToList();
        
        Console.WriteLine("✅ MongoDB Connected Successfully!");
        Console.WriteLine($"Available databases: {string.Join(", ", databases)}");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ MongoDB Connection Failed: {ex.Message}");
    }
}
*/

// ✅ Seed Data (COMMENT THIS OUT FOR NOW)
/*
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<MongoDbContext>();
    // ... your seed code stays exactly the same
}
*/

// ✅ Swagger UI
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Ticket Management System API v1");
        c.RoutePrefix = string.Empty;
    });
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

// ✅ Enable CORS
app.UseCors("AllowReactApp");

// ✅ Enable Authentication + Authorization
app.UseAuthentication();
app.UseAuthorization();

// ✅ Map Controllers
app.MapControllers();

// ✅ MVC Default Route (optional HomeController)
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();