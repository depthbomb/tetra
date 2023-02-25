namespace Tetra.Data.Entities;

public class BaseEntity
{
    /// <summary>
    /// The <see cref="DateTime"/> in which the entity was created.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    /// <summary>
    /// The <see cref="DateTime"/> in which the entity was last modified.
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
