import { render } from 'squirrelly';
import type { Context } from 'koa';

const template = `
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
        <title>paste.super.fish API Documentation</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.4.2/swagger-ui.min.css">
    </head>
    <body>
        <div id="swagger"></div>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.4.2/swagger-ui-bundle.min.js" defer></script>
        <script type="text/javascript">
            window.onload = () => {
                window.ui = SwaggerUIBundle({
                    url: '/api/openapi.json',
                    dom_id: '#swagger'
                });
            }
        </script>
    </body>
</html>
`.trim();

export async function swaggerTemplate(ctx: Context) {
	return render(template, {});
}
