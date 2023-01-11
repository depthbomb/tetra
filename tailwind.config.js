/* eslint-env node */
const colors = require('tailwindcss/colors');
const { default: flattenColorPalette } = require('tailwindcss/lib/util/flattenColorPalette');

module.exports = {
    content: [
        './resources/views/**/*.blade.php',
        './resources/client/**/*.{client,ts,vue}',
    ],
    theme: {
        extend: {
            colors: {
                rose: colors.rose,
                pink: colors.pink,
                fuchsia: colors.fuchsia,
                purple: colors.purple,
                violet: colors.violet,
                indigo: colors.indigo,
                blue: colors.blue,
                sky: colors.sky,
                cyan: colors.cyan,
                teal: colors.teal,
                emerald: colors.emerald,
                green: colors.lime,
                lime: colors.lime,
                yellow: colors.yellow,
                amber: colors.amber,
                orange: colors.orange,
                red: colors.red,
                slate: colors.slate,
                gray: colors.gray,
                zinc: colors.zinc,
                neutral: colors.neutral,
                stone: colors.stone,
                brand: {
                    DEFAULT: '#FF0A43',
                    '50': '#FFC2D0',
                    '100': '#FFADC0',
                    '200': '#FF84A1',
                    '300': '#FF5C82',
                    '400': '#FF3362',
                    '500': '#FF0A43',
                    '600': '#D10031',
                    '700': '#990024',
                    '800': '#610016',
                    '900': '#290009'
                }
            },
            fontFamily: {
                sans: [
                    'Inter',
                    'ui-sans-serif',
                    'system-ui',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    '"Segoe UI"',
                    'Roboto',
                    '"Helvetica Neue"',
                    'Arial',
                    '"Noto Sans"',
                    'sans-serif',
                    '"Apple Color Emoji"',
                    '"Segoe UI Emoji"',
                    '"Segoe UI Symbol"',
                    '"Noto Color Emoji"',
                ],
                serif: [
                    '"Fugaz One"',
                    'ui-serif',
                    'Georgia',
                    'Cambria',
                    '"Times New Roman"',
                    'Times',
                    'serif'
                ],
            },
            transitionProperty: {
                'button': 'color, background-color, box-shadow, opacity',
            },
            transitionTimingFunction: {
                'in-back': 'cubic-bezier(0.36, 0, 0.66, -0.56)',
                'out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                'in-out-back': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
                'in-circ': 'cubic-bezier(0.55, 0, 1, 0.45)',
                'out-circ': 'cubic-bezier(0, 0.55, 0.45, 1)',
                'in-out-circ': 'cubic-bezier(0.85, 0, 0.15, 1)',
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
        function ({ matchUtilities, theme }) {
            matchUtilities({
                    highlight: (value) => ({ boxShadow: `inset 0 1px 0 0 ${value}` }),
                },
                { values: flattenColorPalette(theme('backgroundColor')), type: 'color' }
            );
        }
    ],
};