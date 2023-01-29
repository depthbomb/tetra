import 'highlight.js/styles/agate.css';
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import hljsVuePlugin from '@highlightjs/vue-plugin';
import javascript from 'highlight.js/lib/languages/javascript';

hljs.registerLanguage('json', json);
hljs.registerLanguage('javascript', javascript);

export default hljsVuePlugin;
