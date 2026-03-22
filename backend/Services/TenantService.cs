using System.Security.Claims;

namespace backend.Services;

public class TenantService : ITenantService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public TenantService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public int? GetCompanyId()
    {
        var claim = _httpContextAccessor.HttpContext?.User?.FindFirst("CompanyId")?.Value;
        return int.TryParse(claim, out var companyId) ? companyId : null;
    }

    public int? GetUserId()
    {
        var claim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var userId) ? userId : null;
    }

    public string? GetUserRole()
    {
        return _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Role)?.Value;
    }
}
