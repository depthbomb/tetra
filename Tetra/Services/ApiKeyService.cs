using Tetra.Shared;
using Tetra.Data.Entities;

namespace Tetra.Services;

public class ApiKeyService
{
    private readonly ILogger<ApiKeyService> _logger;
    private readonly TetraContext           _db;

    public ApiKeyService(ILogger<ApiKeyService> logger, TetraContext db)
    {
        _logger = logger;
        _db     = db;
    }

    public async Task<ApiKey> CreateAsync(Guid userId)
    {
        var apiKey = CreateApiKey(userId);
        
        await _db.ApiKeys.AddAsync(apiKey);
        await _db.SaveChangesAsync();
        
        _logger.LogInformation("Created new API key ({Key}) for user {User}", apiKey.Key, userId);

        return apiKey;
    }
    
    public async Task<ApiKey> RegenerateAsync(Guid userId)
    {
        var existingApiKey = await _db.GetApiKeyByUserIdAsync(userId);
        if (existingApiKey != null)
        {
            _db.Remove(existingApiKey);
        }

        var apiKey = CreateApiKey(userId);

        await _db.ApiKeys.AddAsync(apiKey);
        await _db.SaveChangesAsync();
        
        _logger.LogInformation("Regenerated API key for user {User}", userId);

        return apiKey;
    }

    private ApiKey CreateApiKey(Guid userId)
    {
        return new ApiKey
        {
            UserId = userId,
            Key    = IdGenerator.Generate(64)
        };
    }
}
