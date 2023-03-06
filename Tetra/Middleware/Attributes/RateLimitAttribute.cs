using System.Net;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Concurrent;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Tetra.Middleware.Attributes;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public class RateLimitAttribute : ActionFilterAttribute
{
    private readonly int                                        _limit;
    private readonly TimeSpan                                   _expiryTime;
    private readonly ConcurrentDictionary<IPAddress, RateLimit> _rateLimits;

    /// <summary>
    ///     Creates a request rate limiter on a controller or controller action
    /// </summary>
    /// <param name="limit">The maximum number of requests</param>
    /// <param name="seconds">When the rate limit expires in seconds</param>
    /// <param name="minutes">When the rate limit expires in minutes</param>
    /// <param name="hours">When the rate limit expires in hours</param>
    /// <remarks><paramref name="seconds"/>, <paramref name="minutes"/>, and <paramref name="hours"/> arguments may be combined</remarks>
    public RateLimitAttribute(int limit, int seconds = 0, int minutes = 0, int hours = 0)
    {
        _limit      = limit;
        _expiryTime = new TimeSpan(hours, minutes, seconds);
        _rateLimits = new ConcurrentDictionary<IPAddress, RateLimit>();

        if (_expiryTime.TotalSeconds < 1)
        {
            throw new ArgumentException("Total expiry time must be at least 1 second");
        }
    }

    public override async Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
    {
        var ipAddress = context.HttpContext.Connection.RemoteIpAddress;
        if (ipAddress != null)
        {
            var rateLimit = _rateLimits.GetOrAdd(ipAddress, new RateLimit(_limit, _expiryTime));

            context.HttpContext.Response.Headers.Add("X-RateLimit-Limit", _limit.ToString());

            var allowed   = rateLimit.AllowRequest();
            var resetTime = rateLimit.GetRetryAfterTime().ToString();
            
            context.HttpContext.Response.Headers.Add("X-RateLimit-Remaining", rateLimit.GetRemainingRequests().ToString());
            context.HttpContext.Response.Headers.Add("X-RateLimit-Reset", resetTime);

            if (!allowed)
            {
                context.HttpContext.Response.Headers.Add("Retry-After", resetTime);
                context.Result = new StatusCodeResult(429);
            }
        }

        await base.OnResultExecutionAsync(context, next);
    }

    private class RateLimit
    {
        private readonly int                             _limit;
        private readonly TimeSpan                        _expiryTime;
        private readonly ConcurrentQueue<DateTimeOffset> _requestTimes;

        public RateLimit(int limit, TimeSpan expiryTime)
        {
            _limit        = limit;
            _expiryTime   = expiryTime;
            _requestTimes = new ConcurrentQueue<DateTimeOffset>();
        }

        public bool AllowRequest()
        {
            PruneExpiredRequests();
            if (_requestTimes.Count < _limit)
            {
                _requestTimes.Enqueue(DateTimeOffset.UtcNow);
                return true;
            }

            return false;
        }

        public int GetRemainingRequests()
        {
            PruneExpiredRequests();
            return _limit - _requestTimes.Count;
        }

        public int GetRetryAfterTime()
        {
            var time = TimeSpan.Zero;
            if (_requestTimes.TryPeek(out var oldest))
            {
                var retryAfter = (oldest + _expiryTime) - DateTimeOffset.UtcNow;
                if (retryAfter.TotalMilliseconds > 0)
                {
                    time = retryAfter;
                }
            }

            return Convert.ToInt32(time.TotalSeconds);
        }

        private void PruneExpiredRequests()
        {
            while (_requestTimes.TryPeek(out var oldest) && oldest + _expiryTime < DateTimeOffset.UtcNow)
            {
                _requestTimes.TryDequeue(out _);
            }
        }
    }
}
