using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.IO;
using backend.Data;
using backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ----------------------
// Controllers & JSON
// ----------------------
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });


// ----------------------
// Swagger
// ----------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Inventory API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ----------------------
// Database (Supabase PostgreSQL)
// ----------------------
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"), 
        npgsqlOptionsAction: sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(10),
                errorCodesToAdd: null);
            sqlOptions.CommandTimeout(90);
        }));


// ----------------------
// Services
// ----------------------
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ITenantService, TenantService>();
builder.Services.AddScoped<IEmailService, EmailService>();

// ----------------------
// JWT Authentication
// ----------------------
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
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
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

// ----------------------
// Authorization Policies
// ----------------------
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("SuperAdminRequired", policy => policy.RequireRole("SuperAdmin"));
    options.AddPolicy("CompanyAdminRequired", policy => policy.RequireRole("SuperAdmin", "CompanyAdmin"));
    options.AddPolicy("ManagerRequired", policy => policy.RequireRole("SuperAdmin", "CompanyAdmin", "Manager"));
});

// CORS (local + Vercel)
// builder.Services.AddCors(options =>
// {
//     options.AddPolicy("AllowFrontend",
//         builder => builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
// });


// ----------------------
// CORS (local + Vercel)
// ----------------------
builder.Services.AddCors(options => {
    options.AddPolicy("AllowFrontend", policy =>{
        policy
               .SetIsOriginAllowed(origin => 
                origin.Contains("localhost")||
                origin.Contains("vercel.app"))
                .AllowAnyHeader()
                .AllowAnyMethod();
                
    });
});


var app = builder.Build();

// Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
// {
//     app.UseSwagger();
//     app.UseSwaggerUI();
// }
// else 
// {
//     app.UseHttpsRedirection();
// }

// ----------------------
// Swagger always enabled
// ----------------------
app.UseSwagger();
app.UseSwaggerUI();



// ----------------------
// Static file uploads
// ----------------------
var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});



// ----------------------
// Middleware order
// ----------------------
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
