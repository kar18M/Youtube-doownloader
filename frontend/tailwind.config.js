/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'mk-black': '#0b0b0b',
                'mk-blood-red': '#D7263D',
                'mk-gold': '#FFC857',
                'mk-smoke': '#F5F7FA',
                'mk-card': '#FFFFFF',
                'mk-muted': '#6B7280',
            },
            fontFamily: {
                'bebas': ['"Bebas Neue"', 'cursive'],
                'inter': ['"Inter"', 'sans-serif'],
            },
            boxShadow: {
                'soft-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
                'soft-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            }
        },
    },
    plugins: [],
}
