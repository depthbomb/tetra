using System.Security.Cryptography;

namespace Tetra.Shared;

public static class IdGenerator
{
    private static readonly RandomNumberGenerator Rng = RandomNumberGenerator.Create();

    public static string Generate(int length)
    {
        if (length <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(length), "Length must be greater than zero.");
        }
        
        byte[] bytes = new byte[length];
        
        Rng.GetBytes(bytes);

        var base64 = Convert.ToBase64String(bytes)
                            .Replace("+", "-")
                            .Replace("/", "_")
                            .Replace("=", "");

        return base64[..length];
    }
}
