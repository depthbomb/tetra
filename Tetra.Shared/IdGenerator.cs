using System.Security.Cryptography;

namespace Tetra.Shared;

public enum IdType
{
    Normal,
    Readable
}

public static class IdGenerator
{
    private const           string                Alphanumeric         = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
    private const           string                AlphanumericReadable = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789-_";
    private static readonly RandomNumberGenerator Rng                  = RandomNumberGenerator.Create();

    public static string Generate(int length, IdType type = IdType.Normal)
    {
        var characterSet = type == IdType.Normal ? Alphanumeric : AlphanumericReadable;
        
        var    chars = new char[length];
        byte[] data  = new byte[length];

        Rng.GetBytes(data);

        for (int i = 0; i < length; i++)
        {
            chars[i] = characterSet[data[i] % characterSet.Length];
        }

        return new string(chars);
    }
}
