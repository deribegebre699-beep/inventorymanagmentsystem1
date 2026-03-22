using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend.Models;

public class Item
{
    public int Id { get; set; }
    
    [Required]
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public int Quantity { get; set; }

    public string QuantityType { get; set; } = "units";

    public string? PhotoUrl { get; set; }

    public int CategoryId { get; set; }
    
    [JsonIgnore]
    public Category? Category { get; set; }

    public int CompanyId { get; set; }
    
    [JsonIgnore]
    public Company? Company { get; set; }
}
