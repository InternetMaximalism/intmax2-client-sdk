/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    config.module.rules.push({
      test: /\.wasm(\?url)?$/,
      type: "asset/resource",
      generator: {
        // Where to output the .wasm file
        filename: "static/wasm/[name].[contenthash][ext]",
      },
    });
    return config;
  },
};

export default nextConfig;
