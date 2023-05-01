<script setup lang="ts">
	import FaqQuestion from '~/components/faq/FaqQuestion.vue';
</script>

<template>
	<faq-question>What formats are supported for durations when creating shortlinks?</faq-question>
	<div class="pl-3">
		<p>Durations are defined in naturally-spoken, relative formats that PHP can use for parsing in its date-related functions. As an example <code>1 hour 30 minutes</code> would mean your link expires, you guessed it, 1 hour and 30 minutes from the time it was created.</p>
		<p>The documentation for relative formats can be viewed <a href="https://www.php.net/manual/en/datetime.formats.relative.php" target="_blank">here.</a></p>
	</div>

	<div class="MainCard-divider"></div>

	<faq-question>Are my shortlinks private?</faq-question>
	<div class="pl-3">
		<p>Publicly, yes. Admins, however, can see all shortlinks created as well as their destinations and who created them.</p>
	</div>

	<div class="MainCard-divider"></div>

	<faq-question>Can I view info about a shortlink without using the API?</faq-question>
	<div class="pl-3">
		<p>If you add a <code>+</code> to the end of a shortlink then you will be redirected to an info page about the shortlink.</p>
	</div>
</template>
