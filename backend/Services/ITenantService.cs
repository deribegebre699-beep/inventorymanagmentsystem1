namespace backend.Services;

public interface ITenantService
{
    int? GetCompanyId();
    int? GetUserId();
    string? GetUserRole();
}
