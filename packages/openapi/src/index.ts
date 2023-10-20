import yaml from 'yaml';
import { z } from 'zod';
import { OpenAPIRegistry, OpenApiGeneratorV31, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import {
	ApiKey,
	Secret,
	Shortcode,
	FeatureName,
	ListUsersResponse,
	ListFeaturesQuery,
	AppVersionResponse,
	ApiKeyInfoResponse,
	CreateShortlinkBody,
	RegenerateApiKeyBody,
	ListFeaturesResponse,
	ShortlinkInfoResponse,
	ToggleFeatureResponse,
	SetShortlinkExpiryBody,
	ListShortlinksResponse,
	CreateShortlinkResponse,
	ToggleShortlinkResponse,
	CountShortlinksResponse,
	RegenerateApiKeyResponse,
	ListAllShortlinksResponse,
	SetShortlinkExpiryResponse,
	ShortcodeAvailabilityResponse,
} from '@tetra/schema';

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

/*
|--------------------------------------------------------------------------
| Parameters
|--------------------------------------------------------------------------
*/

const ShortcodeParameter = registry.registerParameter('Shortcode', Shortcode.openapi({
	param: {
		name: 'shortcode',
		in: 'path'
	},
	examples: ['_k9']
}));
const ApiKeyParameter = registry.registerParameter('ApiKey', ApiKey.optional().openapi({
	param: {
		name: 'apiKey',
		in: 'query'
	},
	examples: ['B01A5c5e7AAaF2Dd9d9241eC923Afe2fDe1F8dd1A2050B263eb28D86dF704eae']
}));
const SecretParameter = registry.registerParameter('Secret', Secret.openapi({
	param: {
		name: 'secret',
		in: 'path'
	},
	examples: ['BWzHQLE6rcu38wdVDxJKjR0ctKhp2GKFQf1zi2knuyVqG6uF7HCauCuXyhRv1D4T']
}));
const FeatureNameParameter = registry.registerParameter('FeatureName', FeatureName.openapi({
	param: {
		name: 'name',
		in: 'path'
	},
	examples: ['SHORTLINK_REDIRECTION']
}));

const ErrorResponseSchema = registry.register('ErrorResponse', z.object({
	requestId: z.string().openapi({
		description: 'Unique identifier to identify the request'
	}),
	code: z.number().openapi({
		description: 'The HTTP status code of the response',
		examples: [400, 401, 403, 404, 429, 500, 501, 503]
	}),
	message: z.string().openapi({
		description: 'A message describing the error'
	}),
	stackTrace: z.string().optional().openapi({
		description: 'Only present when the service is running in development mode'
	})
}).strict());

const AppVersionResponseSchema = registry.register('AppVersionResponse', AppVersionResponse);

const ListFeaturesQuerySchema = registry.register('ListFeaturesQuery', ListFeaturesQuery);
const ListFeaturesResponseSchema = registry.register('ListFeaturesResponse', ListFeaturesResponse);
const ToggleFeatureResponseSchema = registry.register('ToggleFeatureResponse', ToggleFeatureResponse);

const ListShortlinksResponseSchema = registry.register('ListShortlinksResponse', ListShortlinksResponse);
const ListAllShortlinksResponseSchema = registry.register('ListAllShortlinksResponse', ListAllShortlinksResponse);
const CountShortlinksResponseSchema = registry.register('CountShortlinksResponse', CountShortlinksResponse);
const ShortlinkInfoResponseSchema = registry.register('ShortlinkInfoResponse', ShortlinkInfoResponse);
const CreateShortlinkBodySchema = registry.register('CreateShortlinkBody', CreateShortlinkBody);
const CreateShortlinkResponseSchema = registry.register('CreateShortlinkResponse', CreateShortlinkResponse);
const ShortcodeAvailabilityResponseSchema = registry.register('ShortcodeAvailabilityResponse', ShortcodeAvailabilityResponse);
const SetShortlinkExpiryBodySchema = registry.register('SetShortlinkExpiryBody', SetShortlinkExpiryBody);
const SetShortlinkExpiryResponseSchema = registry.register('SetShortlinkExpiryResponse', SetShortlinkExpiryResponse);
const ToggleShortlinkResponseSchema = registry.register('ToggleShortlinkResponse', ToggleShortlinkResponse);

const ListUsersResponseSchema = registry.register('ListUsersResponse', ListUsersResponse);
const ApiKeyInfoResponseSchema = registry.register('ApiKeyInfoResponse', ApiKeyInfoResponse);
const RegenerateApiKeyBodySchema = registry.register('RegenerateApiKeyBody', RegenerateApiKeyBody);
const RegenerateApiKeyResponseSchema = registry.register('RegenerateApiKeyResponse', RegenerateApiKeyResponse);

/*
|--------------------------------------------------------------------------
| Paths
|--------------------------------------------------------------------------
*/

// --- SHORTLINKS --- //

registry.registerPath({
	method: 'get',
	path: '/api/v1/shortlinks',
	tags: ['shortlinks'],
	description: 'Returns all shortlinks for a user',
	summary: 'Returns all shortlinks for a user',
	request: {
		query: z.object({ apiKey: ApiKeyParameter })
	},
	responses: {
		200: {
			description: 'Successful operation',
			content: {
				'application/json': {
					schema: ListShortlinksResponseSchema
				}
			}
		},
		500: {
			description: 'Server error',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		}
	}
});

registry.registerPath({
	method: 'get',
	path: '/api/v1/shortlinks/all',
	tags: ['shortlinks'],
	description: 'Returns all shortlinks, **requires admin priviledges**',
	summary: 'Returns all shortlinks',
	request: {
		query: z.object({ apiKey: ApiKeyParameter })
	},
	responses: {
		200: {
			description: 'Successful operation',
			content: {
				'application/json': {
					schema: ListAllShortlinksResponseSchema
				}
			}
		},
		403: {
			description: 'Insufficient priviledges',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		},
		500: {
			description: 'Server error',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		}
	}
});

registry.registerPath({
	method: 'get',
	path: '/api/v1/shortlinks/count',
	tags: ['shortlinks'],
	description: 'Returns the number of non-disabled shortlinks',
	summary: 'Returns the number of non-disabled shortlinks',
	responses: {
		200: {
			description: 'Successful operation',
			content: {
				'application/json': {
					schema: CountShortlinksResponseSchema
				}
			}
		},
		500: {
			description: 'Server error',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		}
	}
});

registry.registerPath({
	method: 'get',
	path: '/api/v1/shortlinks/{shortcode}',
	tags: ['shortlinks'],
	description: 'Returns info about a shortlink',
	summary: 'Returns info about a shortlink',
	request: {
		params: z.object({ shortcode: ShortcodeParameter })
	},
	responses: {
		200: {
			description: 'Successful operation',
			content: {
				'application/json': {
					schema: ShortlinkInfoResponseSchema
				}
			}
		},
		404: {
			description: 'Shortlink doesn\'t exist',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		}
	}
});

registry.registerPath({
	method: 'put',
	path: '/api/v1/shortlinks',
	tags: ['shortlinks'],
	description: 'Creates a shortlink',
	summary: 'Creates a shortlink',
	request: {
		query: z.object({ apiKey: ApiKeyParameter }),
		body: {
			content: {
				'application/json': {
					schema: CreateShortlinkBodySchema
				}
			}
		}
	},
	responses: {
		201: {
			description: 'Successful operation',
			content: {
				'application/json': {
					schema: CreateShortlinkResponseSchema
				}
			}
		},
		400: {
			description: 'Invalid request',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		},
		500: {
			description: 'Server error',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		}
	}
});

registry.registerPath({
	method: 'delete',
	path: '/api/v1/shortlinks/{shortcode}/{secret}',
	tags: ['shortlinks'],
	description: 'Deletes a shortlink',
	summary: 'Deletes a shortlink',
	request: {
		params: z.object({ shortcode: ShortcodeParameter, secret: SecretParameter })
	},
	responses: {
		200: {
			description: 'Successful or unsuccessful operation',
			content: {
				'application/json': {
					schema: {}
				}
			}
		},
		404: {
			description: 'Shortlink doesn\'t exist or invalid shortlink secret',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		},
		500: {
			description: 'Server error',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		}
	}
});

registry.registerPath({
	method: 'get',
	path: '/api/v1/shortlinks/{shortcode}/available',
	tags: ['shortlinks'],
	description: 'Whether a shortcode is available',
	summary: 'Whether a shortcode is available',
	request: {
		params: z.object({ shortcode: ShortcodeParameter })
	},
	responses: {
		200: {
			description: 'Successful operation',
			content: {
				'application/json': {
					schema: ShortcodeAvailabilityResponseSchema
				}
			}
		},
		500: {
			description: 'Server error',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		},
	}
});

registry.registerPath({
	method: 'patch',
	path: '/api/v1/shortlinks/{shortcode}/{secret}/set_expiry',
	tags: ['shortlinks'],
	description: 'Sets when an existing shortlink should expire',
	summary: 'Sets when an existing shortlink should expire',
	request: {
		params: z.object({ shortcode: ShortcodeParameter, secret: SecretParameter }),
		body: {
			content: {
				'application/json': {
					schema: SetShortlinkExpiryBodySchema
				}
			}
		}
	},
	responses: {
		200: {
			description: 'Successful operation',
			content: {
				'application/json': {
					schema: SetShortlinkExpiryResponseSchema
				}
			}
		},
		400: {
			description: 'Invalid request',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		},
	}
});

registry.registerPath({
	method: 'patch',
	path: '/api/v1/shortlinks/{shortcode}/toggle',
	tags: ['shortlinks'],
	description: 'Enables/disables a shortlink, **requires admin priviledges**',
	summary: 'Enables/disables a shortlink',
	request: {
		params: z.object({ shortcode: ShortcodeParameter }),
		query: z.object({ apiKey: ApiKeyParameter })
	},
	responses: {
		200: {
			description: 'Successful operation',
			content: {
				'application/json': {
					schema: ToggleShortlinkResponseSchema
				}
			}
		},
		403: {
			description: 'Insufficient priviledges',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		},
		404: {
			description: 'Shortlink doesn\'t exist',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		}
	}
});

registry.registerPath({
	method: 'get',
	path: '/api/v1/shortlinks/{shortcode}/qrcode.svg',
	tags: ['shortlinks'],
	description: 'Gets a QR code of the shortlink\'s destination',
	summary: 'Gets a QR code of the shortlink\'s destination',
	request: {
		params: z.object({ shortcode: ShortcodeParameter }),
	},
	responses: {
		200: {
			description: 'This endpoint returns an `image/svg+xml` response',
		},
		400: {
			description: 'Invalid request',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		},
		404: {
			description: 'Shortlink doesn\'t exist',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		}
	}
});

// --- USERS --- //

registry.registerPath({
	method: 'get',
	path: '/api/v1/users',
	tags: ['users'],
	description: 'Returns basic info on all users, **requires admin priviledges**',
	summary: 'Returns basic info on all users, requires admin priviledges',
	request: {
		query: z.object({ apiKey: ApiKeyParameter })
	},
	responses: {
		200: {
			description: 'Successful operation',
			content: {
				'application/json': {
					schema: ListUsersResponseSchema
				}
			}
		},
		403: {
			description: 'Insufficient priviledges',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		}
	}
});

registry.registerPath({
	method: 'get',
	path: '/api/v1/users/api_key_info',
	tags: ['users'],
	description: 'Returns info about the provided API key',
	summary: 'Returns info about the provided API key',
	request: {
		query: z.object({ apiKey: ApiKeyParameter })
	},
	responses: {
		200: {
			description: 'Successful operation',
			content: {
				'application/json': {
					schema: ApiKeyInfoResponseSchema
				}
			}
		},
		400: {
			description: 'Invalid or missing API key',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		}
	}
});

registry.registerPath({
	method: 'post',
	path: '/api/v1/users/regenerate_api_key',
	tags: ['users'],
	description: 'Regenerates the API key for the user',
	summary: 'Regenerates the API key for the user',
	request: {
		body: {
			content: {
				'application/json': {
					schema: RegenerateApiKeyBodySchema
				}
			}
		}
	},
	responses: {
		200: {
			description: 'Successful operation',
			content: {
				'application/json': {
					schema: RegenerateApiKeyResponseSchema
				}
			}
		},
		400: {
			description: 'Invalid or missing API key',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		}
	}
});

// --- APP --- //

registry.registerPath({
	method: 'get',
	path: '/api/app_version',
	tags: ['app'],
	description: 'Returns the current revision of the application',
	summary: 'Returns the current revision of the application',
	responses: {
		200: {
			description: 'Successful operation',
			content: {
				'application/json': {
					schema: AppVersionResponseSchema
				}
			}
		},
		500: {
			description: 'Server error',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		}
	}
});

// --- FEATURES --- //

registry.registerPath({
	method: 'get',
	path: '/api/v1/features',
	tags: ['features'],
	description: 'Returns all features, **requires admin priviledges**',
	summary: 'Returns all features, requires admin priviledges',
	request: {
		query: ListFeaturesQuerySchema
	},
	responses: {
		200: {
			description: 'Successful operation',
			content: {
				'application/json': {
					schema: ListFeaturesResponseSchema
				}
			}
		},
		400: {
			description: 'Invalid or missing API key',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		},
		403: {
			description: 'Insufficient priviledges',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		}
	}
});

registry.registerPath({
	method: 'patch',
	path: '/api/v1/features/{name}/enable',
	tags: ['features'],
	description: 'Enables a feature, **requires admin priviledges**',
	summary: 'Enables a feature, requires admin priviledges',
	request: {
		params: z.object({ name: FeatureNameParameter }),
		query: ListFeaturesQuerySchema
	},
	responses: {
		200: {
			description: 'Successful operation',
			content: {
				'application/json': {
					schema: ToggleFeatureResponseSchema
				}
			}
		},
		400: {
			description: 'Invalid or missing API key',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		},
		403: {
			description: 'Insufficient priviledges',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		},
		404: {
			description: 'Feature does not exist',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		}
	}
});

registry.registerPath({
	method: 'patch',
	path: '/api/v1/features/{name}/disable',
	tags: ['features'],
	description: 'Disables a feature, **requires admin priviledges**',
	summary: 'Disables a feature, requires admin priviledges',
	request: {
		params: z.object({ name: FeatureNameParameter }),
		query: ListFeaturesQuerySchema
	},
	responses: {
		200: {
			description: 'Successful operation',
			content: {
				'application/json': {
					schema: ToggleFeatureResponseSchema
				}
			}
		},
		400: {
			description: 'Invalid or missing API key',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		},
		403: {
			description: 'Insufficient priviledges',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		},
		404: {
			description: 'Feature does not exist',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		}
	}
});

registry.registerPath({
	method: 'patch',
	path: '/api/v1/features/{name}/toggle',
	tags: ['features'],
	description: 'Toggles a feature, **requires admin priviledges**',
	summary: 'Toggles a feature, requires admin priviledges',
	request: {
		params: z.object({ name: FeatureNameParameter }),
		query: ListFeaturesQuerySchema
	},
	responses: {
		200: {
			description: 'Successful operation',
			content: {
				'application/json': {
					schema: ToggleFeatureResponseSchema
				}
			}
		},
		400: {
			description: 'Invalid or missing API key',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		},
		403: {
			description: 'Insufficient priviledges',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		},
		404: {
			description: 'Feature does not exist',
			content: {
				'application/json': {
					schema: ErrorResponseSchema
				}
			}
		}
	}
});

/*
|--------------------------------------------------------------------------
| Generator
|--------------------------------------------------------------------------
*/

const description = [
	'go.super.fish provides a free public API so that you may integrate the site\'s functionality into your own projects.',
	'',
	'---',
	'',
	'## Guidelines',
	'',
	'### Rate Limits',
	'',
	'Rate limits are utilized across public endpoints to prevent abuse and overloading the service. Because rate limits are subject to change, your applications should parse the response headers to respond accordingly:',
	'',
	'- `X-RateLimit-Limit` - The number of tokens that the bucket holds\n',
	'- `X-RateLimit-Cost` - The number of tokens that are consumed from the bucket per request\n',
	'- `X-RateLimit-Remaining` - The number of tokens remaining in the bucket\n',
	'- `X-RateLimit-Reset` - The datetime at which the tokens in the bucket are reset\n',
	'- `X-RateLimit-Reset-After` - The time remaining in seconds at which the tokens in the bucket are reset\n',
	'- `X-RateLimit-Bucket` - The unique identifier of the bucket that is being consumed from\n',
	'',
	'Responses absent of a `X-RateLimit-Bucket` header should be assumed to be under a per-endpoint rate limit. Being rate limited on a per-endpoint basis has no impact on other per-endpoint rate limits.',
	'',
	'Exceeding a rate limit will result in a HTTP `429` error. Your application should rely on the `X-RateLimit-Reset` or `X-RateLimit-Reset-After` response headers to determine when to retry the request.',
	'',
	'### User Agents',
	'',
	'Your application is required to include a valid user agent to identify its requests. Failure to do so will result in a HTTP `400` error.',
	'',
	'### Content Types',
	'',
	'**PUT** and **POST** requests may be `application/json`, or `application/x-www-form-urlencoded`. Responses will always be returned as `application/json` unless specified otherwise. Requests using any other content type may return a HTTP `422` error.',
	'',
	'### Endpoint Deprecation',
	'',
	'Endpoints may be deprecated to be removed in future versions. Endpoints that have been deprecated will include additional headers in their responses named or prefixed with `Deprecated`. A `Deprecated-Alternative` header may be present that provides an alternative, non-deprecated endpoint as a replacement.',
	'',
	'```',
	'Deprecated: This endpoint has been deprecated and will be removed in v2.',
	'Deprecated-Alternative: /api/v2/new_endpoint',
	'```',
	'',
	'Endpoints that have been removed will return a HTTP `410` error and an object with values similar to info that can be found in the deprecation headers:',
	'',
	'```json',
	'{',
	'	"message": "This endpoint has been deprecated since v1 and has been removed in v2. Refer to the API documentation for more info.",',
	'	"alternative": "/api/v2/new_endpoint',
	'}',
	'```'
].join('\n');

const generator = new OpenApiGeneratorV31(registry.definitions);

export function generateSpec(format: 'json' | 'yaml' = 'yaml'): string {
	const spec = generator.generateDocument({
		openapi: '3.1.0',
		info: {
			version: 'v1',
			title: 'go.super.fish API',
			description,
			license: {
				name: 'MIT',
				url: 'https://spdx.org/licenses/MIT.html'
			}
		},
		servers: [
			{ url: 'https://go.super.fish', description: 'Production server' },
			{ url: 'http://localhost:3000', description: 'Local development server' },
		],
	});

	if (format === 'yaml') {
		return yaml.stringify(spec);
	} else {
		return JSON.stringify(spec);
	}
}
