/* eslint-env node */
const colors = require('tailwindcss/colors');
const { default: flattenColorPalette } = require('tailwindcss/lib/util/flattenColorPalette');

module.exports = {
	content: [
		'./src/**/*.{ts,vue,html}',
		'../templates/**/*.{html,twig,html.twig}',
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
				// slate: colors.slate,
				gray: colors.zinc,
				// zinc: colors.zinc,
				// neutral: colors.neutral,
				// stone: colors.stone,
				brand: {
					DEFAULT: '#05BEF9',
					'50': '#effaff',
					'100': '#dff4ff',
					'200': '#b7ecff',
					'300': '#78deff',
					'400': '#30ceff',
					'500': '#05bef9',
					'600': '#0095cf',
					'700': '#0077a8',
					'800': '#02648a',
					'900': '#085272',
					'950': '#05354c',
				}
			},
			fontFamily: {
				sans: [
					'Ubuntu',
					'ui-sans-serif',
					'system-ui',
					'-apple-system',
					'BlinkMacSystemFont',
					'"Segoe UI"',
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
					'"Josefin Sans"',
					'ui-serif',
					'Georgia',
					'Cambria',
					'"Times New Roman"',
					'Times',
					'serif'
				],
				mono: [
					'"Fira Code"',
					'ui-monospace',
					'SFMono-Regular',
					'Menlo',
					'Monaco',
					'Consolas',
					'"Liberation Mono"',
					'"Courier New"',
					'monospace'
				]
			},
			transitionTimingFunction: {
				'in-back': 'cubic-bezier(0.36, 0, 0.66, -0.56)',
				'out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
				'in-out-back': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
				'in-circ': 'cubic-bezier(0.55, 0, 1, 0.45)',
				'out-circ': 'cubic-bezier(0, 0.55, 0.45, 1)',
				'in-out-circ': 'cubic-bezier(0.85, 0, 0.15, 1)',
			},
			keyframes: {
				'fadeIn': {
					'0%': { opacity: '100%' }
				},
				'slideInLeft': {
					'0%': { transform: 'translateX(100%)' }
				}
			},
			animation: {
				'fadeIn': 'fadeIn 15s linear 0s 1 normal none running',
				'slideInLeft': 'slideInLeft .15s cubic-bezier(0.33, 1, 0.68, 1) 0s 1 normal none running',
			}
		},
	},
	plugins: [
		require('@tailwindcss/forms')({
			strategy: 'class'
		}),
		require('@tailwindcss/typography'),
		function ({ matchUtilities, theme }) {
			matchUtilities({
					highlight: (value) => ({ boxShadow: `inset 0 1px 0 0 ${value}` }),
					popup: (value) => ({ boxShadow: `inset 0 -3px 0 0 ${value}` }),
					'popup-depressed': (value) => ({ boxShadow: `inset 0 -2px 0 0 ${value}` }),
				},
				{ values: flattenColorPalette(theme('backgroundColor')), type: 'color' }
			);
		}
	],
};
