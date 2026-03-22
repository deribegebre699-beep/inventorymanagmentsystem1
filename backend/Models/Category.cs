using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend.Models;

public class Category
{
    public int Id { get; set; }
    
    [Required]
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string? PhotoUrl { get; set; }

    public int CompanyId { get; set; }
    
    // Self-referencing relationship for subcategories
    public int? ParentCategoryId { get; set; }

    [JsonIgnore]
    public Category? ParentCategory { get; set; }

    [JsonIgnore]
    public ICollection<Category> SubCategories { get; set; } = new List<Category>();

    [JsonIgnore]
    public Company? Company { get; set; }

    [JsonIgnore]
    public ICollection<Item> Items { get; set; } = new List<Item>();
}
