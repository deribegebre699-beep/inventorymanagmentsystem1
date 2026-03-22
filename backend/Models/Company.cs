using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend.Models;

public class Company
{
    public int Id { get; set; }
    
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [JsonIgnore]
    public string PasswordHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [JsonIgnore]
    public ICollection<User> Users { get; set; } = new List<User>();
    
    [JsonIgnore]
    public ICollection<Category> Categories { get; set; } = new List<Category>();
    
    [JsonIgnore]
    public ICollection<Item> Items { get; set; } = new List<Item>();
}
