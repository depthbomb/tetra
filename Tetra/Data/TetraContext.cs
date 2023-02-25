using Microsoft.EntityFrameworkCore;

using Tetra.Data.Entities;

namespace Tetra.Data;

public class TetraContext : DbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Link> Links => Set<Link>();

    #region Compiled Queries
    // User
    
    private static readonly Func<TetraContext, string, Task<User>> GetUserBySub
        = EF.CompileAsyncQuery((TetraContext context, string sub) => context.Users.FirstOrDefault(u => u.Sub == sub));
    
    private static readonly Func<TetraContext, string, Task<bool>> UserExists
        = EF.CompileAsyncQuery((TetraContext context, string sub) => context.Users.Any(u => u.Sub == sub));
    
    // Links
    
    private static readonly Func<TetraContext, Task<int>> LinksCount
        = EF.CompileAsyncQuery((TetraContext context) => context.Links.Count(l => l.Disabled == false));
    
    private static readonly Func<TetraContext, string, Task<Link>> GetLinkByShortcode
        = EF.CompileAsyncQuery((TetraContext context, string shortcode) => context.Links.FirstOrDefault(l => l.Shortcode == shortcode && l.Disabled == false));
    #endregion

    public TetraContext(DbContextOptions<TetraContext> options) : base(options) { }
    
    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = new())
    {
        var entities = ChangeTracker.Entries()
                                    .Where(e => e.State == EntityState.Modified)
                                    .Select(e => e.Entity)
                                    .Cast<BaseEntity>();
        
        foreach (var entity in entities)
        {
            entity.UpdatedAt = DateTime.UtcNow;
        }
        
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    /// <summary>
    /// Retrieves a user from their OpenID <paramref name="sub"/>.
    /// </summary>
    /// <param name="sub">OpenID sub as retrieved from a <c>/token</c> endpoint</param>
    /// <remarks>This is a compiled query</remarks>
    public async Task<User> GetUserBySubAsync(string sub) => await GetUserBySub(this, sub);
    
    /// <summary>
    /// Whether or not a user exists by their OpenID <paramref name="sub"/>.
    /// </summary>
    /// <param name="sub">OpenID sub as retrieved from a <c>/token</c> endpoint</param>
    /// <returns><c>true</c> if the user exists, <c>false</c> otherwise</returns>
    /// <remarks>This is a compiled query</remarks>
    public async Task<bool> UserExistsAsync(string sub) => await UserExists(this, sub);

    /// <summary>
    /// Returns the total number of created links that are not disabled
    /// </summary>
    public async Task<int> GetLinksCountAsync() => await LinksCount(this);

    /// <summary>
    /// 
    /// </summary>
    /// <param name="shortcode"></param>
    /// <returns></returns>
    public async Task<Link> GetLinkByShortcodeAsync(string shortcode) => await GetLinkByShortcode(this, shortcode);
}
