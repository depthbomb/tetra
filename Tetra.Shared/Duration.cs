using System.Text.RegularExpressions;

namespace Tetra.Shared;

/// <summary>
/// Provides a utility for parsing a duration string and returning a <see cref="TimeSpan"/>.
/// </summary>
public static class Duration
{
    private const double Year  = 365.25;
    private const double Month = 30.44;
    
    private static readonly Regex FormatPattern = new(@"(\d+)([a-zμ]+)", RegexOptions.Compiled);
    private static readonly Regex SpacePattern  = new(@"\s+", RegexOptions.Compiled);

    /// <summary>
    /// Parses the specified duration string and returns a <see cref="TimeSpan"/>.
    /// </summary>
    /// <param name="input">The duration string to parse.</param>
    /// <returns>A <see cref="TimeSpan"/> representing the duration specified by the input string.</returns>
    /// <exception cref="FormatException">
    /// Thrown if the input string is not in a recognized format or contains invalid values.
    /// </exception>
    public static TimeSpan Parse(string input)
    {
        var durationString = SpacePattern.Replace(input, string.Empty);
        var result         = TimeSpan.Zero;

        // Iterate over all matches of the format pattern in the input string.
        foreach (Match match in FormatPattern.Matches(durationString))
        {
            var numberMatch = match.Groups[1].Value;
            var unitMatch   = match.Groups[2].Value;

            // Attempt to parse the number value of the matched unit.
            if (int.TryParse(numberMatch, out int value))
            {
                // Add the appropriate time interval to the result based on the matched unit.
                result += unitMatch switch
                {
                    "mi" => TimeSpan.FromDays(value * Year * 1000),
                    "c"  => TimeSpan.FromDays(value * Year * 100),
                    "de" => TimeSpan.FromDays(value * Year * 10),
                    "y"  => TimeSpan.FromDays(value * Year),
                    "mo" => TimeSpan.FromDays(value * Month),
                    "w"  => TimeSpan.FromDays(value * 7),
                    "d"  => TimeSpan.FromDays(value),
                    "h"  => TimeSpan.FromHours(value),
                    "m"  => TimeSpan.FromMinutes(value),
                    "s"  => TimeSpan.FromSeconds(value),
                    "ms" => TimeSpan.FromMilliseconds(value),
                    "μ"  => TimeSpan.FromTicks(value * 10),
                    _    => throw new FormatException($"Unknown time unit \"{unitMatch}\".")
                };
            }
            else
            {
                // Throw an exception if the number value of the matched unit cannot be parsed as an integer.
                throw new FormatException($"Invalid value \"{numberMatch}\" for time unit \"{unitMatch}\".");
            }
        }

        return result;
    }
}
