using System.ComponentModel.DataAnnotations;
using backend.Models;

namespace backend.DTOs;

public class CreateUserDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public Role Role { get; set; } // Only Manager or Viewer can be created by CompanyAdmin
}

public class UpdateUserDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public Role Role { get; set; }
}

public class SendNotificationDto
{
    [Required]
    public string Message { get; set; } = string.Empty;
}
