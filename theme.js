"use client";
import { Roboto } from "next/font/google";
import { createTheme } from "@mui/material/styles";
import { bootstrapCompatibilityTheme } from "@articles-media/articles-dev-box/bootstrapCompatibilityTheme";

const roboto = Roboto({
    weight: ["300", "400", "500", "700"],
    subsets: ["latin"],
    display: "swap",
});

export function createAppTheme(mode = "dark") {
    return createTheme({
        cssVariables: true,
        palette: {
            mode,
            // brand: {
            //     // main: "#f9edcd",
            //     main: "#02e962",
            // },
            primary: {
                main: "#f9edcd",
                // main: "#02e962",
            },
            // brand: {
            //     primary: "#f9edcd"
            // }
        },
        typography: {
            fontFamily: roboto.style.fontFamily,
        },
        components: {
            MuiAlert: {
                styleOverrides: {
                    root: {
                        variants: [
                            {
                                props: { severity: "info" },
                                style: {
                                    backgroundColor: "#60a5fa",
                                },
                            },
                        ],
                    },
                },
            },
            MuiCssBaseline: {
                // ...bootstrapCompatibilityTheme.MuiCssBaseline,
                styleOverrides: (muiTheme) => ({
                    ...bootstrapCompatibilityTheme.MuiCssBaseline.styleOverrides(
                        muiTheme,
                    ),
                    i: {
                        marginRight: "0.2rem",
                    },
                    button: {
                        fontSize: "0.75rem !important",
                    },
                    ".stats-overlay": {
                        position: "fixed",
                        top: 0,
                        right: "0 !important",
                        left: "initial !important",
                        zIndex: 4,
                    },
                    ".playwrite-ar-guides-regular": {
                        fontFamily: '"Playwrite AR Guides", cursive',
                        fontWeight: 400,
                        fontStyle: "normal",
                    },
                }),
            },
        },
    });
}

const theme = createAppTheme();

export default theme;
