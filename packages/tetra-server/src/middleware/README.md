# Middleware

These are middleware similar to what can be seen in Express-like web applications.

### AddUserMiddleware

This middleware adds the currently-authenticated user to the request object if the JWT can be extracted from the request.

### AuthMiddleware

This middleware asserts that the request is coming from an authenticated user by checking for the presence of a non-undefined `user` property on the request object.

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
