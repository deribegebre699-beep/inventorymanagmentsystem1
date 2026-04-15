using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Authorize(Policy = "SuperAdminRequired")]
[ApiController]
[Route("api/[controller]")]
public class CompaniesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CompaniesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetCompanies([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] bool all = false)
    {
        var query = _context.Companies.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(searchLower) || c.Email.ToLower().Contains(searchLower));
        }

        if (all)
        {
            var allCompanies = await query
                .OrderByDescending(c => c.Id)
                .Select(c => new { c.Id, c.Name, c.Email, c.CreatedAt })
                .ToListAsync();
            return Ok(allCompanies);
        }

        var totalCount = await query.CountAsync();

        var companies = await query
            .OrderByDescending(c => c.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new { c.Id, c.Name, c.Email, c.CreatedAt })
            .ToListAsync();

        return Ok(new PagedResponse<object>(companies, totalCount, page, pageSize));
    }

    [HttpPost]
    public async Task<IActionResult> CreateCompany([FromBody] CreateCompanyDto dto)
    {
        var email = dto.Email.Trim().ToLower();
        
        // Use IgnoreQueryFilters to check the ENTIRE database for email conflicts
        if (await _context.Companies.IgnoreQueryFilters().AnyAsync(c => c.Email.ToLower() == email))
            return BadRequest(new { message = "Company email already in use." });

        if (await _context.Users.IgnoreQueryFilters().AnyAsync(u => u.Email.ToLower() == email))
            return BadRequest(new { message = "User email already in use." });

        // Create the company and its admin user in a transaction
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var company = new Company
            {
                Name = dto.Name,
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
            };

            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            // Create the CompanyAdmin user linking to this company
            var companyAdmin = new User
            {
                Email = email,
                PasswordHash = company.PasswordHash,
                Role = Role.CompanyAdmin,
                CompanyId = company.Id
            };
            _context.Users.Add(companyAdmin);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return CreatedAtAction(nameof(GetCompanies), new { id = company.Id }, new { company.Id, company.Name, company.Email });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            Console.WriteLine($"[ERROR] Company creation failed: {ex.Message}");
            return StatusCode(500, new { message = "Failed to create company and admin user.", detail = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCompany(int id, [FromBody] UpdateCompanyDto dto)
    {
        var company = await _context.Companies.FindAsync(id);
        if (company == null) return NotFound("Company not found.");

        var email = dto.Email.Trim();
        if (company.Email != email && await _context.Companies.AnyAsync(c => c.Email == email))
            return BadRequest(new { message = "Email already in use." });

        // Update company admin username if email changes
        if (company.Email != email)
        {
            var adminUser = await _context.Users.FirstOrDefaultAsync(u => u.Role == Role.CompanyAdmin && u.CompanyId == company.Id);
            if (adminUser != null)
            {
                adminUser.Email = email;
            }
        }

        company.Name = dto.Name;
        company.Email = email;
        
        await _context.SaveChangesAsync();

        return Ok(new { company.Id, company.Name, company.Email });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCompany(int id)
    {
        var company = await _context.Companies.Include(c => c.Users).FirstOrDefaultAsync(c => c.Id == id);
        if (company == null) return NotFound("Company not found.");

        _context.Companies.Remove(company);
        await _context.SaveChangesAsync(); // Cascade will handle users/items if configured, else EF context deletes them

        return Ok(new { message = "Company deleted successfully." });
    }
}
