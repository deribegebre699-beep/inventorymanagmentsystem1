namespace backend.DTOs;

public class CreateCompanyDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class UpdateCompanyDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}
