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
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CategoriesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetCategories([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] bool all = false)
    {
        var query = _context.Categories.Include(c => c.SubCategories).AsQueryable();

        if (!all)
        {
            query = query.Where(c => c.ParentCategoryId == null);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(searchLower) || (c.Description != null && c.Description.ToLower().Contains(searchLower)));
        }

        if (all)
        {
            var allCategories = await query
                .Select(c => new { 
                    c.Id, c.Name, c.Description, c.ParentCategoryId, c.PhotoUrl,
                    SubCategories = c.SubCategories.Select(sc => new {
                        sc.Id, sc.Name, sc.Description, sc.ParentCategoryId, sc.PhotoUrl
                    })
                })
                .ToListAsync();
            return Ok(allCategories);
        }

        var totalCount = await query.CountAsync();

        var categories = await query
            .OrderByDescending(c => c.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new { 
                c.Id, c.Name, c.Description, c.ParentCategoryId, c.PhotoUrl,
                SubCategories = c.SubCategories.Select(sc => new {
                    sc.Id, sc.Name, sc.Description, sc.ParentCategoryId, sc.PhotoUrl
                })
            })
            .ToListAsync();

        return Ok(new PagedResponse<object>(categories, totalCount, page, pageSize));
    }

    [Authorize(Policy = "ManagerRequired")]
    [HttpPost]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto dto)
    {
        // If ParentCategoryId is provided, validate it exists
        if (dto.ParentCategoryId.HasValue)
        {
            var parentExists = await _context.Categories.AnyAsync(c => c.Id == dto.ParentCategoryId.Value);
            if (!parentExists) return BadRequest(new { message = "Parent category not found." });
        }

        var category = new Category
        {
            Name = dto.Name,
            Description = dto.Description,
            ParentCategoryId = dto.ParentCategoryId,
            PhotoUrl = dto.PhotoUrl
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCategories), new { id = category.Id }, new { category.Id, category.Name, category.Description, category.ParentCategoryId, category.PhotoUrl });
    }

    [Authorize(Policy = "ManagerRequired")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryDto dto)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return NotFound("Category not found.");

        // Prevent setting a category as its own parent
        if (dto.ParentCategoryId.HasValue && dto.ParentCategoryId.Value == id)
            return BadRequest(new { message = "A category cannot be its own parent." });

        if (dto.ParentCategoryId.HasValue)
        {
            var parentExists = await _context.Categories.AnyAsync(c => c.Id == dto.ParentCategoryId.Value);
            if (!parentExists) return BadRequest(new { message = "Parent category not found." });
        }

        category.Name = dto.Name;
        category.Description = dto.Description;
        category.ParentCategoryId = dto.ParentCategoryId;
        category.PhotoUrl = dto.PhotoUrl;
        
        await _context.SaveChangesAsync();

        return Ok(new { category.Id, category.Name, category.Description, category.ParentCategoryId, category.PhotoUrl });
    }

    [Authorize(Policy = "ManagerRequired")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _context.Categories
            .Include(c => c.Items)
            .Include(c => c.SubCategories)
            .FirstOrDefaultAsync(c => c.Id == id);
        if (category == null) return NotFound("Category not found.");

        // Auto-delete subcategories and items (hard delete).
        // First, check if there are subcategories. If so, remove their items, then the subcategories.
        if (category.SubCategories.Any())
        {
            foreach (var subcat in category.SubCategories)
            {
                // We need to load items for subcategories explicitly since they weren't Included in the main query
                var subcatWithItems = await _context.Categories.Include(c => c.Items).FirstOrDefaultAsync(c => c.Id == subcat.Id);
                if (subcatWithItems != null && subcatWithItems.Items.Any())
                {
                    _context.Items.RemoveRange(subcatWithItems.Items);
                }
            }
            _context.Categories.RemoveRange(category.SubCategories);
        }

        // Delete items belonging directly to the main category
        if (category.Items.Any())
        {
            _context.Items.RemoveRange(category.Items);
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Category deleted successfully." });
    }
}
