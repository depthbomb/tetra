import { render } from 'squirrelly';
import type { Context } from 'koa';

const template = `
<!doctype html>
<html lang="en" dir="ltr">
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="ie=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>go.super.fish API Documentation</title>
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.min.css">
	</head>
	<body>
		<div id="swagger"></div>
		<script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.min.js" defer></script>
		<script type="text/javascript">
			window.onload = () => {
				window.ui = SwaggerUIBundle({ url: '/api/openapi.json', dom_id: '#swagger' });
			}
		</script>
	</body>
</html>
`.trim();

export async function swaggerTemplate(ctx: Context) {
	return render(template, {});
}
