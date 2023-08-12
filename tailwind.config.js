/** @type {import ('tailwindcss').Config} */

module.exports = {
    content: [
        "./pages/**/*.{js,jsx,ts,tsx}",
        "./ui_components/**/*.{js,jsx,ts,tsx}",
        "./hocs/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                inter: ["Inter"],
            },
            fontSize: {
                xs: ".75rem",
                sm: ".875rem",
                base: "1rem",
                lg: "1.25rem",
                xl: "2rem",
                xl2: "2.25rem",
                xxl: "2.5rem",
                xxxl: "3.75rem",
                medium: "1.5rem",
                hero: "4rem",
                "4xl": "4.5rem",
                "5xl": "6rem",
            },
            fontWeight: {
                normal: 400,
                medium: 500,
                semibold: 600,
            },

            lineHeight: {
                1: "1.25rem",
                2: "2.25rem",
                3: "2.875rem",
                4: "3rem",
                5: "5.375rem",
                6: "5.625rem",
                7: "6rem",
                8: "3.75rem",
                9: "1.875rem",
                10: "1.5rem",
                11: "6.25rem",
                12: "4.25rem",
                13: "5rem",
                14: "1.5rem",
            },

            letterSpacing: {
                tight: "-0.01em",
            },
            screens: {
                xs: "440px",
                sm: "600px",
                md: "768px",
                lg: "1024px",
                xl: "1280px",
                xxl: "1536px",
            },
            colors: {
                transparent: "transparent",
                current: "currentColor",
                black: "#010101",
                white: "#FFFFFF",
                grey: "#7B7B7B",
                primary: {
                    100: "#F1F1F1",
                    300: "#E5B89E",
                    500: "#FF8585",
                    700: "#FF5B5B",
                },
                secondary: {
                    100: "#6D6D6D",
                },
                lightGray: "#2B2D30",
            },

            zIndex: {
                999: "999",
                1000: "1000",
                1001: "1001",
            },
        },
        boxShadow: {
            sm: "0px 2px 8px rgba(0, 0, 0, 0.06)",
            "2xl": "0px 2px 8px rgba(24, 26, 29, 0.05)",
            "3xl": "0px 24px 24px rgba(0, 0, 0, 0.17);",
            "4xl": "0px 3.18056px 19.0833px rgba(0, 0, 0, 0.16);",
            "5xl": "4px 0px 15px rgba(24, 26, 29, 0.05)",
            "6xl": "0px 4px 25px rgba(24, 26, 29, 0.05)",
            "7xl": "0px 12px 24px rgba(24, 26, 29, 0.16)",
            "8xl": "8px 0px 10px rgba(24, 26, 29, 0.05)",
            topLeft: "-12px 0px 16px rgba(24, 26, 29, 0.05)",
            sidebar: "-3.97112px 0px 14.8917px rgba(24, 26, 29, 0.05);",
            rewardShadow1: "-37px 2px 26px #222223;",
            shareList: "0px 2px 8px rgba(24, 26, 29, 0.1)",
        },

        container: {
            padding: {
                DEFAULT: "1rem",
            },
        },
    },
    variants: {
        extend: {
            display: ["group-hover"],
        },
        boxShadow: ["responsive", "hover", "focus"],
    },

    corePlugins: {
        backdropOpacity: false,
        backgroundOpacity: false,
        borderOpacity: false,
        divideOpacity: false,
        ringOpacity: false,
        textOpacity: false,
    },
};
