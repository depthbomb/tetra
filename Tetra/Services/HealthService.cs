namespace Tetra.Services;

public class HealthService
{
    private readonly TetraContext _db;

    public HealthService(TetraContext db)
    {
        _db = db;
    }

    public async Task<bool> IsDatabaseConnectableAsync() => await _db.Database.CanConnectAsync();
}
