using System.ComponentModel.DataAnnotations;

namespace Tetra.Data.Entities;

public class User : BaseEntity
{
    [Key]
    public Guid Id { get; set; }

    public string       Sub      { get; set; }
    public string       Username { get; set; }
    public string       Email    { get; set; }
    public string       Avatar   { get; set; }
    public List<string> Roles    { get; set; }
}
