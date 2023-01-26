# Middleware

These are middleware similar to what can be seen in Express-like web applications.

### AuthMiddleware

As its name implies, this middleware authenticates the current request with a JWT to persist the user's login state. The token can be extracted from one of three methods from the request in order of priority: Authorization header, cookie, query string.

### CspMiddleware

Sets Content-Security-Policy headers along with a _nonce_. Currently only applied to endpoints in the `SpaModule` where it is extracted and applied to generated static asset tags.

### CsrfValidatorMiddleware

Handles verifying a CSRF token included with the request body. The token is created and sent to the client via `SpaModule` and this middleware currently only applies to endpoints in the `InternalModule`.

### HttpLoggerMiddleware

Logs all incoming HTTP requests, including the request ID (see below), the method, and endpoint as well as the response code and total lifecycle time to the stdout.

### RequestIdMiddleware

Simply generates a unique ID for the current request and attaches it to the headers.

---

When writing new middleware, keep in mind that you may only inject dependencies that are imported into the module that the middleware is applied in. `CsrfValidatorMiddleware`, for example, can access the modules within `InternalModule`, such as `AuthModule`, since it is being applied there.
