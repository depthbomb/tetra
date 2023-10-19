import { render } from 'squirrelly';
import type { Context } from 'koa';

const template = `
<!doctype html>
<html lang="en" dir="ltr">
	<head>
		<meta name="tetra/user" content="{{it.user}}">
		<meta name="tetra/enabled-features" content="{{it.enabledFeatures.join(',')}}">
		{{@each(it.preload) => preload}}<link href="{{preload}}" rel="modulepreload" nonce="{{it.nonce}}">{{/each}}
		{{@each(it.entries.css) => entry}}<link href="{{entry}}" type="text/css" rel="stylesheet" nonce="{{it.nonce}}">{{/each}}
		{{@each(it.entries.js) => entry}}<script src="{{entry}}" type="module" nonce="{{it.nonce}}"></script>{{/each}}
	</head>
	<body>
		<noscript>
			<h1>Please enable JavaScript.</h1>
		</noscript>
		<main id="app"></main>
	</body>
</html>
`.trim();

export async function spaTemplate(ctx: Context) {
	const { nonce, entries, preload, user, enabledFeatures } = ctx.state;
	return render(template, {
		nonce,
		entries,
		preload,
		enabledFeatures,
		user: JSON.stringify(user ?? {})
	});
}
