using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ITenantService _tenantService;
    private readonly IEmailService _emailService;

    public AuthController(AppDbContext context, IConfiguration configuration, ITenantService tenantService, IEmailService emailService)
    {
        _context = context;
        _configuration = configuration;
        _tenantService = tenantService;
        _emailService = emailService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var email = dto.Email.Trim();
        
        // Find user by Email
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid credentials" });
        }

        var token = GenerateJwtToken(user);

        return Ok(new
        {
            token,
            user = new
            {
                user.Id,
                user.Email,
                user.Role,

                user.CompanyId
            }
        });
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userId = _tenantService.GetUserId();
        if (userId == null) return Unauthorized();

        var user = await _context.Users.FindAsync(userId.Value);
        if (user == null) return NotFound("User not found.");

        if (!BCrypt.Net.BCrypt.Verify(dto.OldPassword, user.PasswordHash))
            return BadRequest(new { message = "Invalid old password." });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Password updated successfully." });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        var email = dto.Email.Trim();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        if (user == null) return NotFound(new { message = "Email not found in our system." });

        // Generate 6-digit OTP
        var code = new Random().Next(100000, 999999).ToString();
        var otp = new OtpRecord
        {
            Email = dto.Email,
            Code = code,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10)
        };

        // Clear existing OTPs for this email
        var existing = _context.OtpRecords.Where(o => o.Email == dto.Email);
        _context.OtpRecords.RemoveRange(existing);

        _context.OtpRecords.Add(otp);
        await _context.SaveChangesAsync();

        var body = $@"
            <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 16px;'>
                <h2 style='color: #4f46e5; text-align: center;'>Reset Your Password</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password. Use the code below to complete the process:</p>
                <div style='background-color: #f8fafc; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; border-radius: 12px; margin: 20px 0;'>
                    {code}
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this, you can safely ignore this email.</p>
                <hr style='border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;' />
                <p style='font-size: 12px; color: #64748b; text-align: center;'>StockPro Inventory System</p>
            </div>";

        try
        {
            await _emailService.SendEmailAsync(dto.Email, "Reset Your Password - StockPro", body);
        }
        catch (Exception ex)
        {
            // For development: log the code so we can still test the flow if email fails
            Console.WriteLine("-----------------------------------");
            Console.WriteLine($"EMAIL SEND FAILURE: {ex.GetType().Name}: {ex.Message}");
            if (ex.InnerException != null)
                Console.WriteLine($"INNER: {ex.InnerException.GetType().Name}: {ex.InnerException.Message}");
            Console.WriteLine($"EMERGENCY OTP FOR {dto.Email}: {code}");
            Console.WriteLine("-----------------------------------");

            var fullError = ex.Message + (ex.InnerException != null ? " | " + ex.InnerException.Message : "");
            return StatusCode(500, new 
            { 
                message = "Failed to send OTP. Please check your email configuration.",
                technicalError = fullError
            });
        }

        return Ok(new { message = "OTP sent to your email." });
    }

    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto dto)
    {
        var email = dto.Email.Trim();
        var otp = await _context.OtpRecords
            .FirstOrDefaultAsync(o => o.Email.ToLower() == email.ToLower() && o.Code == dto.Code && o.ExpiresAt > DateTime.UtcNow);

        if (otp == null)
            return BadRequest(new { message = "Invalid or expired OTP." });

        return Ok(new { message = "OTP verified. You can now reset your password." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var email = dto.Email.Trim();
        var otp = await _context.OtpRecords
            .FirstOrDefaultAsync(o => o.Email.ToLower() == email.ToLower() && o.Code == dto.Code && o.ExpiresAt > DateTime.UtcNow);

        if (otp == null)
            return BadRequest(new { message = "Invalid or expired OTP." });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        if (user == null) return NotFound("User no longer exists.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        
        // Remove the OTP after use
        _context.OtpRecords.Remove(otp);
        
        await _context.SaveChangesAsync();

        return Ok(new { message = "Password reset successfully. You can now log in." });
    }

    private string GenerateJwtToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString())

        };

        if (user.CompanyId.HasValue)
        {
            claims.Add(new Claim("CompanyId", user.CompanyId.Value.ToString()));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddDays(7);

        var token = new JwtSecurityToken(
            _configuration["Jwt:Issuer"],
            _configuration["Jwt:Audience"],
            claims,
            expires: expires,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
