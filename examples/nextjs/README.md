# IntMax2 SDK Next.js Example

This example demonstrates how to use the IntMax2 SDK in a Next.js application. It includes features such as connecting to the IntMax2 client, fetching balances, deposits, withdrawals, and transaction history.

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Implementation Notes

Using Turbopack causes WASM file loading to fail.
In particular, when creating a project with `create-next-app`, select the option to disable Turbopack and add the necessary Webpack configuration to `next.config.ts`.

**create-next-app**

```
✔ What is your project named? … my-app
✔ Would you like to use TypeScript? … No / Yes
✔ Would you like to use ESLint? … No / Yes
✔ Would you like to use Tailwind CSS? … No / Yes
✔ Would you like your code inside a `src/` directory? … No / Yes
✔ Would you like to use App Router? (recommended) … No / Yes
? Would you like to use Turbopack for `next dev`? › No / Yes <- Select "No"
```

**next.config.ts**

```ts
const nextConfig: NextConfig = {
  // Additional Next.js configuration should be placed here
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });
    return config;
  },
};
```
