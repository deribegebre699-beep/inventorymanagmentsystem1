using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Services;
using System.Security.Claims;


namespace backend.Controllers;

[Authorize(Policy = "CompanyAdminRequired")]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;

    public UsersController(AppDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var query = _context.Users
            .Where(u => u.Role == Role.Manager || u.Role == Role.Viewer)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(u => u.Email.ToLower().Contains(searchLower));
        }

        var totalCount = await query.CountAsync();

        var users = await query
            .OrderByDescending(u => u.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new { u.Id, u.Email, u.Role, u.CompanyId })
            .ToListAsync();

        return Ok(new PagedResponse<object>(users, totalCount, page, pageSize));
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
    {
        if (dto.Role != Role.Manager && dto.Role != Role.Viewer)
            return BadRequest(new { message = "Can only create Managers or Viewers." });

        if (await _context.Users.IgnoreQueryFilters().AnyAsync(u => u.Email == dto.Email))
            return BadRequest(new { message = "Email already in use." });

        var user = new User
        {
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = dto.Role
        };

        _context.Users.Add(user);
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            var inner = ex.InnerException;
            while (inner != null && !(inner is Npgsql.PostgresException))
            {
                inner = inner.InnerException;
            }

            if (inner is Npgsql.PostgresException pgEx && pgEx.SqlState == "23505")
            {
                return BadRequest(new { message = "Email or Username already in use." });
            }
            return StatusCode(500, new { message = "An error occurred while saving the user.", detail = ex.Message });
        }

        return CreatedAtAction(nameof(GetUsers), new { id = user.Id }, new { user.Id, user.Email, user.Role });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null || user.Role == Role.CompanyAdmin || user.Role == Role.SuperAdmin) 
            return NotFound("User not found or cannot be modified.");

        if (dto.Role != Role.Manager && dto.Role != Role.Viewer)
            return BadRequest(new { message = "Invalid role specified." });

        if (user.Email != dto.Email && await _context.Users.IgnoreQueryFilters().AnyAsync(u => u.Email == dto.Email))
            return BadRequest(new { message = "Email already in use." });

        user.Email = dto.Email;
        user.Role = dto.Role;
        
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            var inner = ex.InnerException;
            while (inner != null && !(inner is Npgsql.PostgresException))
            {
                inner = inner.InnerException;
            }

            if (inner is Npgsql.PostgresException pgEx && pgEx.SqlState == "23505")
            {
                return BadRequest(new { message = "Email or Username already in use." });
            }
            return StatusCode(500, new { message = "An error occurred while updating the user.", detail = ex.Message });
        }
        return Ok(new { user.Id, user.Email, user.Role });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null || user.Role == Role.CompanyAdmin || user.Role == Role.SuperAdmin) 
            return NotFound("User not found or cannot be modified.");

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "User deleted successfully." });
    }

    [HttpPost("{id}/notify")]
    public async Task<IActionResult> NotifyUser(int id, [FromBody] SendNotificationDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound("User not found.");

        // Get current user (sender)
        var senderIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int.TryParse(senderIdStr, out var senderId);
        var senderEmail = User.FindFirstValue(ClaimTypes.Email) ?? "Admin";

        // Save notification to database
        var notification = new Notification
        {
            SenderId = senderId,
            RecipientId = user.Id,
            Message = dto.Message,
            SentAt = DateTime.UtcNow,
            IsRead = false,
            SenderEmail = senderEmail,
            RecipientEmail = user.Email
        };
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        // Aggregate inventory metrics for the report
        var categories = await _context.Categories
            .Include(c => c.Items)
            .ToListAsync();

        var totalItems = categories.Sum(c => c.Items.Count);
        var totalQuantity = categories.Sum(c => c.Items.Sum(i => i.Quantity));
        var totalValue = categories.Sum(c => c.Items.Sum(i => i.Quantity * (decimal)i.Price));

        var sb = new System.Text.StringBuilder();
        sb.Append("<h2>Inventory Summary Report</h2>");
        sb.Append($"<p><strong>Total Item Types:</strong> {totalItems}</p>");
        sb.Append($"<p><strong>Total Stock Quantity:</strong> {totalQuantity}</p>");
        sb.Append($"<p><strong>Estimated Inventory Value:</strong> ${totalValue:N2}</p>");
        sb.Append("<hr/>");
        sb.Append("<h3>Message from Administrator:</h3>");
        sb.Append($"<p>{dto.Message}</p>");
        sb.Append("<hr/>");
        sb.Append("<h3>Categorized Inventory List:</h3>");

        foreach (var cat in categories)
        {
            sb.Append($"<div><strong>Category: {cat.Name}</strong>");
            if (cat.Items.Any())
            {
                sb.Append("<ul>");
                foreach (var item in cat.Items)
                {
                    sb.Append($"<li>{item.Name}: {item.Quantity} in stock (@ ${item.Price:N2}/ea)</li>");
                }
                sb.Append("</ul>");
            }
            else
            {
                sb.Append("<p><i>No items in this category.</i></p>");
            }
            sb.Append("</div>");
        }

        await _emailService.SendEmailAsync(user.Email, "Inventory Flow - Dashboard Report", sb.ToString());

        return Ok(new { message = $"Detailed notification sent to {user.Email} successfully." });
    }
}
