using System.ComponentModel.DataAnnotations;

namespace Tetra.Data.Entities;

public class Link : BaseEntity
{
    [Key]
    public Guid Id { get; set; }

    public string    CreatorId   { get; set; }
    public string    Shortcode   { get; set; }
    public string    Shortlink   { get; set; }
    public string    Destination { get; set; }
    public string    DeletionKey { get; set; }
    public bool      Disabled    { get; set; }
    public DateTime? ExpiresAt   { get; set; }
    public User      User        { get; set; }
}
