// import { Geist, Geist_Mono } from "next/font/google";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import AppThemeProvider from "@/components/AppThemeProvider";

import packageInfo from "@/package.json";

// import "bootstrap/dist/css/bootstrap.min.css";

// import "./globals.css";

// import "@articles-media/articles-dev-box/dist/style.css";

import "@articles-media/articles-gamepad-helper/dist/articles-gamepad-helper.css";

import SocketLogicHandler from "@/components/SocketLogicHandler";
import { Suspense } from "react";
import LayoutClient from "./layout-client";
// import GlobalClientModals from '@/components/UI/GlobalClientModals';

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata = {
    title: process.env.NEXT_PUBLIC_GAME_NAME,
    description: packageInfo.description,
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link
                    rel="preconnect"
                    href="https://fonts.googleapis.com"
                />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="true"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Playwrite+AR+Guides&display=swap"
                    rel="stylesheet"
                ></link>
            </head>

            <body
            // className={`${geistSans.variable} ${geistMono.variable}`}
            >                

                <Suspense>
                    {process.env.NEXT_PUBLIC_ENABLE_ARTICLES && (
                        <SocketLogicHandler />
                    )}
                </Suspense>

                <AppRouterCacheProvider options={{ enableCssLayer: true }}>
                    <AppThemeProvider>
                        <LayoutClient />
                        {children}
                    </AppThemeProvider>
                </AppRouterCacheProvider>
            </body>
        </html>
    );
}
