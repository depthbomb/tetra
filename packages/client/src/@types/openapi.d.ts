/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/api/v1/shortlinks": {
    /**
     * Returns all shortlinks for a user
     * @description Returns all shortlinks for a user
     */
    get: {
      parameters: {
        query?: {
          apiKey?: components["parameters"]["ApiKey"];
        };
      };
      responses: {
        /** @description Successful operation */
        200: {
          content: {
            "application/json": components["schemas"]["ListShortlinksResponse"];
          };
        };
        /** @description Server error */
        500: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
      };
    };
    /**
     * Creates a shortlink
     * @description Creates a shortlink
     */
    put: {
      parameters: {
        query?: {
          apiKey?: components["parameters"]["ApiKey"];
        };
      };
      requestBody?: {
        content: {
          "application/json": components["schemas"]["CreateShortlinkBody"];
        };
      };
      responses: {
        /** @description Successful operation */
        201: {
          content: {
            "application/json": components["schemas"]["CreateShortlinkResponse"];
          };
        };
        /** @description Invalid request */
        400: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
        /** @description Server error */
        500: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
      };
    };
  };
  "/api/v1/shortlinks/all": {
    /**
     * Returns all shortlinks
     * @description Returns all shortlinks, **requires admin priviledges**
     */
    get: {
      parameters: {
        query?: {
          apiKey?: components["parameters"]["ApiKey"];
        };
      };
      responses: {
        /** @description Successful operation */
        200: {
          content: {
            "application/json": components["schemas"]["ListAllShortlinksResponse"];
          };
        };
        /** @description Insufficient priviledges */
        403: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
        /** @description Server error */
        500: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
      };
    };
  };
  "/api/v1/shortlinks/count": {
    /**
     * Returns the number of non-disabled shortlinks
     * @description Returns the number of non-disabled shortlinks
     */
    get: {
      responses: {
        /** @description Successful operation */
        200: {
          content: {
            "application/json": components["schemas"]["CountShortlinksResponse"];
          };
        };
        /** @description Server error */
        500: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
      };
    };
  };
  "/api/v1/shortlinks/{shortcode}": {
    /**
     * Returns info about a shortlink
     * @description Returns info about a shortlink
     */
    get: {
      parameters: {
        path: {
          shortcode: components["parameters"]["Shortcode"];
        };
      };
      responses: {
        /** @description Successful operation */
        200: {
          content: {
            "application/json": components["schemas"]["ShortlinkInfoResponse"];
          };
        };
        /** @description Shortlink doesn't exist */
        404: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
      };
    };
  };
  "/api/v1/shortlinks/{shortcode}/{secret}": {
    /**
     * Deletes a shortlink
     * @description Deletes a shortlink
     */
    delete: {
      parameters: {
        path: {
          shortcode: components["parameters"]["Shortcode"];
          secret: components["parameters"]["Secret"];
        };
      };
      responses: {
        /** @description Successful or unsuccessful operation */
        200: {
          content: {
            "application/json": unknown;
          };
        };
        /** @description Shortlink doesn't exist or invalid shortlink secret */
        404: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
        /** @description Server error */
        500: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
      };
    };
  };
  "/api/v1/shortlinks/{shortcode}/available": {
    /**
     * Whether a shortcode is available
     * @description Whether a shortcode is available
     */
    get: {
      parameters: {
        path: {
          shortcode: components["parameters"]["Shortcode"];
        };
      };
      responses: {
        /** @description Successful operation */
        200: {
          content: {
            "application/json": components["schemas"]["ShortcodeAvailabilityResponse"];
          };
        };
        /** @description Server error */
        500: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
      };
    };
  };
  "/api/v1/shortlinks/{shortcode}/{secret}/set_expiry": {
    /**
     * Sets when an existing shortlink should expire
     * @description Sets when an existing shortlink should expire
     */
    patch: {
      parameters: {
        path: {
          shortcode: components["parameters"]["Shortcode"];
          secret: components["parameters"]["Secret"];
        };
      };
      requestBody?: {
        content: {
          "application/json": components["schemas"]["SetShortlinkExpiryBody"];
        };
      };
      responses: {
        /** @description Successful operation */
        200: {
          content: {
            "application/json": components["schemas"]["SetShortlinkExpiryResponse"];
          };
        };
        /** @description Invalid request */
        400: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
      };
    };
  };
  "/api/v1/shortlinks/{shortcode}/toggle": {
    /**
     * Enables/disables a shortlink
     * @description Enables/disables a shortlink, **requires admin priviledges**
     */
    patch: {
      parameters: {
        query?: {
          apiKey?: components["parameters"]["ApiKey"];
        };
        path: {
          shortcode: components["parameters"]["Shortcode"];
        };
      };
      responses: {
        /** @description Successful operation */
        200: {
          content: {
            "application/json": components["schemas"]["ToggleShortlinkResponse"];
          };
        };
        /** @description Insufficient priviledges */
        403: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
        /** @description Shortlink doesn't exist */
        404: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
      };
    };
  };
  "/api/v1/shortlinks/{shortcode}/qrcode.svg": {
    /**
     * Gets a QR code of the shortlink's destination
     * @description Gets a QR code of the shortlink's destination
     */
    get: {
      parameters: {
        path: {
          shortcode: components["parameters"]["Shortcode"];
        };
      };
      responses: {
        /** @description This endpoint returns an `image/svg+xml` response */
        200: {
          content: never;
        };
        /** @description Invalid request */
        400: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
        /** @description Shortlink doesn't exist */
        404: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
      };
    };
  };
  "/api/v1/users": {
    /**
     * Returns basic info on all users, requires admin priviledges
     * @description Returns basic info on all users, **requires admin priviledges**
     */
    get: {
      parameters: {
        query?: {
          apiKey?: components["parameters"]["ApiKey"];
        };
      };
      responses: {
        /** @description Successful operation */
        200: {
          content: {
            "application/json": components["schemas"]["ListUsersResponse"];
          };
        };
        /** @description Insufficient priviledges */
        403: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
      };
    };
  };
  "/api/v1/users/api_key_info": {
    /**
     * Returns info about the provided API key
     * @description Returns info about the provided API key
     */
    get: {
      parameters: {
        query?: {
          apiKey?: components["parameters"]["ApiKey"];
        };
      };
      responses: {
        /** @description Successful operation */
        200: {
          content: {
            "application/json": components["schemas"]["ApiKeyInfoResponse"];
          };
        };
        /** @description Invalid or missing API key */
        400: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
      };
    };
  };
  "/api/v1/users/regenerate_api_key": {
    /**
     * Regenerates the API key for the user
     * @description Regenerates the API key for the user
     */
    post: {
      requestBody?: {
        content: {
          "application/json": components["schemas"]["RegenerateApiKeyBody"];
        };
      };
      responses: {
        /** @description Successful operation */
        200: {
          content: {
            "application/json": components["schemas"]["RegenerateApiKeyResponse"];
          };
        };
        /** @description Invalid or missing API key */
        400: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
      };
    };
  };
  "/api/app_version": {
    /**
     * Returns the current revision of the application
     * @description Returns the current revision of the application
     */
    get: {
      responses: {
        /** @description Successful operation */
        200: {
          content: {
            "application/json": components["schemas"]["AppVersionResponse"];
          };
        };
        /** @description Server error */
        500: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
      };
    };
  };
  "/api/v1/features": {
    /**
     * Returns all features, requires admin priviledges
     * @description Returns all features, **requires admin priviledges**
     */
    get: {
      parameters: {
        query: {
          apiKey: string;
        };
      };
      responses: {
        /** @description Successful operation */
        200: {
          content: {
            "application/json": components["schemas"]["ListFeaturesResponse"];
          };
        };
        /** @description Invalid or missing API key */
        400: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
        /** @description Insufficient priviledges */
        403: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
      };
    };
  };
  "/api/v1/features/{name}/enable": {
    /**
     * Enables a feature, requires admin priviledges
     * @description Enables a feature, **requires admin priviledges**
     */
    patch: {
      parameters: {
        query: {
          apiKey: string;
        };
        path: {
          name: components["parameters"]["FeatureName"];
        };
      };
      responses: {
        /** @description Successful operation */
        200: {
          content: {
            "application/json": components["schemas"]["ToggleFeatureResponse"];
          };
        };
        /** @description Invalid or missing API key */
        400: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
        /** @description Insufficient priviledges */
        403: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
        /** @description Feature does not exist */
        404: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
      };
    };
  };
  "/api/v1/features/{name}/disable": {
    /**
     * Disables a feature, requires admin priviledges
     * @description Disables a feature, **requires admin priviledges**
     */
    patch: {
      parameters: {
        query: {
          apiKey: string;
        };
        path: {
          name: components["parameters"]["FeatureName"];
        };
      };
      responses: {
        /** @description Successful operation */
        200: {
          content: {
            "application/json": components["schemas"]["ToggleFeatureResponse"];
          };
        };
        /** @description Invalid or missing API key */
        400: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
        /** @description Insufficient priviledges */
        403: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
        /** @description Feature does not exist */
        404: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
      };
    };
  };
  "/api/v1/features/{name}/toggle": {
    /**
     * Toggles a feature, requires admin priviledges
     * @description Toggles a feature, **requires admin priviledges**
     */
    patch: {
      parameters: {
        query: {
          apiKey: string;
        };
        path: {
          name: components["parameters"]["FeatureName"];
        };
      };
      responses: {
        /** @description Successful operation */
        200: {
          content: {
            "application/json": components["schemas"]["ToggleFeatureResponse"];
          };
        };
        /** @description Invalid or missing API key */
        400: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
        /** @description Insufficient priviledges */
        403: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
        /** @description Feature does not exist */
        404: {
          content: {
            "application/json": components["schemas"]["ErrorResponse"];
          };
        };
      };
    };
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    ErrorResponse: {
      /** @description Unique identifier to identify the request */
      requestId: string;
      /** @description The HTTP status code of the response */
      code: number;
      /** @description A message describing the error */
      message: string;
      /** @description Only present when the service is running in development mode */
      stackTrace?: string;
    };
    AppVersionResponse: {
      hash: string;
    };
    ListFeaturesQuery: {
      apiKey: string;
    };
    ListFeaturesResponse: {
        name: string;
        enabled: boolean;
      }[];
    ToggleFeatureResponse: {
      old: boolean;
      new: boolean;
    };
    ListShortlinksResponse: {
        shortcode: string;
        /** Format: uri */
        shortlink: string;
        /** Format: uri */
        destination: string;
        secret: string;
        hits: number;
        createdAt: string;
        expiresAt?: string;
      }[];
    ListAllShortlinksResponse: {
        shortcode: string;
        /** Format: uri */
        shortlink: string;
        /** Format: uri */
        destination: string;
        secret: string;
        hits: number;
        createdAt: string;
        expiresAt?: string;
        creatorIp: string;
        disabled: boolean;
        user?: {
          username: string;
        };
      }[];
    CountShortlinksResponse: {
      count: number;
    };
    ShortlinkInfoResponse: {
      /** Format: uri */
      shortlink: string;
      /** Format: uri */
      destination: string;
      hits: number;
      createdAt: string;
      expiresAt?: string;
    };
    CreateShortlinkBody: {
      /** Format: uri */
      destination: string;
      shortcode?: string;
      duration?: string;
    };
    CreateShortlinkResponse: {
      shortcode: string;
      /** Format: uri */
      shortlink: string;
      /** Format: uri */
      destination: string;
      secret: string;
      expiresAt?: string;
    };
    ShortcodeAvailabilityResponse: {
      available: boolean;
    };
    SetShortlinkExpiryBody: {
      duration: string;
    };
    SetShortlinkExpiryResponse: {
      expiresAt: string;
    };
    ToggleShortlinkResponse: {
      disabled: boolean;
    };
    ListUsersResponse: {
        username: string;
        /** Format: uri */
        avatar: string;
        /** Format: email */
        email: string;
        /** @default false */
        admin: boolean;
      }[];
    ApiKeyInfoResponse: {
      canRegenerate: boolean;
      nextApiKeyAvailable: string;
    };
    RegenerateApiKeyBody: {
      apiKey: string;
    };
    RegenerateApiKeyResponse: {
      apiKey: string;
    };
    Shortcode: string;
    ApiKey: string;
    Secret: string;
    FeatureName: string;
  };
  responses: never;
  parameters: {
    Shortcode: components["schemas"]["Shortcode"];
    ApiKey?: components["schemas"]["ApiKey"];
    Secret: components["schemas"]["Secret"];
    FeatureName: components["schemas"]["FeatureName"];
  };
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type $defs = Record<string, never>;

export type external = Record<string, never>;

export type operations = Record<string, never>;
