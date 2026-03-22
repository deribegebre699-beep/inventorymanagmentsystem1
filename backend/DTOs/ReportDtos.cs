namespace backend.DTOs;

public class SendReportDto
{
    public string ToEmail { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public List<IFormFile> Attachments { get; set; } = new List<IFormFile>();
}

public class SummaryDto
{
    public int TotalItems { get; set; }
    public int TotalQuantity { get; set; }
    public decimal TotalValue { get; set; }
    public int TotalCategories { get; set; }
    public int LowStockItemsCount { get; set; }
}
