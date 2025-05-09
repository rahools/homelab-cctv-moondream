import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#00ff00",
                    foreground: "#000000",
                },
                secondary: {
                    DEFAULT: "#333333",
                    foreground: "#00ff00",
                },
                destructive: {
                    DEFAULT: "#ff0000",
                    foreground: "#ffffff",
                },
                accent: {
                    DEFAULT: "#111111",
                    foreground: "#00ff00",
                },
                background: "#000000",
                foreground: "#00ff00",
                muted: {
                    DEFAULT: "#222222",
                    foreground: "#888888",
                },
                input: "#333333",
                ring: "#00ff00",
            },
            fontFamily: {
                sans: ["var(--font-geist-sans)"],
                mono: ["var(--font-geist-mono)"],
            },
        },
    },
    plugins: [],
};

export default config;