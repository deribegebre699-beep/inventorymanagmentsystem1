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
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.Categories
            .Include(c => c.SubCategories)
            .Select(c => new { 
                c.Id, 
                c.Name, 
                c.Description, 
                c.ParentCategoryId,
                c.PhotoUrl,
                SubCategories = c.SubCategories.Select(sc => new {
                    sc.Id,
                    sc.Name,
                    sc.Description,
                    sc.ParentCategoryId,
                    sc.PhotoUrl
                })
            })
            .ToListAsync();
        return Ok(categories);
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

        if (category.Items.Any())
            return BadRequest(new { message = "Cannot delete category with items. Delete or reassign items first." });

        if (category.SubCategories.Any())
            return BadRequest(new { message = "Cannot delete category with subcategories. Delete subcategories first." });

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Category deleted successfully." });
    }
}
