using System.ComponentModel.DataAnnotations;

namespace Tetra.Data.Entities;

public class ApiKey : BaseEntity
{
    [Key]
    public Guid Id { get; set; }

    public Guid   UserId { get; set; }
    public User   User   { get; set; }
    public string Key    { get; set; }

    /// <summary>
    ///     Whether or not a new API key can be requested
    /// </summary>
    public bool CanRequestNewKey()
    {
        var now        = DateTime.UtcNow;
        var difference = now - CreatedAt;

        return difference.TotalHours >= 1;
    }
}
