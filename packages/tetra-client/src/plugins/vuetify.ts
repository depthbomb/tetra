import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';
import { md2 }           from 'vuetify/blueprints'
import { aliases, mdi }  from 'vuetify/iconsets/mdi';

const cspNonce = (document.querySelector('meta[name="config/csp-nonce"]') as HTMLMetaElement).content;

export default createVuetify({
    blueprint: md2,
    theme: {
        defaultTheme: 'dark',
        cspNonce
    },
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi
        }
    }
});
