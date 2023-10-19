<script setup lang="ts">
	import Endpoint from '~/components/api-docs/Endpoint.vue';
	import EndpointData from '~/components/api-docs/EndpointData.vue';
	import EndpointSchema from '~/components/api-docs/EndpointSchema.vue';
	import { Tab, TabList, TabGroup, TabPanel, TabPanels } from '@headlessui/vue';
</script>

<template>
	<aside class="mb-6 py-2 px-4 text-white text-center bg-red-600 rounded-xl shadow" role="alert">
		<p>The API documentation is considered deprecated but operational. The documentation will be replaced with an OpenAPI spec soon.</p>
	</aside>

	<TabGroup>
		<TabList class="ApiTabs">
			<Tab as="template" v-slot="{ selected }">
				<button :class="['ApiTabs-button', { 'is-selected': selected }]">General Info</button>
			</Tab>
			<Tab as="template" v-slot="{ selected }">
				<button :class="['ApiTabs-button', { 'is-selected': selected }]">Rate Limits</button>
			</Tab>
			<Tab as="template" v-slot="{ selected }">
				<button :class="['ApiTabs-button', { 'is-selected': selected }]">Endpoints</button>
			</Tab>
		</TabList>

		<div class="MainCard-divider"></div>

		<TabPanels>
			<TabPanel>
				<p>The Tetra API allows you to integrate functionality for creating and deleting shortlinks into your own applications.</p>
				<p>All requests made to API endpoints that have a payload may either be <code>x-www-form-urlencoded</code> or <code>application/json</code>.</p>
				<p>All endpoints that return typical content responses support the following formats (via the <code>format</code> query string): <strong>json</strong>, <strong>yaml</strong>, and <strong>xml</strong>.</p>
				<p>Error responses returned by the API will include a <code>code</code> property representing the HTTP status code, a <code>message</code> property describing the problem, and a <code>requestId</code> property that can be used to help debug issues.</p>
			</TabPanel>
			<TabPanel>
				<p>Rate limits are utilized across public endpoints to prevent abuse and overloading the service. Because rate limits are subject to change, your applications should parse the response headers to respond accordingly:</p>
				<ul class="my-3 space-y-1 list-none list-inside">
					<li class="ml-3 list-disc"><code>X-RateLimit-Limit</code> - The number of tokens that the bucket holds</li>
					<li class="ml-3 list-disc"><code>X-RateLimit-Cost</code> - The number of tokens that are consumed from the bucket per request</li>
					<li class="ml-3 list-disc"><code>X-RateLimit-Remaining</code> - The number of tokens remaining in the bucket</li>
					<li class="ml-3 list-disc"><code>X-RateLimit-Reset</code> - The unix timestamp at which the tokens in the bucket are reset</li>
					<li class="ml-3 list-disc"><code>X-RateLimit-Reset-After</code> - The time remaining in seconds at which the tokens in the bucket are reset</li>
					<li class="ml-3 list-disc"><code>X-RateLimit-Bucket</code> - The unique identifier of the bucket that is being consumed from</li>
				</ul>
				<p>Exceeding a rate limit will result in a HTTP <code>429</code> error. Your application should rely on the <code>X-RateLimit-Reset</code> or <code>X-RateLimit-Reset-After</code> response headers to determine when to retry the request.</p>
			</TabPanel>
			<TabPanel>
				<h1 class="mb-3 font-bold text-xl">Shortlinks</h1>

				<endpoint verb="GET" url="/api/v1/shortlinks" description="Returns all shortlinks for a user">
					<p class="mb-3">This endpoint requires an API key sent with the request via a <code>api_key</code> query string.</p>

					<endpoint-data type="response" :data="[
						{
							name: '<root>',
							type: 'UserShortlinksResponse[]',
							description: 'An array of shortlinks for the user',
						}
					]"/>

					<endpoint-schema class="mt-6" name="UserShortlinksResponse" :data="[
						{
							name: 'shortcode',
							type: 'string',
							description: 'The shortlink\'s shortcode',
						},
						{
							name: 'shortlink',
							type: 'string',
							description: 'The shortlink itself',
						},
						{
							name: 'destination',
							type: 'string',
							description: 'The full HTTP/S URL that the shortlink redirects to',
						},
						{
							name: 'secret',
							type: 'string',
							description: 'The key used to modify or delete the shortlink',
						},
						{
							name: 'createdAt',
							type: 'ISO-8601 date',
							description: 'The date that the shortlink was created',
						},
						{
							name: 'expiresAt',
							type: 'ISO-8601 date',
							description: 'The date that the shortlink expires',
							nullable: true
						},
						{
							name: 'hits',
							type: 'int',
							description: 'The number of times the shortlink has been accessed'
						},
					]"/>
				</endpoint>

				<endpoint verb="GET" url="/api/v1/shortlinks/{shortcode}" description="Returns info about a shortlink">
					<endpoint-data type="response" :data="[
						{
							name: 'shortlink',
							type: 'string',
							description: 'The shortlink itself'
						},
						{
							name: 'destination',
							type: 'string',
							description: 'The full HTTP/S URL that the shortlink redirects to',
						},
						{
							name: 'createdAt',
							type: 'ISO-8601 date',
							description: 'The date that the shortlink was created',
						},
						{
							name: 'expiresAt',
							type: 'ISO-8601 date',
							description: 'The date that the shortlink expires',
							nullable: true,
						},
					]"/>
				</endpoint>

				<endpoint verb="GET" url="/api/v1/shortlinks/{shortcode}/availability" description="Checks shortcode availability">
					<endpoint-data type="response" :data="[
						{
							name: 'available',
							type: 'boolean',
							description: 'Whether or not the shortcode is available'
						},
					]"/>
				</endpoint>

				<endpoint verb="GET" url="/api/v1/shortlinks/{shortcode}/qrcode.svg" description="Gets an SVG QR code for the shortlink">
					<p>This endpoints returns an SVG string on success.</p>
				</endpoint>

				<endpoint verb="PUT" url="/api/v1/shortlinks" description="Creates a shortlink">
					<endpoint-data type="request" :data="[
						{
							name: 'destination',
							type: 'string',
							description: 'The full HTTP/S URL that the shortlink will redirect to',
							required: true,
						},
						{
							name: 'shortcode',
							type: 'string',
							description: 'A custom shortcode between 1 and 255 characters, allows characters a-z, 0-9, - and _',
						},
						{
							name: 'duration',
							type: 'string',
							description: 'Time string',
						},
					]"/>
					<endpoint-data type="response" :data="[
						{
							name: 'shortcode',
							type: 'string',
							description: 'The shortlink\'s shortcode',
						},
						{
							name: 'shortlink',
							type: 'string',
							description: 'The shortlink itself',
						},
						{
							name: 'destination',
							type: 'string',
							description: 'The full HTTP/S URL that the shortlink redirects to',
						},
						{
							name: 'secret',
							type: 'string',
							description: 'The key used to modify or delete the shortlink',
						},
						{
							name: 'expiresAt',
							type: 'ISO-8601 date',
							description: 'The date that the shortlink expires',
							nullable: true
						},
					]"/>
				</endpoint>

				<endpoint verb="PATCH" url="/api/v1/shortlinks/{shortcode}/{secret}/set-expiry" description="Sets the expiry for an existing shortlink">
					<endpoint-data type="request" :data="[
						{
							name: 'duration',
							type: 'string',
							description: 'Time string',
							required: true
						},
					]"/>
					<endpoint-data type="response" :data="[
						{
							name: 'expiresAt',
							type: 'ISO-8601 date',
							description: 'The date that the shortlink expires'
						},
					]"/>
				</endpoint>

				<endpoint verb="DELETE" url="/api/v1/shortlinks/{shortcode}/{secret}" description="Deletes a shortlink">
					<p>This endpoint returns a <code>200 OK</code> regardless of whether the shortlink was deleted or not.</p>
				</endpoint>

				<!-- END SHORTLINK ENDPOINTS --><div class="MainCard-divider"></div><!-- END SHORTLINK ENDPOINTS -->

				<h1 class="mb-3 font-bold text-xl">Users</h1>

				<endpoint verb="GET" url="/api/v1/users/api-key-status" description="Gets info about the status of a user's API key">
					<p class="mb-3">This endpoint requires an API key sent with the request via a <code>api_key</code> query string.</p>

					<endpoint-data type="response" :data="[
						{
							name: 'canRegenerate',
							type: 'bool',
							description: 'Whether or not the API key can be regenerated'
						},
						{
							name: 'nextApiKeyAvailable',
							type: 'ISO-8601 date',
							description: 'The date in which the user\'s API key can be regenerated again'
						},
					]"/>
				</endpoint>

				<endpoint verb="POST" url="/api/v1/users/regenerate-api-key" description="Regenerates a user's API key">
					<endpoint-data type="request" :data="[
						{
							name: 'apiKey',
							type: 'string',
							description: 'The API key belonging to the user',
							required: true
						},
					]"/>
					<endpoint-data type="response" :data="[
						{
							name: 'apiKey',
							type: 'string',
							description: 'The user\'s new API key'
						},
						{
							name: 'nextApiKeyAvailable',
							type: 'ISO-8601 date',
							description: 'The date in which the user\'s API key can be regenerated again'
						},
					]"/>
				</endpoint>
			</TabPanel>
		</TabPanels>
	</TabGroup>
</template>

<style scoped lang="scss">
	.ApiTabs {
		@apply flex items-center;
		@apply space-x-3;

		.ApiTabs-button {
			@apply py-1.5 px-4;
			@apply text-lg text-gray-300;
			@apply rounded-full;
			@apply outline-none;
			@apply transition-colors;

			@apply hover:text-white hover:bg-gray-700;
			@apply active:text-white active:bg-gray-600;

			&.is-selected {
				@apply text-white;
				@apply bg-brand-600;
			}
		}
	}
</style>
