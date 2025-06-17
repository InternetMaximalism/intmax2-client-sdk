import { Token, TokenType } from "intmax2-client-sdk";

export const getTokenDecimals = (token: Token | null | undefined) => {
  if (!token) {
    return 0
  }

  return token.tokenType === TokenType.NATIVE ? 18 : token.decimals ?? 0
}
