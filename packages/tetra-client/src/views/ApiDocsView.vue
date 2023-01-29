<script setup lang="ts">
const getLinkInfoResponse = JSON.stringify({
    destination: 'https://google.com',
    expiresAt: new Date()
}, null, 4);

const createLinkRequestBody = JSON.stringify({
    destination: 'string',
    duration: '\'vercel/ms\'-style time string',
    expiresAt: new Date()
}, null, 4);

const createLinkResponse = JSON.stringify({
    shortcode: 'xYz',
    destination: 'https://google.com',
    deletionKey: 'e44dd61a-9093-4ffd-b5e9-d897074494f0',
    expiresAt: new Date()
}, null, 4);
</script>

<template>
    <v-card class="w-75">
        <v-card-item>
            <v-card-title>Tetra API Docs</v-card-title>
        </v-card-item>
        <v-card-text>
            <p>All public API endpoints are rate limited to 2 requests per second. Going over this limit will result in an HTTP 429 error. Your current rate limit info can be obtained from the response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset`.</p>
            <p>Additionally, all endpoints are subject to a global rate limit of 5 requests per second.</p>

            <v-expansion-panels variant="popout" class="my-4">
                <v-expansion-panel>
                    <v-expansion-panel-title>
                        <v-chip color="blue">GET</v-chip>
                        <code class="mx-4">/api/links/info/{shortcode}</code>
                        <p>Retrieves basic info about a shortlink</p>
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                        <v-expansion-panels variant="popout">
                            <v-expansion-panel title="Example Response">
                                <v-expansion-panel-text>
                                    <hljs class="my-3" language="json" :code="getLinkInfoResponse"/>
                                    <p>The <var>expiresAt</var> property may be <var>null</var> if the link is not set to expire.</p>
                                </v-expansion-panel-text>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </v-expansion-panel-text>
                </v-expansion-panel>
                <!---->
                <v-expansion-panel>
                    <v-expansion-panel-title>
                        <v-chip color="green">POST</v-chip>
                        <code class="mx-3">/api/links/create</code>
                        <p>Creates a new shortlink</p>
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                        <v-expansion-panels variant="popout">
                            <v-expansion-panel title="Example Request Body">
                                <v-expansion-panel-text>
                                    <hljs class="my-3" language="json" :code="createLinkRequestBody"/>
                                    <p><var>duration</var> and <var>expiresAt</var> are both optional, and <var>expiresAt</var> overrides <var>duration</var>.</p>
                                </v-expansion-panel-text>
                            </v-expansion-panel>
                            <v-expansion-panel title="Example Response">
                                <v-expansion-panel-text>
                                    <hljs class="my-3" language="json" :code="createLinkResponse"/>
                                    <p>The <var>expiresAt</var> property may be <var>null</var> if the link is not set to expire.</p>
                                </v-expansion-panel-text>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </v-expansion-panel-text>
                </v-expansion-panel>
                <!---->
                <v-expansion-panel>
                    <v-expansion-panel-title>
                        <v-chip color="red">DELETE</v-chip>
                        <code class="mx-3">/api/links/delete/{shortcode}/{deletionKey}</code>
                        <p>Deletes a shortlink via its associated <var>shortcode</var> and <var>deletionKey</var></p>
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                        <p>No response content is returned regardless of whether the shortlink was deleted or not except if the link could not be found by the provided <var>shortcode</var>.</p>
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-card-text>
    </v-card>
</template>
