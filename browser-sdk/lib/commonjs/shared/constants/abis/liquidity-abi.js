"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiquidityAbi = void 0;
exports.LiquidityAbi = [
    { inputs: [], stateMutability: "nonpayable", type: "constructor" },
    { inputs: [], name: "AccessControlBadConfirmation", type: "error" },
    {
        inputs: [
            { internalType: "address", name: "account", type: "address" },
            { internalType: "bytes32", name: "neededRole", type: "bytes32" },
        ],
        name: "AccessControlUnauthorizedAccount",
        type: "error",
    },
    {
        inputs: [{ internalType: "address", name: "target", type: "address" }],
        name: "AddressEmptyCode",
        type: "error",
    },
    { inputs: [], name: "AddressZero", type: "error" },
    { inputs: [], name: "AlreadyAnalyzed", type: "error" },
    {
        inputs: [{ internalType: "bytes32", name: "depositHash", type: "bytes32" }],
        name: "DepositHashAlreadyExists",
        type: "error",
    },
    {
        inputs: [
            { internalType: "address", name: "implementation", type: "address" },
        ],
        name: "ERC1967InvalidImplementation",
        type: "error",
    },
    { inputs: [], name: "ERC1967NonPayable", type: "error" },
    { inputs: [], name: "FailedCall", type: "error" },
    {
        inputs: [
            { internalType: "bytes32", name: "depositDataHash", type: "bytes32" },
            { internalType: "bytes32", name: "calculatedHash", type: "bytes32" },
        ],
        name: "InvalidDepositHash",
        type: "error",
    },
    { inputs: [], name: "InvalidInitialization", type: "error" },
    { inputs: [], name: "InvalidWithdrawalAddress", type: "error" },
    { inputs: [], name: "NotInitializing", type: "error" },
    { inputs: [], name: "OnlySenderCanCancelDeposit", type: "error" },
    {
        inputs: [{ internalType: "address", name: "token", type: "address" }],
        name: "SafeERC20FailedOperation",
        type: "error",
    },
    { inputs: [], name: "SenderIsNotScrollMessenger", type: "error" },
    { inputs: [], name: "TokenAddressIsZero", type: "error" },
    {
        inputs: [
            { internalType: "uint256", name: "upToDepositId", type: "uint256" },
            { internalType: "uint256", name: "firstDepositId", type: "uint256" },
            { internalType: "uint256", name: "lastDepositId", type: "uint256" },
        ],
        name: "TriedAnalyzeOutOfRange",
        type: "error",
    },
    { inputs: [], name: "TriedToDepositZero", type: "error" },
    {
        inputs: [
            { internalType: "uint256", name: "rejectIndex", type: "uint256" },
            { internalType: "uint256", name: "front", type: "uint256" },
            { internalType: "uint256", name: "upToDepositId", type: "uint256" },
        ],
        name: "TriedToRejectOutOfRange",
        type: "error",
    },
    { inputs: [], name: "UUPSUnauthorizedCallContext", type: "error" },
    {
        inputs: [{ internalType: "bytes32", name: "slot", type: "bytes32" }],
        name: "UUPSUnsupportedProxiableUUID",
        type: "error",
    },
    { inputs: [], name: "WithdrawalAddressNotSet", type: "error" },
    {
        inputs: [
            { internalType: "bytes32", name: "withdrawalHash", type: "bytes32" },
        ],
        name: "WithdrawalNotFound",
        type: "error",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "recipient",
                type: "address",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "withdrawalHash",
                type: "bytes32",
            },
        ],
        name: "ClaimedWithdrawal",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "depositId",
                type: "uint256",
            },
        ],
        name: "DepositCanceled",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "depositId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "recipientSaltHash",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "uint32",
                name: "tokenIndex",
                type: "uint32",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "depositedAt",
                type: "uint256",
            },
        ],
        name: "Deposited",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "upToDepositId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256[]",
                name: "rejectedIndices",
                type: "uint256[]",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "gasLimit",
                type: "uint256",
            },
            { indexed: false, internalType: "bytes", name: "message", type: "bytes" },
        ],
        name: "DepositsAnalyzedAndRelayed",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "withdrawalHash",
                type: "bytes32",
            },
            {
                components: [
                    { internalType: "address", name: "recipient", type: "address" },
                    { internalType: "uint32", name: "tokenIndex", type: "uint32" },
                    { internalType: "uint256", name: "amount", type: "uint256" },
                    { internalType: "bytes32", name: "nullifier", type: "bytes32" },
                ],
                indexed: false,
                internalType: "struct WithdrawalLib.Withdrawal",
                name: "withdrawal",
                type: "tuple",
            },
        ],
        name: "DirectWithdrawalFailed",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "withdrawalHash",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "address",
                name: "recipient",
                type: "address",
            },
        ],
        name: "DirectWithdrawalSuccessed",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint64",
                name: "version",
                type: "uint64",
            },
        ],
        name: "Initialized",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "bytes32", name: "role", type: "bytes32" },
            {
                indexed: true,
                internalType: "bytes32",
                name: "previousAdminRole",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "newAdminRole",
                type: "bytes32",
            },
        ],
        name: "RoleAdminChanged",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "bytes32", name: "role", type: "bytes32" },
            {
                indexed: true,
                internalType: "address",
                name: "account",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
            },
        ],
        name: "RoleGranted",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "bytes32", name: "role", type: "bytes32" },
            {
                indexed: true,
                internalType: "address",
                name: "account",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
            },
        ],
        name: "RoleRevoked",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "implementation",
                type: "address",
            },
        ],
        name: "Upgraded",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "withdrawalHash",
                type: "bytes32",
            },
        ],
        name: "WithdrawalClaimable",
        type: "event",
    },
    {
        inputs: [],
        name: "ANALYZER",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "DEFAULT_ADMIN_ROLE",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "UPGRADE_INTERFACE_VERSION",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { internalType: "uint256", name: "upToDepositId", type: "uint256" },
            {
                internalType: "uint256[]",
                name: "rejectDepositIds",
                type: "uint256[]",
            },
            { internalType: "uint256", name: "gasLimit", type: "uint256" },
        ],
        name: "analyzeAndRelayDeposits",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "uint256", name: "depositId", type: "uint256" },
            {
                components: [
                    {
                        internalType: "bytes32",
                        name: "recipientSaltHash",
                        type: "bytes32",
                    },
                    { internalType: "uint32", name: "tokenIndex", type: "uint32" },
                    { internalType: "uint256", name: "amount", type: "uint256" },
                ],
                internalType: "struct DepositLib.Deposit",
                name: "deposit",
                type: "tuple",
            },
        ],
        name: "cancelDeposit",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    { internalType: "address", name: "recipient", type: "address" },
                    { internalType: "uint32", name: "tokenIndex", type: "uint32" },
                    { internalType: "uint256", name: "amount", type: "uint256" },
                    { internalType: "bytes32", name: "nullifier", type: "bytes32" },
                ],
                internalType: "struct WithdrawalLib.Withdrawal[]",
                name: "withdrawals",
                type: "tuple[]",
            },
        ],
        name: "claimWithdrawals",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        name: "claimableWithdrawals",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "tokenAddress", type: "address" },
            { internalType: "bytes32", name: "recipientSaltHash", type: "bytes32" },
            { internalType: "uint256", name: "tokenId", type: "uint256" },
            { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "depositERC1155",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "tokenAddress", type: "address" },
            { internalType: "bytes32", name: "recipientSaltHash", type: "bytes32" },
            { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "depositERC20",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "tokenAddress", type: "address" },
            { internalType: "bytes32", name: "recipientSaltHash", type: "bytes32" },
            { internalType: "uint256", name: "tokenId", type: "uint256" },
        ],
        name: "depositERC721",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "bytes32", name: "recipientSaltHash", type: "bytes32" },
        ],
        name: "depositNativeToken",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [{ internalType: "uint256", name: "depositId", type: "uint256" }],
        name: "getDepositData",
        outputs: [
            {
                components: [
                    { internalType: "bytes32", name: "depositHash", type: "bytes32" },
                    { internalType: "address", name: "sender", type: "address" },
                    { internalType: "bool", name: "isRejected", type: "bool" },
                ],
                internalType: "struct DepositQueueLib.DepositData",
                name: "",
                type: "tuple",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { internalType: "uint256[]", name: "depositIds", type: "uint256[]" },
        ],
        name: "getDepositDataBatch",
        outputs: [
            {
                components: [
                    { internalType: "bytes32", name: "depositHash", type: "bytes32" },
                    { internalType: "address", name: "sender", type: "address" },
                    { internalType: "bool", name: "isRejected", type: "bool" },
                ],
                internalType: "struct DepositQueueLib.DepositData[]",
                name: "",
                type: "tuple[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ internalType: "uint256", name: "depositId", type: "uint256" }],
        name: "getDepositDataHash",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "getLastDepositId",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "getLastRelayedDepositId",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "getNativeTokenIndex",
        outputs: [{ internalType: "uint32", name: "", type: "uint32" }],
        stateMutability: "pure",
        type: "function",
    },
    {
        inputs: [{ internalType: "bytes32", name: "role", type: "bytes32" }],
        name: "getRoleAdmin",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "enum ITokenData.TokenType",
                name: "tokenType",
                type: "uint8",
            },
            { internalType: "address", name: "tokenAddress", type: "address" },
            { internalType: "uint256", name: "tokenId", type: "uint256" },
        ],
        name: "getTokenIndex",
        outputs: [
            { internalType: "bool", name: "", type: "bool" },
            { internalType: "uint32", name: "", type: "uint32" },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ internalType: "uint32", name: "tokenIndex", type: "uint32" }],
        name: "getTokenInfo",
        outputs: [
            {
                components: [
                    {
                        internalType: "enum ITokenData.TokenType",
                        name: "tokenType",
                        type: "uint8",
                    },
                    { internalType: "address", name: "tokenAddress", type: "address" },
                    { internalType: "uint256", name: "tokenId", type: "uint256" },
                ],
                internalType: "struct ITokenData.TokenInfo",
                name: "",
                type: "tuple",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { internalType: "bytes32", name: "role", type: "bytes32" },
            { internalType: "address", name: "account", type: "address" },
        ],
        name: "grantRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "bytes32", name: "role", type: "bytes32" },
            { internalType: "address", name: "account", type: "address" },
        ],
        name: "hasRole",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "_admin", type: "address" },
            { internalType: "address", name: "_l1ScrollMessenger", type: "address" },
            { internalType: "address", name: "_rollup", type: "address" },
            { internalType: "address", name: "_withdrawal", type: "address" },
            { internalType: "address", name: "_analyzer", type: "address" },
            { internalType: "address", name: "_contribution", type: "address" },
            {
                internalType: "address[]",
                name: "initialERC20Tokens",
                type: "address[]",
            },
        ],
        name: "initialize",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "uint256", name: "depositId", type: "uint256" },
            { internalType: "bytes32", name: "recipientSaltHash", type: "bytes32" },
            { internalType: "uint32", name: "tokenIndex", type: "uint32" },
            { internalType: "uint256", name: "amount", type: "uint256" },
            { internalType: "address", name: "sender", type: "address" },
        ],
        name: "isDepositValid",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "", type: "address" },
            { internalType: "address", name: "", type: "address" },
            { internalType: "uint256", name: "", type: "uint256" },
            { internalType: "uint256", name: "", type: "uint256" },
            { internalType: "bytes", name: "", type: "bytes" },
        ],
        name: "onERC1155Received",
        outputs: [{ internalType: "bytes4", name: "", type: "bytes4" }],
        stateMutability: "pure",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    { internalType: "address", name: "recipient", type: "address" },
                    { internalType: "uint32", name: "tokenIndex", type: "uint32" },
                    { internalType: "uint256", name: "amount", type: "uint256" },
                    { internalType: "bytes32", name: "nullifier", type: "bytes32" },
                ],
                internalType: "struct WithdrawalLib.Withdrawal[]",
                name: "withdrawals",
                type: "tuple[]",
            },
            {
                internalType: "bytes32[]",
                name: "withdrawalHashes",
                type: "bytes32[]",
            },
        ],
        name: "processWithdrawals",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "proxiableUUID",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { internalType: "bytes32", name: "role", type: "bytes32" },
            { internalType: "address", name: "callerConfirmation", type: "address" },
        ],
        name: "renounceRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "bytes32", name: "role", type: "bytes32" },
            { internalType: "address", name: "account", type: "address" },
        ],
        name: "revokeRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
        name: "supportsInterface",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "newImplementation", type: "address" },
            { internalType: "bytes", name: "data", type: "bytes" },
        ],
        name: "upgradeToAndCall",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
];
//# sourceMappingURL=liquidity-abi.js.map