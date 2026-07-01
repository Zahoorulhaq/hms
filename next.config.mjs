import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import CompressionPlugin from 'compression-webpack-plugin';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const isDev = process.env?.NODE_ENV === 'development';
/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  swcMinify: !isDev, // Skip SWC minification in dev
  eslint: { ignoreDuringBuilds: true },
  transpilePackages: [],
  experimental: {
    optimizePackageImports: ['antd', 'lodash', '@ant-design/icons', '@reduxjs/toolkit'],
  },
  images: {
    minimumCacheTTL: 2678400,
    domains: [
      'd33om22pidobo4.cloudfront.net',
      'images.goyzer.com',
      'd3ugf2weuhn29j.cloudfront.net',
      'ui-avatars.com',
      'picsum.photos',
      'storage.engageplatform.me',
      'storage.engageplatform.ai',
      'www.w3.org',
    ],
  },
  headers: () => [
    {
      source: '/:path*.(woff2|woff|ttf|eot|svg|png|jpg|gif|webp|jpeg)',
      locale: false,
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      source: '/(.woff2|.woff|.ttf|.eot|.svg|.png|.jpg|.gif|.webp|.jpeg)/',
      locale: false,
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      // Add content hash to the file names in production
      config.output.filename = dev
        ? 'static/chunks/[name].js'
        : 'static/chunks/[name].[contenthash].js';
      config.output.chunkFilename = dev
        ? 'static/chunks/[name].js'
        : 'static/chunks/[name].[contenthash].js';

      if (!dev) {
        config.plugins.push(
          new CompressionPlugin({
            test: /\.(js|css|html|ts)$/,
          })
        );
      }

      config.output.assetModuleFilename = 'static/media/[name].[hash][ext]';

      // Add Node.js polyfills for browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve('buffer'),
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        util: require.resolve('util'),
      };
    }

    if (!dev) {
      config.optimization.minimize = true;
    }

    return config;
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  poweredByHeader: false,
  ...(isDev
    ? {
        logging: {
          fetches: {
            fullUrl: true,
          },
        },
      }
    : {}),
  compiler: {
    ...(isDev ? {} : { removeConsole: { exclude: ['error'] } }),
  },
  optimizeFonts: true,

  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ];
  },

  skipTrailingSlashRedirect: true,
};

export default nextConfig;
