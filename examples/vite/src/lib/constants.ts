export const ENV_TYPE = import.meta.env.VITE_AUTO_INIT || "testnet";

const PLACEHOLDER_INTMAX_ADDRESSES: Record<string, string> = {
  devnet: "X8UrTJHtxBnPTyzjV9TfPiBwbYtdjBNeyUR3fmjsA3bxLm19bFXKFbiPTyzjV9TfPiBwbYtdjBNeyUR3fmjsA3bxEKHFELF",
  testnet: "T83D8h36jsh1tc2Et4LkBNhttTBRZEFHceKvjkVS7Wgd94JZdWbq4yq1tc2Et4LkBNhttTBRZEFHceKvjkVS7Wgd6S4o2qv",
  mainnet: "T83D8h36jsh1tc2Et4LkBNhttTBRZEFHceKvjkVS7Wgd94JZdWbq4yq1tc2Et4LkBNhttTBRZEFHceKvjkVS7Wgd6S4o2qv",
}

export const PLACEHOLDER_INTMAX_ADDRESS = PLACEHOLDER_INTMAX_ADDRESSES[ENV_TYPE] ?? "T83D8h36jsh1tc2Et4LkBNhttTBRZEFHceKvjkVS7Wgd94JZdWbq4yq1tc2Et4LkBNhttTBRZEFHceKvjkVS7Wgd6S4o2qv";
