<script setup lang="ts">
	import FaqQuestion from '~/components/faq/FaqQuestion.vue';
</script>

<template>
	<faq-question>What formats are supported for durations when creating shortlinks?</faq-question>
	<div class="py-3 pl-3">
		<p>Durations are handled as naturally-spoken time strings such as <code>1 hour 30 seconds</code>. You can see more examples <a href="https://github.com/sapphiredev/utilities/tree/main/packages/duration#parsing-a-duration" target="_blank">here.</a></p>
	</div>

	<div class="MainCard-divider"></div>

	<faq-question>How short-lived can I make shortlinks?</faq-question>
	<div class="py-3 pl-3">
		<p>The minimum duration for a shortlink is <strong>one minute</strong>. However, shortlinks are not guaranteed to be deleted precisely when their expiration date arrives; there can be up to a one minute delay before a shortlink is deleted.</p>
	</div>

	<div class="MainCard-divider"></div>

	<faq-question>Are my shortlinks private?</faq-question>
	<div class="py-3 pl-3">
		<p>Publicly, yes. Admins, however, can see all shortlinks created as well as their destinations and who created them.</p>
	</div>

	<div class="MainCard-divider"></div>

	<faq-question>Can I view info about a shortlink without using the API?</faq-question>
	<div class="py-3 pl-3">
		<p>If you add a <code>+</code> to the end of a shortlink then you will be redirected to an info page about the shortlink.</p>
	</div>

	<div class="MainCard-divider"></div>

	<faq-question>Why can't you read my clipboard on Firefox?</faq-question>
	<div class="py-3 pl-3">
		<p>Later versions of Firefox does not allow websites to read the contents of your clipboard. However, you can enable this feature by setting <code>dom.events.asyncClipboard.readText</code> to <strong>true</strong> in your advanced preferences.</p>
		<p>The warning message will still appear after making this change but your clipboard will be able to be read with no issue.</p>
		<p>Be warned that this will allow other websites to read your clipboard as well.</p>
	</div>
</template>
