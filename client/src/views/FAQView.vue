<script setup lang="ts">
	import AppCard from '~/components/AppCard.vue';
	import AppHeading from '~/components/AppHeading.vue';
</script>

<template>
	<div class="container">
		<app-heading>FAQ</app-heading>
		<app-card>
			<template #header>
				<h4>What is a <q>duration string</q>?</h4>
			</template>
			<p>A duration string is a human-readable format for conveying time duration which consists of one or more pairings of a numeric value and a unit of time abbreviation optionally delimited by a space.</p>
			<p>For example, one hour and thirty minutes as a duration string would be <code>1h 30m</code> and can be written as <code>1h30m</code>, <code>1 h 30 m</code>, etc.</p>
			<p>The following units of time are available:</p>
			<ul>
				<li>y = year</li>
				<li>mo = month</li>
				<li>w = week</li>
				<li>d = day</li>
				<li>h = hour</li>
				<li>m = minute</li>
				<li>s = second</li>
				<li>ms = millisecond</li>
			</ul>
		</app-card>
	</div>
</template>
