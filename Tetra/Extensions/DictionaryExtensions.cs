namespace Tetra.Extensions;

public static class DictionaryExtensions
{
    public static bool TryGetValueAs<TKey, TValue, TValueAs>(this IDictionary<TKey, TValue> dict, TKey key, out TValueAs valueAs)
        where TValueAs : TValue
    {
        if (dict.TryGetValue(key, out TValue value))
        {
            valueAs = (TValueAs)value;
            return true;
        }

        valueAs = default;
        return false;
    }
}
