import pluginVue from 'eslint-plugin-vue';
import {vueTsConfigs, withVueTs} from '@vue/eslint-config-typescript';

export default withVueTs(
    {
        ignores: ['dist/**', 'node_modules/**', 'src/@types/openapi.d.ts']
    },
    pluginVue.configs['flat/essential'],
    vueTsConfigs.recommended,
    {
        rules: {
            'vue/component-name-in-template-casing': ['error', 'kebab-case', {
                registeredComponentsOnly: false
            }],
            'vue/multi-word-component-names': 'off'
        }
    }
);
