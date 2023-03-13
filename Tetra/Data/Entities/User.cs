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
    public string       ApiKey   { get; set; }
    public bool         Disabled { get; set; }
    public bool         Admin     { get; set; }
    public bool         Anonymous { get; set; }
    public List<Link>   Links     { get; set; }
}
