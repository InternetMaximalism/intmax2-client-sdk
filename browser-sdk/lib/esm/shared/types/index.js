export var TokenType;
(function (TokenType) {
    TokenType[TokenType["NATIVE"] = 0] = "NATIVE";
    TokenType[TokenType["ERC20"] = 1] = "ERC20";
    TokenType[TokenType["ERC721"] = 2] = "ERC721";
    TokenType[TokenType["ERC1155"] = 3] = "ERC1155";
})(TokenType || (TokenType = {}));
export var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus[TransactionStatus["ReadyToClaim"] = 0] = "ReadyToClaim";
    TransactionStatus[TransactionStatus["Processing"] = 1] = "Processing";
    TransactionStatus[TransactionStatus["Completed"] = 2] = "Completed";
    TransactionStatus[TransactionStatus["Rejected"] = 3] = "Rejected";
    TransactionStatus[TransactionStatus["NeedToClaim"] = 4] = "NeedToClaim";
})(TransactionStatus || (TransactionStatus = {}));
export var WithdrawalsStatus;
(function (WithdrawalsStatus) {
    WithdrawalsStatus["Requested"] = "requested";
    WithdrawalsStatus["Relayed"] = "relayed";
    WithdrawalsStatus["Success"] = "success";
    WithdrawalsStatus["NeedClaim"] = "needClaim";
    WithdrawalsStatus["Failed"] = "failed";
})(WithdrawalsStatus || (WithdrawalsStatus = {}));
export var TransactionType;
(function (TransactionType) {
    TransactionType["Mining"] = "Mining";
    TransactionType["Deposit"] = "Deposit";
    TransactionType["Withdraw"] = "Withdraw";
    TransactionType["Send"] = "Send";
    TransactionType["Receive"] = "Receive";
})(TransactionType || (TransactionType = {}));
//# sourceMappingURL=index.js.map