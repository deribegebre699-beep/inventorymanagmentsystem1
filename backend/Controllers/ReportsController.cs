using System.Security.Claims;
using backend.Data;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly IEmailService _emailService;
    private readonly AppDbContext _context;

    public ReportsController(IEmailService emailService, AppDbContext context)
    {
        _emailService = emailService;
        _context = context;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var items = await _context.Items.ToListAsync();
        var categories = await _context.Categories.CountAsync();

        var summary = new SummaryDto
        {
            TotalItems = items.Count,
            TotalQuantity = items.Sum(i => i.Quantity),
            TotalValue = items.Sum(i => (decimal)i.Quantity * i.Price),
            TotalCategories = categories,
            LowStockItemsCount = items.Count(i => i.Quantity <= 10)
        };

        return Ok(summary);
    }

    [HttpPost("send-email")]
    public async Task<IActionResult> SendReportEmail([FromForm] SendReportDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.ToEmail))
        {
            return BadRequest(new { message = "Recipient email is required." });
        }

        var senderEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty;

        try
        {
            await _emailService.SendEmailWithAttachmentsAsync(
                dto.ToEmail,
                senderEmail, // CC sender
                dto.Subject,
                dto.Body,
                dto.Attachments
            );

            return Ok(new { message = "Report email sent successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to send report email.", error = ex.Message });
        }
    }
}
