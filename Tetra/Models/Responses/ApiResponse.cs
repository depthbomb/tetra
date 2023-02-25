namespace Tetra.Models.Responses;

/// <summary>
///     Represents a standard API response
/// </summary>
public record ApiResponse
{
    /// <summary>
    ///     The ID associated with the request that created this response
    /// </summary>
    public string RequestId { get; set; }

    /// <summary>
    ///     An optional message that may further describe this response
    /// </summary>
    public string Message { get; set; } = null;
}
