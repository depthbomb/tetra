using System.ComponentModel.DataAnnotations;

namespace Tetra.Models.Forms;

public record CreateLinkForm
{
    /// <summary>
    ///     A valid HTTP/HTTPS URL that the shortlink will redirect to
    /// </summary>
    /// <example>https://google.com</example>
    [Required]
    public string Destination { get; set; }

    /// <summary>
    ///     <p>A human-readable "duration" string that determines when the shortlink should expire</p>
    ///     <p>Spaces may separate both value and unit: 1y 2 mo 3w 4 d 5h 6 m 7s 8 ms</p>
    /// </summary>
    /// <example>1d 30m</example>
    public string Duration { get; set; } = null;

    /// <summary>
    ///     <p>The date in which the shortlink should expire, overrides duration</p>
    ///     <p>Supports various date formats, see <a href="https://www.utctime.net/">https://www.utctime.net/</a></p>
    /// </summary>
    public DateTime? ExpiresAt { get; set; } = null;
}
