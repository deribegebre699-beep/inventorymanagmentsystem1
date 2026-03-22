using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UploadsController : ControllerBase
{
    private readonly IWebHostEnvironment _env;

    public UploadsController(IWebHostEnvironment env)
    {
        _env = env;
    }

    [HttpPost]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded." });
        }

        // Validate that it is an image
        var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType))
        {
            return BadRequest(new { message = "Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed." });
        }

        // Create wwwroot/uploads directory if it doesn't exist
        var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        // Generate a unique filename
        var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Construct the URL
        var request = HttpContext.Request;
        var appUrl = $"{request.Scheme}://{request.Host}";
        var photoUrl = $"{appUrl}/uploads/{fileName}";

        return Ok(new { url = photoUrl });
    }
}
