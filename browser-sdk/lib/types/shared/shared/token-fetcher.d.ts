import { IntMaxEnvironment, Token, TokenType } from '../types';
export declare class TokenFetcher {
    #private;
    tokens: Token[];
    constructor(environment: IntMaxEnvironment);
    fetchTokens(): Promise<Token[]>;
    getTokensById(tokenIds: number[]): Promise<({
        error?: undefined;
        result: {
            tokenType: TokenType;
            tokenAddress: string;
            tokenId: number;
        };
        status: 'success';
    } | {
        error: Error;
        result?: undefined;
        status: 'failure';
    })[]>;
}
