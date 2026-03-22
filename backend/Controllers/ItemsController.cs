using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ItemsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetItems([FromQuery] int? categoryId)
    {
        var query = _context.Items.Include(i => i.Category).AsQueryable();

        if (categoryId.HasValue)
        {
            query = query.Where(i => i.CategoryId == categoryId.Value);
        }

        var items = await query
            .Select(i => new
            {
                i.Id,
                i.Name,
                i.Description,
                i.Price,
                i.Quantity,
                i.QuantityType,
                CategoryName = i.Category != null ? i.Category.Name : string.Empty,
                i.CategoryId,
                i.PhotoUrl
            })
            .ToListAsync();

        return Ok(items);
    }

    [Authorize(Policy = "ManagerRequired")]
    [HttpPost]
    public async Task<IActionResult> CreateItem([FromBody] CreateItemDto dto)
    {
        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId);
        if (!categoryExists) return BadRequest(new { message = "Category does not exist. Must create category first." });

        if (dto.Quantity < 0) return BadRequest(new { message = "Initial quantity cannot be less than zero." });

        var item = new Item
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            Quantity = dto.Quantity,
            CategoryId = dto.CategoryId,
            QuantityType = string.IsNullOrWhiteSpace(dto.QuantityType) ? "units" : dto.QuantityType,
            PhotoUrl = dto.PhotoUrl
        };

        _context.Items.Add(item);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetItems), new { id = item.Id }, item);
    }

    [Authorize(Policy = "ManagerRequired")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateItem(int id, [FromBody] UpdateItemDto dto)
    {
        var item = await _context.Items.FindAsync(id);
        if (item == null) return NotFound("Item not found.");

        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId);
        if (!categoryExists) return BadRequest(new { message = "Category does not exist." });

        item.Name = dto.Name;
        item.Description = dto.Description;
        item.Price = dto.Price;
        item.CategoryId = dto.CategoryId;
        item.PhotoUrl = dto.PhotoUrl;

        await _context.SaveChangesAsync();

        return Ok(item);
    }

    [Authorize(Policy = "ManagerRequired")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteItem(int id)
    {
        var item = await _context.Items.FindAsync(id);
        if (item == null) return NotFound("Item not found.");

        _context.Items.Remove(item);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Item deleted successfully." });
    }

    [Authorize(Policy = "ManagerRequired")]
    [HttpPost("{id}/stock")]
    public async Task<IActionResult> AdjustStock(int id, [FromBody] AdjustStockDto dto)
    {
        var item = await _context.Items.FindAsync(id);
        if (item == null) return NotFound("Item not found.");

        if (item.Quantity + dto.Amount < 0)
        {
            return BadRequest(new { message = "Stock quantity cannot go below zero." });
        }

        item.Quantity += dto.Amount;
        await _context.SaveChangesAsync();

        return Ok(new { item.Id, item.Quantity });
    }
}
