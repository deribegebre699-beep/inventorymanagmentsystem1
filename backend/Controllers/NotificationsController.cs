using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public NotificationsController(AppDbContext context)
    {
        _context = context;
    }

    private int GetCurrentUserId()
    {
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int.TryParse(idStr, out var id);
        return id;
    }

    /// <summary>
    /// Get received notifications for the current user
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetReceivedNotifications()
    {
        var userId = GetCurrentUserId();
        var notifications = await _context.Notifications
            .Where(n => n.RecipientId == userId)
            .OrderByDescending(n => n.SentAt)
            .Select(n => new
            {
                n.Id,
                n.SenderId,
                n.SenderEmail,
                n.RecipientId,
                n.RecipientEmail,
                n.Message,
                n.SentAt,
                n.IsRead
            })
            .ToListAsync();
        return Ok(notifications);
    }

    /// <summary>
    /// Get sent notifications by the current user
    /// </summary>
    [HttpGet("sent")]
    public async Task<IActionResult> GetSentNotifications()
    {
        var userId = GetCurrentUserId();
        var notifications = await _context.Notifications
            .Where(n => n.SenderId == userId)
            .OrderByDescending(n => n.SentAt)
            .Select(n => new
            {
                n.Id,
                n.SenderId,
                n.SenderEmail,
                n.RecipientId,
                n.RecipientEmail,
                n.Message,
                n.SentAt,
                n.IsRead
            })
            .ToListAsync();
        return Ok(notifications);
    }

    /// <summary>
    /// Get unread count for the current user
    /// </summary>
    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userId = GetCurrentUserId();
        var count = await _context.Notifications
            .CountAsync(n => n.RecipientId == userId && !n.IsRead);
        return Ok(new { count });
    }

    /// <summary>
    /// Mark a notification as read
    /// </summary>
    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var userId = GetCurrentUserId();
        var notification = await _context.Notifications.FindAsync(id);
        if (notification == null || notification.RecipientId != userId)
            return NotFound("Notification not found.");

        notification.IsRead = true;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Marked as read." });
    }

    /// <summary>
    /// Mark all notifications as read
    /// </summary>
    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = GetCurrentUserId();
        var unread = await _context.Notifications
            .Where(n => n.RecipientId == userId && !n.IsRead)
            .ToListAsync();
        
        foreach (var n in unread)
            n.IsRead = true;
        
        await _context.SaveChangesAsync();
        return Ok(new { message = $"Marked {unread.Count} notifications as read." });
    }
}
