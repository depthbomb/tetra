<script setup lang="ts">

</script>

<template>
    <div class="Sheet">
        <p>
            All public API endpoints are rate limited to 2 requests per second. Going over this limit will result in an HTTP 429 error. Your current rate limit info can be obtained from the response headers: <code>X-RateLimit-Limit</code>, <code>X-RateLimit-Remaining</code>, and <code>X-RateLimit-Reset</code>.
        </p>
        <p class="mt-3">
            All API endpoints require a version specified in the request headers (<code>X-Api-Version: 1</code>, for example). Lower versions may be deprecated after a newer version is available and you will get an error response when attempting to use deprecated endpoints.
        </p>

        <hr>

        <h2>Creating shortlinks</h2>
        <p>To create a shortlink, send a <code>POST</code> request to <code>/api/links/create</code> with a <code>destination</code> URL.</p>
        <p>You can optionally set the duration in which the links expires with the <a href="https://github.com/vercel/ms" target="_blank">ms</a>-style <code>duration</code> field. If you would rather set an exact date, you can set the <code>expiresAt</code> field to a date string in ISO-8601 format.</p>
    </div>
</template>

<style scoped lang="scss">
.Sheet {
    @apply block;
    @apply p-4;
    @apply text-black text-lg;
    @apply bg-white;
    @apply rounded-3xl;
    @apply shadow;

    a {
        @apply text-brand-700;
        @apply underline;
    }

    h2 {
        @apply mb-3;
        @apply text-xl;
        @apply font-bold;
    }

    hr {
        @apply block;
        @apply my-9;
        @apply h-[3px];
        @apply bg-gray-200;
        @apply rounded-full;
    }

    code {
        @apply text-base font-mono text-brand-800;
    }
}
</style>
