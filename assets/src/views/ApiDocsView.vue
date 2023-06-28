<script setup lang="ts">
	import Endpoint from '~/components/api-docs/Endpoint.vue';
	import EndpointData from '~/components/api-docs/EndpointData.vue';
	import EndpointSchema from '~/components/api-docs/EndpointSchema.vue';
	import { Tab, TabList, TabGroup, TabPanel, TabPanels } from '@headlessui/vue';
</script>

<template>
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
				<p>All endpoints that return typical content responses support the following formats (via the <code>format</code> query string): <strong>json</strong>, <strong>yaml</strong>, <strong>xml</strong>, <strong>csv</strong> and <strong>php</strong>.</p>
				<p>Error responses returned by the API will include a <code>status</code> property representing the HTTP status code, a <code>message</code> property describing the problem, and a <code>request_id</code> property that can be used to help debug issues.</p>
			</TabPanel>
			<TabPanel>
				<p>All requests made to public API endpoints are subject to a single rate limit to help prevent abuse of the service. This rate limit is generous enough that you likely won't be limited from normal use.</p>
				<p>Requests made to endpoints protected by a rate limit will always return a set of response headers.</p>
				<ul class="my-3 space-y-1 list-none list-inside">
					<li class="ml-3 list-disc"><code>X-RateLimit-Limit</code> - The number of requests that can be made to the endpoint before being limited</li>
					<li class="ml-3 list-disc"><code>X-RateLimit-Remaining</code> - The number of requests remaining that can be made to the endpoint before being limited</li>
					<li class="ml-3 list-disc"><code>X-RateLimit-Reset</code> - The remaining time (in seconds) before the rate limit is reset</li>
					<li class="ml-3 list-disc"><code>X-RateLimit-Reset-After</code> - The epoch time (in seconds) at which the rate limit will reset</li>
				</ul>
				<p>Upon exceeding a rate limit you will get an HTTP 429 response with a JSON body which will include the typical error response as well as a <code>retry_after</code> field which includes the same value as the above corresponding header.</p>
				<p>Your applications that consume this service should rely on the <code>X-RateLimit-*</code> response headers or the <code>retry_after</code> field to ensure that you do not hit any rate limits.</p>
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
							name: 'created_at',
							type: 'ISO-8601 date',
							description: 'The date that the shortlink was created',
						},
						{
							name: 'expires_at',
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
							name: 'created_at',
							type: 'ISO-8601 date',
							description: 'The date that the shortlink was created',
						},
						{
							name: 'expires_at',
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

				<endpoint verb="GET" url="/api/v1/shortlinks/{shortcode}/qr-code" description="Gets an SVG QR code for the shortlink">
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
							description: 'PHP-compatible relative time format representing when the shortlink should expire',
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
							name: 'expires_at',
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
							description: 'PHP-compatible relative time format representing when the shortlink should expire',
							required: true
						},
					]"/>
					<endpoint-data type="response" :data="[
						{
							name: 'expires_at',
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
							name: 'regeneration_available',
							type: 'bool',
							description: 'Whether or not the API key can be regenerated'
						},
						{
							name: 'next_api_key_available',
							type: 'ISO-8601 date',
							description: 'The date in which the user\'s API key can be regenerated again'
						},
					]"/>
				</endpoint>

				<endpoint verb="POST" url="/api/v1/users/regenerate-api-key" description="Regenerates a user's API key">
					<endpoint-data type="request" :data="[
						{
							name: 'api_key',
							type: 'string',
							description: 'The API key belonging to the user',
							required: true
						},
					]"/>
					<endpoint-data type="response" :data="[
						{
							name: 'api_key',
							type: 'string',
							description: 'The user\'s new API key'
						},
						{
							name: 'next_api_key_available',
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
			@apply rounded;
			@apply outline-none;
			@apply transition-colors;

			@apply hover:text-white hover:bg-gray-700;
			@apply active:text-white active:bg-gray-950;

			&.is-selected {
				@apply text-white;
				@apply bg-brand-600;
			}
		}
	}
</style>
