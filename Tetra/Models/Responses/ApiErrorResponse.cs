namespace Tetra.Models.Responses;

/// <summary>
///     Represents a standard API error response
/// </summary>
public record ApiErrorResponse
{
    /// <summary>
    ///     The ID associated with the request that created this response
    /// </summary>
    /// <example>0HMORFQVBI8T5:00000001</example>
    public string RequestId { get; set; }

    /// <summary>
    ///     An optional message that may further describe this response
    /// </summary>
    /// <example>An error has occurred</example>
    public string Message { get; set; }
}
