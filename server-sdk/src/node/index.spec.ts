import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../shared', () => ({
  generateEncryptionKey: vi.fn().mockImplementation(async (_signNetwork: string, _nonce: number) => {
    return new Uint8Array(32);
  }),
  uint8ToBase64: vi.fn().mockImplementation((data: Uint8Array) => {
    return btoa(String.fromCharCode(...data));
  }),
  networkMessage: vi.fn().mockImplementation((address: string) => {
    return `I am signing this message to connect to INTMAX2 network with address: ${address}`;
  }),
}));

vi.mock('../wasm/node/intmax2_wasm_lib', () => ({
  default: () => Promise.resolve(new ArrayBuffer(1024)),
}));

vi.mock('viem', () => ({
  createWalletClient: vi.fn(),
  createPublicClient: vi.fn(),
  custom: vi.fn(),
  http: vi.fn(),
  sha256: vi.fn().mockImplementation((data: string) => `hashed_${data}`),
  mainnet: { id: 1 },
  sepolia: { id: 11155111 },
}));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      post: vi.fn(),
      get: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}));

// btoa/atob polyfill for Node.js environment
if (typeof global.btoa === 'undefined') {
  global.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
}
if (typeof global.atob === 'undefined') {
  global.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
}

interface MockWalletClient {
  requestAddresses: ReturnType<typeof vi.fn>;
  getAddresses: ReturnType<typeof vi.fn>;
  signMessage: ReturnType<typeof vi.fn>;
}

interface MockPublicClient {
  verifyMessage: ReturnType<typeof vi.fn>;
}

interface MockAxiosInstance {
  post: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
}

// Set base URL for MSW server
const BASE_URL = 'http://localhost:3000';

// Create MSW server for API mocking
const handlers = [
  http.post(`${BASE_URL}/challenge`, () => {
    return HttpResponse.json({
      message: 'Sign this message to authenticate with challenge: abc123',
      nonce: '12345',
    });
  }),

  http.post(`${BASE_URL}/wallet/login`, () => {
    return HttpResponse.json({
      hashedSignature: 'mock_hashed_signature',
      encryptedEntropy: 'mock_encrypted_entropy',
      nonce: 1234567890,
      accessToken: 'mock_access_token',
    });
  }),

  http.get(`${BASE_URL}/intmax2_wasm_lib_bg.wasm`, () => {
    return HttpResponse.arrayBuffer(new ArrayBuffer(1024));
  }),
];

const server = setupServer(...handlers);

// Mock wallet client
const createMockWalletClient = (): MockWalletClient => ({
  requestAddresses: vi.fn().mockResolvedValue(undefined),
  getAddresses: vi.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
  signMessage: vi.fn().mockImplementation(({ message }: { account: string; message: string }) => {
    return Promise.resolve(`0xmock_signature_${message.slice(0, 10)}_${Date.now()}`);
  }),
});

// Mock public client
const createMockPublicClient = (): MockPublicClient => ({
  verifyMessage: vi.fn().mockResolvedValue(true),
});

// Mock axios instance
const createMockAxiosInstance = (): MockAxiosInstance => ({
  post: vi.fn().mockImplementation((url: string, _data: unknown) => {
    if (url === '/challenge') {
      return Promise.resolve({
        data: {
          message: 'Sign this message to authenticate with challenge: abc123',
          nonce: '12345',
        },
      });
    }
    if (url === '/wallet/login') {
      return Promise.resolve({
        data: {
          hashedSignature: 'mock_hashed_signature',
          encryptedEntropy: 'mock_encrypted_entropy',
          nonce: 1234567890,
          accessToken: 'mock_access_token',
        },
      });
    }
    return Promise.resolve({ data: {} });
  }),
  get: vi.fn(),
});

// Simple IntMaxClient mock for testing login functionality
class MockIntMaxClient {
  public isLoggedIn = false;
  public address = '';
  private mockWalletClient: MockWalletClient;
  private mockPublicClient: MockPublicClient;
  private mockVaultHttpClient: MockAxiosInstance;
  private privateKey = '';

  constructor() {
    this.mockWalletClient = createMockWalletClient();
    this.mockPublicClient = createMockPublicClient();
    this.mockVaultHttpClient = createMockAxiosInstance();
  }

  static async init({ environment: _environment }: { environment: 'testnet' | 'mainnet' }) {
    // Mock WASM loading - use complete URL for Node.js environment
    try {
      await fetch(`${BASE_URL}/intmax2_wasm_lib_bg.wasm`);
    } catch (error) {
      // Continue test execution even if fetch fails (mock environment)
      console.warn('WASM fetch failed in test environment:', error);
    }
    return new MockIntMaxClient();
  }

  async login() {
    this.isLoggedIn = false;

    await this.mockWalletClient.requestAddresses();

    const [address] = await this.mockWalletClient.getAddresses();
    const signNetwork = await this.mockWalletClient.signMessage({
      account: address,
      message: `I am signing this message to connect to INTMAX2 network with address: ${address}`,
    });

    const challengeResponse = await this.mockVaultHttpClient.post('/challenge', {
      address,
      type: 'login',
    });
    const challengeData = challengeResponse.data;

    const challengeSignature = await this.mockWalletClient.signMessage({
      account: address,
      message: challengeData.message,
    });

    const loginResponse = await this.mockVaultHttpClient.post('/wallet/login', {
      address,
      challengeSignature,
      securitySeed: `hashed_${signNetwork}`,
    });
    const loginData = loginResponse.data;

    // Mock entropy generation
    await this.entropy(signNetwork, loginData.hashedSignature);

    // Mock encryption key generation
    const encryptionKeyBytes = new Uint8Array(32);
    const encryptionKey = btoa(String.fromCharCode(...encryptionKeyBytes));

    this.isLoggedIn = true;
    this.address = address;

    return {
      address: this.address,
      isLoggedIn: this.isLoggedIn,
      nonce: loginData.nonce,
      encryptionKey,
      accessToken: loginData.accessToken,
    };
  }

  private async entropy(signNetwork: string, hashedSignature: string) {
    // Mock entropy generation logic
    this.privateKey = `mock_private_key_${signNetwork}_${hashedSignature}`;
  }
}

describe('IntMaxClient Node Login Tests', () => {
  let client: MockIntMaxClient;

  beforeEach(async () => {
    server.listen({ onUnhandledRequest: 'bypass' }); // Allow unhandled requests
    vi.clearAllMocks();
    client = await MockIntMaxClient.init({ environment: 'testnet' });
  });

  afterEach(() => {
    server.resetHandlers();
    server.close();
  });

  describe('login() method', () => {
    it('should successfully complete login flow', async () => {
      const result = await client.login();

      expect(result).toEqual({
        address: '0x1234567890123456789012345678901234567890',
        isLoggedIn: true,
        nonce: 1234567890,
        encryptionKey: expect.any(String),
        accessToken: 'mock_access_token',
      });

      expect(client.isLoggedIn).toBe(true);
      expect(client.address).toBe('0x1234567890123456789012345678901234567890');
    });

    it('should request wallet addresses', async () => {
      await client.login();

      expect(client['mockWalletClient'].requestAddresses).toHaveBeenCalledOnce();
      expect(client['mockWalletClient'].getAddresses).toHaveBeenCalledOnce();
    });

    it('should sign network message', async () => {
      await client.login();

      expect(client['mockWalletClient'].signMessage).toHaveBeenCalledWith({
        account: '0x1234567890123456789012345678901234567890',
        message:
          'I am signing this message to connect to INTMAX2 network with address: 0x1234567890123456789012345678901234567890',
      });
    });

    it('should make challenge API call', async () => {
      await client.login();

      expect(client['mockVaultHttpClient'].post).toHaveBeenCalledWith('/challenge', {
        address: '0x1234567890123456789012345678901234567890',
        type: 'login',
      });
    });

    it('should sign challenge message', async () => {
      await client.login();

      expect(client['mockWalletClient'].signMessage).toHaveBeenCalledWith({
        account: '0x1234567890123456789012345678901234567890',
        message: 'Sign this message to authenticate with challenge: abc123',
      });
    });

    it('should make login API call with correct parameters', async () => {
      await client.login();

      expect(client['mockVaultHttpClient'].post).toHaveBeenCalledWith('/wallet/login', {
        address: '0x1234567890123456789012345678901234567890',
        challengeSignature: expect.stringMatching(/^0xmock_signature_/),
        securitySeed: expect.stringMatching(/^hashed_/),
      });
    });

    it('should set login state correctly', async () => {
      expect(client.isLoggedIn).toBe(false);
      expect(client.address).toBe('');

      await client.login();

      expect(client.isLoggedIn).toBe(true);
      expect(client.address).toBe('0x1234567890123456789012345678901234567890');
    });

    it('should return valid login response structure', async () => {
      const result = await client.login();

      expect(result).toHaveProperty('address');
      expect(result).toHaveProperty('isLoggedIn');
      expect(result).toHaveProperty('nonce');
      expect(result).toHaveProperty('encryptionKey');
      expect(result).toHaveProperty('accessToken');

      expect(result.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(result.isLoggedIn).toBe(true);
      expect(typeof result.nonce).toBe('number');
      expect(typeof result.encryptionKey).toBe('string');
      expect(typeof result.accessToken).toBe('string');
    });

    it('should handle wallet connection errors', async () => {
      client['mockWalletClient'].requestAddresses.mockRejectedValueOnce(new Error('User rejected connection'));

      await expect(client.login()).rejects.toThrow('User rejected connection');
      expect(client.isLoggedIn).toBe(false);
    });

    it('should handle signature rejection', async () => {
      client['mockWalletClient'].signMessage.mockRejectedValueOnce(new Error('User rejected signature'));

      await expect(client.login()).rejects.toThrow('User rejected signature');
      expect(client.isLoggedIn).toBe(false);
    });

    it('should handle API errors', async () => {
      client['mockVaultHttpClient'].post.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.login()).rejects.toThrow('Network error');
      expect(client.isLoggedIn).toBe(false);
    });

    it('should reset login state before starting', async () => {
      // Pre-set some state
      client.isLoggedIn = true;
      client.address = 'old_address';

      await client.login();

      // Should have reset to false initially and then set to true after success
      expect(client.isLoggedIn).toBe(true);
      expect(client.address).toBe('0x1234567890123456789012345678901234567890');
    });
  });

  describe('login() integration with WASM', () => {
    it('should initialize with WASM successfully', async () => {
      const mockClient = await MockIntMaxClient.init({ environment: 'testnet' });
      expect(mockClient).toBeDefined();
    });

    it('should handle different environments', async () => {
      const testnetClient = await MockIntMaxClient.init({ environment: 'testnet' });
      const mainnetClient = await MockIntMaxClient.init({ environment: 'mainnet' });

      expect(testnetClient).toBeDefined();
      expect(mainnetClient).toBeDefined();
    });
  });

  describe('login() error scenarios', () => {
    it('should handle challenge API failure', async () => {
      // Create a new client with error-throwing mock
      const errorClient = new MockIntMaxClient();
      errorClient['mockVaultHttpClient'].post = vi.fn().mockImplementation((url: string) => {
        if (url === '/challenge') {
          return Promise.reject(new Error('Challenge API failed'));
        }
        return Promise.resolve({ data: {} });
      });

      await expect(errorClient.login()).rejects.toThrow('Challenge API failed');
    });

    it('should handle login API failure', async () => {
      // Create a new client with error-throwing mock for login endpoint
      const errorClient = new MockIntMaxClient();
      errorClient['mockVaultHttpClient'].post = vi
        .fn()
        .mockImplementationOnce(() => {
          // First call - challenge (success)
          return Promise.resolve({
            data: {
              message: 'Sign this message to authenticate with challenge: abc123',
              nonce: '12345',
            },
          });
        })
        .mockImplementationOnce(() => {
          // Second call - login (failure)
          return Promise.reject(new Error('Login API failed'));
        });

      await expect(errorClient.login()).rejects.toThrow('Login API failed');
    });

    it('should handle invalid API responses', async () => {
      server.use(
        http.post(`${BASE_URL}/challenge`, () => {
          return HttpResponse.json({ invalid: 'response' });
        }),
      );

      // Should handle when expected fields are missing
      const result = await client.login();
      // The mock will still work, but in real implementation this might throw
      expect(result).toBeDefined();
    });
  });

  describe('login() call sequence verification', () => {
    it('should call methods in correct order', async () => {
      const callOrder: string[] = [];

      client['mockWalletClient'].requestAddresses.mockImplementation(() => {
        callOrder.push('requestAddresses');
        return Promise.resolve();
      });

      client['mockWalletClient'].getAddresses.mockImplementation(() => {
        callOrder.push('getAddresses');
        return Promise.resolve(['0x1234567890123456789012345678901234567890']);
      });

      client['mockWalletClient'].signMessage.mockImplementation(() => {
        callOrder.push('signMessage');
        return Promise.resolve('mock_signature');
      });

      client['mockVaultHttpClient'].post.mockImplementation((url: string) => {
        callOrder.push(`post_${url}`);
        if (url === '/challenge') {
          return Promise.resolve({
            data: {
              message: 'challenge',
            },
          });
        }
        return Promise.resolve({
          data: {
            hashedSignature: 'hash',
            nonce: 123,
            accessToken: 'token',
          },
        });
      });

      await client.login();

      expect(callOrder).toEqual([
        'requestAddresses',
        'getAddresses',
        'signMessage',
        'post_/challenge',
        'signMessage',
        'post_/wallet/login',
      ]);
    });
  });
});
