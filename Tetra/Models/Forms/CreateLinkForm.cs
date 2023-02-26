using System.ComponentModel.DataAnnotations;

namespace Tetra.Models.Forms;

public record CreateLinkForm
{
    /// <summary>
    ///     A valid HTTP/HTTPS URL that the shortlink will redirect to
    /// </summary>
    [Required]
    public string Destination { get; set; }

    /// <summary>
    ///     <p>A human-readable "duration" string that determines when the shortlink should expire</p>
    ///     <p>Example: 1y2mo3w4d5h6m7s8ms</p>
    ///     <p>Spaces may separate both value and unit: 1y 2 mo 3w 4 d 5h 6 m 7s 8 ms</p>
    /// </summary>
    public string Duration { get; set; } = null;

    /// <summary>
    ///     <p>The date in which the shortlink should expire, overrides duration</p>
    ///     <p>Supports various date formats, see <a href="https://www.utctime.net/">https://www.utctime.net/</a></p>
    /// </summary>
    public DateTime? ExpiresAt { get; set; } = null;
}
