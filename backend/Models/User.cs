using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend.Models;

public class User
{
    public int Id { get; set; }
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [JsonIgnore]
    public string PasswordHash { get; set; } = string.Empty;

    public Role Role { get; set; }

    public int? CompanyId { get; set; }
    
    [JsonIgnore]
    public Company? Company { get; set; }
}
