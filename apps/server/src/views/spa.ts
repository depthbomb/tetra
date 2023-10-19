import { render } from 'squirrelly';
import type { Context } from 'koa';

const template = `
<!doctype html>
<html lang="en" dir="ltr">
	<head>
		<base href="/">
		<meta charset="utf-8">
		<meta name="theme-color" content="#05bef9">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta name="description" content="A shortlink generator that just works">
		<meta name="tetra/user" content="{{it.user}}">
		<meta name="tetra/enabled-features" content="{{it.enabledFeatures.join(',')}}">
		<title>go.super.fish</title>
		<link rel="canonical" href="/">
		<link href="{{it.assets['apple-icon-precomposed.png']}}" rel="apple-touch-icon-precomposed">
		{{@foreach([57, 60, 76, 114, 120, 144, 180]) => _, s}}
			<link href="{{it.assets['apple-icon-'+s+'x'+s+'.png']}}" rel="apple-touch-icon" sizes="{{s}}x{{s}}">
		{{/foreach}}
		{{@foreach([36, 48, 72, 96, 144, 192]) => _, s}}
			<link href="{{it.assets['android-icon-'+s+'x'+s+'.png']}}" rel="icon" type="image/png" sizes="{{s}}x{{s}}">
		{{/foreach}}
		{{@foreach([16, 32, 96]) => _, s}}
			<link href="{{it.assets['favicon-'+s+'x'+s+'.png']}}" rel="icon" type="image/png" sizes="{{s}}x{{s}}">
		{{/foreach}}
		{{@each(it.preload) => preload}}<link href="{{preload}}" rel="modulepreload" nonce="{{it.nonce}}">{{/each}}
		{{@each(it.entries.css) => entry}}<link href="{{entry}}" type="text/css" rel="stylesheet" nonce="{{it.nonce}}">{{/each}}
		{{@each(it.entries.js) => entry}}<script src="{{entry}}" type="module" nonce="{{it.nonce}}"></script>{{/each}}
	</head>
	<body class="not-nirvana-fishfood">
		<noscript><h1>This site requires JavaScript to be enabled.</h1></noscript>
		<main id="app"></main>
	</body>
</html>
`.trim();

export async function spaTemplate(ctx: Context) {
	const { nonce, assets, entries, preload, user, enabledFeatures } = ctx.state;
	return render(template, {
		nonce,
		assets,
		entries,
		preload,
		enabledFeatures,
		user: JSON.stringify(user ?? {})
	});
}
