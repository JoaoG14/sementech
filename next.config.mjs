/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
  reactStrictMode: false,
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: [
      "onnxruntime-node",
      "puppeteer-core",
      "@sparticuz/chromium",
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        "sharp-linux-x64": "commonjs sharp-linux-x64",
        sharp: "commonjs sharp",
      });
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: "",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "imgs.casasbahia.com.br",
        port: "",
      },
    ],
  },
};

export default nextConfig;
