using Microsoft.EntityFrameworkCore;

using Tetra.Data.Entities;

namespace Tetra.Data;

public class TetraContext : DbContext
{
    public DbSet<User>   Users   => Set<User>();
    public DbSet<Link>   Links   => Set<Link>();
    public DbSet<ApiKey> ApiKeys => Set<ApiKey>();

    #region Compiled Queries
    // User
    
    private static readonly Func<TetraContext, Guid, Task<User>> GetUserById
        = EF.CompileAsyncQuery((TetraContext context, Guid id) => context.Users.FirstOrDefault(u => u.Id == id));
    
    private static readonly Func<TetraContext, string, Task<User>> GetUserBySub
        = EF.CompileAsyncQuery((TetraContext context, string sub) => context.Users.FirstOrDefault(u => u.Sub == sub));
    
    private static readonly Func<TetraContext, string, Task<bool>> UserExistsBySub
        = EF.CompileAsyncQuery((TetraContext context, string sub) => context.Users.Any(u => u.Sub == sub));
    
    private static readonly Func<TetraContext, string, Task<User>> GetUserByApiKey
        = EF.CompileAsyncQuery((TetraContext context, string key) => context.Users.FirstOrDefault(u => u.ApiKey.Key == key));
    
    private static readonly Func<TetraContext, Task<User>> GetAnonymousUser
        = EF.CompileAsyncQuery((TetraContext context) => context.Users.FirstOrDefault(u => u.Username == "Anonymous" && u.Anonymous));
    
    private static readonly Func<TetraContext, Task<int>> GetTotalUsersCount
        = EF.CompileAsyncQuery((TetraContext context) => context.Users.Count(u => u.Disabled == false));
    
    // API Keys

    private static readonly Func<TetraContext, Guid, Task<ApiKey>> GetApiKeyByUserId
        = EF.CompileAsyncQuery((TetraContext context, Guid id) => context.ApiKeys.FirstOrDefault(a => a.User.Id == id));
    
    // Links
    
    private static readonly Func<TetraContext, Task<int>> LinksCount
        = EF.CompileAsyncQuery((TetraContext context) => context.Links.Count(l => l.Disabled == false));
    
    private static readonly Func<TetraContext, string, Task<Link>> GetLinkByShortcode
        = EF.CompileAsyncQuery((TetraContext context, string shortcode) => context.Links.FirstOrDefault(l => l.Shortcode == shortcode && l.Disabled == false));

    private static readonly Func<TetraContext, string, Task<bool>> LinkExistsByShortcode
        = EF.CompileAsyncQuery((TetraContext context, string shortcode) => context.Links.Any(l => l.Shortcode == shortcode));
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
    ///     Retrieves a <see cref="User"/> from their <paramref name="id"/>.
    /// </summary>
    /// <param name="id">The user's <see cref="Guid"/></param>
    public async Task<User> GetUserByIdAsync(Guid id) => await GetUserById(this, id);
    
    /// <summary>
    ///     Retrieves a <see cref="User"/> from their OpenID <paramref name="sub"/>.
    /// </summary>
    /// <param name="sub">OpenID sub as retrieved from a <c>/token</c> endpoint</param>
    public async Task<User> GetUserBySubAsync(string sub) => await GetUserBySub(this, sub);
    
    /// <summary>
    ///     Whether or not a <see cref="User"/> exists by their OpenID <paramref name="sub"/>.
    /// </summary>
    /// <param name="sub">OpenID sub as retrieved from a <c>/token</c> endpoint</param>
    /// <returns><c>true</c> if the user exists, <c>false</c> otherwise</returns>
    public async Task<bool> UserExistsBySubAsync(string sub) => await UserExistsBySub(this, sub);

    /// <summary>
    ///     Retrieves a <see cref="User"/> from their API <paramref name="key"/>, if they have one.
    /// </summary>
    /// <param name="key">The user's API key that is generated upon visiting the "API Key" page on the frontend</param>
    public async Task<User> GetUserByApiKeyAsync(string key) => await GetUserByApiKey(this, key);

    /// <summary>
    ///     Retrieves the application's anonymous user if they exist.
    /// </summary>
    /// <returns></returns>
    public async Task<User> GetAnonymousUserAsync() => await GetAnonymousUser(this);

    /// <summary>
    ///     Returns the total number of <see cref="User"/>s that are not disabled.
    /// </summary>
    /// <returns></returns>
    public async Task<int> GetTotalUsersCountAsync() => await GetTotalUsersCount(this);

    /// <summary>
    ///     Retrieves an <see cref="ApiKey"/> from the owner's <paramref name="id"/>.
    /// </summary>
    /// <param name="id">A <see cref="User"/>'s <see cref="Guid"/></param>
    public async Task<ApiKey> GetApiKeyByUserIdAsync(Guid id) => await GetApiKeyByUserId(this, id);

    /// <summary>
    ///     Returns the total number of created <see cref="Link"/>s that are not disabled.
    /// </summary>
    public async Task<int> GetLinksCountAsync() => await LinksCount(this);

    /// <summary>
    ///     Returns a <see cref="Link"/> by its <paramref name="shortcode"/>.
    /// </summary>
    /// <param name="shortcode">The shortcode to use when looking for an existing link</param>
    public async Task<Link> GetLinkByShortcodeAsync(string shortcode) => await GetLinkByShortcode(this, shortcode);

    /// <summary>
    ///     Whether or not a <see cref="Link"/> exists by its <paramref name="shortcode"/>.
    /// </summary>
    /// <param name="shortcode">The shortcode to use when looking for an existing link</param>
    /// <returns><c>true</c> if a link exists by the provided shortcode, <c>false</c> otherwise</returns>
    public async Task<bool> LinkExistsByShortcodeAsync(string shortcode) => await LinkExistsByShortcode(this, shortcode);
}
