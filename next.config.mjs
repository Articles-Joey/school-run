import path from "node:path";
import { fileURLToPath } from "node:url";

const configDirectory = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@articles-media/articles-dev-box'],
    poweredByHeader: false,
    reactCompiler: true,
    // Only needed when using Turbopack when using linked packages like '@articles-media/articles-dev-box' as opposed to installed from npm
    turbopack: {
        // Common parent containing both school-run and articles-dev-box
        root: path.resolve(configDirectory, "..", ".."),
    },
    // devIndicators: {
    //     position: 'bottom-right',
    // },
    images: {
        // domains: ['cdn.articles.media', 'articles-website.s3.amazonaws.com', 'd3bzp9rk94ifwy.cloudfront.net'],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cdn.articles.media",
                port: "",
                // pathname: '',
            },
            {
                protocol: "https",
                hostname: "articles-website.s3.amazonaws.com",
                port: "",
                // pathname: '',
            },
        ],
    },
    // Blocks embedding of the site in iframes from other origins
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "X-Frame-Options",
                        value: "SAMEORIGIN",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
