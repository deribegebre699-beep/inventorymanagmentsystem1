namespace backend.DTOs;

public class CreateCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int? ParentCategoryId { get; set; }
    public string? PhotoUrl { get; set; }
}

public class UpdateCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int? ParentCategoryId { get; set; }
    public string? PhotoUrl { get; set; }
}
