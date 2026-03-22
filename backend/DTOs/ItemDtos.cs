namespace backend.DTOs;

public class CreateItemDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public int CategoryId { get; set; }
    public string QuantityType { get; set; } = "units";
    public string? PhotoUrl { get; set; }
}

public class UpdateItemDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int CategoryId { get; set; }
    public string? PhotoUrl { get; set; }
}

public class AdjustStockDto
{
    public int Amount { get; set; } // Positive to add, negative to subtract
}
