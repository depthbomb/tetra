namespace Tetra.Models.Responses.Links;

public record CreateLinkResponse
{
    /// <summary>
    ///     <p>The shortcode of the shortlink</p>
    /// </summary>
    /// <example>xYz</example>
    public string Shortcode { get; set; }
        
    /// <summary>
    ///     <p>The full shortlink</p>
    /// </summary>
    /// <example>https://website.com/xYz</example>
    public string Shortlink { get; set; }

    /// <summary>
    ///     <p>The HTTP/HTTPS URL that the shortlink will redirect to</p>
    /// </summary>
    /// <example>https://www.google.com/</example>
    public string Destination { get; set; }

    /// <summary>
    ///     <p>The deletion key that can be used to later delete this link</p>
    /// </summary>
    /// <example>PgfAI8RtcVdxlpefvAFA72BlsSymkjDjbOsP06nbKOCqFcfOnfnmy8GxL781klSO</example>
    public string DeletionKey { get; set; }

    /// <summary>
    ///     <p>The date in which this link will expire, if set</p>
    /// </summary>
    public DateTime? ExpiresAt { get; set; }
}
