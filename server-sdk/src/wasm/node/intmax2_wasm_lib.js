
let imports = {};
imports['__wbindgen_placeholder__'] = module.exports;
let wasm;
const { TextDecoder, TextEncoder } = require(`util`);

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_export_2.set(idx, obj);
    return idx;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => {
    wasm.__wbindgen_export_6.get(state.dtor)(state.a, state.b)
});

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_6.get(state.dtor)(a, state.b);
                CLOSURE_DTORS.unregister(state);
            } else {
                state.a = a;
            }
        }
    };
    real.original = state;
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(wasm.__wbindgen_export_2.get(mem.getUint32(i, true)));
    }
    wasm.__externref_drop_slice(ptr, len);
    return result;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    for (let i = 0; i < array.length; i++) {
        const add = addToExternrefTable0(array[i]);
        getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}
/**
 * @param {Config} config
 * @param {string} private_key
 * @param {JsMetaDataCursor} cursor
 * @returns {Promise<JsDepositHistory>}
 */
module.exports.fetch_deposit_history = function(config, private_key, cursor) {
    _assertClass(config, Config);
    const ptr0 = passStringToWasm0(private_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    _assertClass(cursor, JsMetaDataCursor);
    const ret = wasm.fetch_deposit_history(config.__wbg_ptr, ptr0, len0, cursor.__wbg_ptr);
    return ret;
};

/**
 * @param {Config} config
 * @param {string} private_key
 * @param {JsMetaDataCursor} cursor
 * @returns {Promise<JsTransferHistory>}
 */
module.exports.fetch_transfer_history = function(config, private_key, cursor) {
    _assertClass(config, Config);
    const ptr0 = passStringToWasm0(private_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    _assertClass(cursor, JsMetaDataCursor);
    const ret = wasm.fetch_transfer_history(config.__wbg_ptr, ptr0, len0, cursor.__wbg_ptr);
    return ret;
};

/**
 * @param {Config} config
 * @param {string} private_key
 * @param {JsMetaDataCursor} cursor
 * @returns {Promise<JsTxHistory>}
 */
module.exports.fetch_tx_history = function(config, private_key, cursor) {
    _assertClass(config, Config);
    const ptr0 = passStringToWasm0(private_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    _assertClass(cursor, JsMetaDataCursor);
    const ret = wasm.fetch_tx_history(config.__wbg_ptr, ptr0, len0, cursor.__wbg_ptr);
    return ret;
};

/**
 * @param {Config} config
 * @param {string} private_key
 * @param {JsDerive} derive
 * @returns {Promise<string>}
 */
module.exports.save_derive_path = function(config, private_key, derive) {
    _assertClass(config, Config);
    const ptr0 = passStringToWasm0(private_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    _assertClass(derive, JsDerive);
    const ret = wasm.save_derive_path(config.__wbg_ptr, ptr0, len0, derive.__wbg_ptr);
    return ret;
};

/**
 * @param {Config} config
 * @param {string} private_key
 * @returns {Promise<JsDerive[]>}
 */
module.exports.get_derive_path_list = function(config, private_key) {
    _assertClass(config, Config);
    const ptr0 = passStringToWasm0(private_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.get_derive_path_list(config.__wbg_ptr, ptr0, len0);
    return ret;
};

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}
/**
 * Decrypt the deposit data.
 * @param {string} private_key
 * @param {Uint8Array} data
 * @returns {Promise<JsDepositData>}
 */
module.exports.decrypt_deposit_data = function(private_key, data) {
    const ptr0 = passStringToWasm0(private_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.decrypt_deposit_data(ptr0, len0, ptr1, len1);
    return ret;
};

/**
 * Decrypt the transfer data. This is also used to decrypt the withdrawal data.
 * @param {string} private_key
 * @param {Uint8Array} data
 * @returns {Promise<JsTransferData>}
 */
module.exports.decrypt_transfer_data = function(private_key, data) {
    const ptr0 = passStringToWasm0(private_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.decrypt_transfer_data(ptr0, len0, ptr1, len1);
    return ret;
};

/**
 * Decrypt the tx data.
 * @param {string} private_key
 * @param {Uint8Array} data
 * @returns {Promise<JsTxData>}
 */
module.exports.decrypt_tx_data = function(private_key, data) {
    const ptr0 = passStringToWasm0(private_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.decrypt_tx_data(ptr0, len0, ptr1, len1);
    return ret;
};

/**
 * @param {string} private_key
 * @returns {Promise<JsAuth>}
 */
module.exports.generate_auth_for_store_vault = function(private_key) {
    const ptr0 = passStringToWasm0(private_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.generate_auth_for_store_vault(ptr0, len0);
    return ret;
};

/**
 * @param {Config} config
 * @param {JsAuth} auth
 * @param {JsMetaDataCursor} cursor
 * @returns {Promise<JsEncryptedData[]>}
 */
module.exports.fetch_encrypted_data = function(config, auth, cursor) {
    _assertClass(config, Config);
    _assertClass(auth, JsAuth);
    _assertClass(cursor, JsMetaDataCursor);
    const ret = wasm.fetch_encrypted_data(config.__wbg_ptr, auth.__wbg_ptr, cursor.__wbg_ptr);
    return ret;
};

/**
 * @param {string} private_key
 * @param {Uint8Array} message
 * @returns {Promise<JsFlatG2>}
 */
module.exports.sign_message = function(private_key, message) {
    const ptr0 = passStringToWasm0(private_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(message, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.sign_message(ptr0, len0, ptr1, len1);
    return ret;
};

/**
 * @param {JsFlatG2} signature
 * @param {string} public_key
 * @param {Uint8Array} message
 * @returns {Promise<boolean>}
 */
module.exports.verify_signature = function(signature, public_key, message) {
    _assertClass(signature, JsFlatG2);
    const ptr0 = passStringToWasm0(public_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(message, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verify_signature(signature.__wbg_ptr, ptr0, len0, ptr1, len1);
    return ret;
};

/**
 * @param {Config} config
 * @param {string} public_key
 * @returns {Promise<JsAccountInfo>}
 */
module.exports.get_account_info = function(config, public_key) {
    _assertClass(config, Config);
    const ptr0 = passStringToWasm0(public_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.get_account_info(config.__wbg_ptr, ptr0, len0);
    return ret;
};

/**
 * Generate a new key pair from the given ethereum private key (32bytes hex string).
 * @param {string} eth_private_key
 * @returns {Promise<IntmaxAccount>}
 */
module.exports.generate_intmax_account_from_eth_key = function(eth_private_key) {
    const ptr0 = passStringToWasm0(eth_private_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.generate_intmax_account_from_eth_key(ptr0, len0);
    return ret;
};

/**
 * Function to take a backup before calling the deposit function of the liquidity contract.
 * You can also get the pubkey_salt_hash from the return value.
 * @param {Config} config
 * @param {string} depositor
 * @param {string} recipient
 * @param {string} amount
 * @param {number} token_type
 * @param {string} token_address
 * @param {string} token_id
 * @param {boolean} is_mining
 * @returns {Promise<JsDepositResult>}
 */
module.exports.prepare_deposit = function(config, depositor, recipient, amount, token_type, token_address, token_id, is_mining) {
    _assertClass(config, Config);
    const ptr0 = passStringToWasm0(depositor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(recipient, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(amount, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passStringToWasm0(token_address, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len3 = WASM_VECTOR_LEN;
    const ptr4 = passStringToWasm0(token_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len4 = WASM_VECTOR_LEN;
    const ret = wasm.prepare_deposit(config.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, token_type, ptr3, len3, ptr4, len4, is_mining);
    return ret;
};

/**
 * Function to send a tx request to the block builder. The return value contains information to take a backup.
 * @param {Config} config
 * @param {string} block_builder_url
 * @param {string} private_key
 * @param {JsTransfer[]} transfers
 * @param {JsPaymentMemoEntry[]} payment_memos
 * @param {string | null} [beneficiary]
 * @param {JsFee | null} [fee]
 * @param {JsFee | null} [collateral_fee]
 * @returns {Promise<JsTxRequestMemo>}
 */
module.exports.send_tx_request = function(config, block_builder_url, private_key, transfers, payment_memos, beneficiary, fee, collateral_fee) {
    _assertClass(config, Config);
    const ptr0 = passStringToWasm0(block_builder_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(private_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArrayJsValueToWasm0(transfers, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passArrayJsValueToWasm0(payment_memos, wasm.__wbindgen_malloc);
    const len3 = WASM_VECTOR_LEN;
    var ptr4 = isLikeNone(beneficiary) ? 0 : passStringToWasm0(beneficiary, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len4 = WASM_VECTOR_LEN;
    let ptr5 = 0;
    if (!isLikeNone(fee)) {
        _assertClass(fee, JsFee);
        ptr5 = fee.__destroy_into_raw();
    }
    let ptr6 = 0;
    if (!isLikeNone(collateral_fee)) {
        _assertClass(collateral_fee, JsFee);
        ptr6 = collateral_fee.__destroy_into_raw();
    }
    const ret = wasm.send_tx_request(config.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, ptr6);
    return ret;
};

/**
 * Function to query the block proposal from the block builder, and
 * send the signed tx tree root to the block builder during taking a backup of the tx.
 * @param {Config} config
 * @param {string} block_builder_url
 * @param {string} private_key
 * @param {JsTxRequestMemo} tx_request_memo
 * @returns {Promise<JsTxResult>}
 */
module.exports.query_and_finalize = function(config, block_builder_url, private_key, tx_request_memo) {
    _assertClass(config, Config);
    const ptr0 = passStringToWasm0(block_builder_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(private_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    _assertClass(tx_request_memo, JsTxRequestMemo);
    const ret = wasm.query_and_finalize(config.__wbg_ptr, ptr0, len0, ptr1, len1, tx_request_memo.__wbg_ptr);
    return ret;
};

/**
 * @param {Config} config
 * @param {string} pubkey
 * @param {string} tx_tree_root
 * @returns {Promise<string>}
 */
module.exports.get_tx_status = function(config, pubkey, tx_tree_root) {
    _assertClass(config, Config);
    const ptr0 = passStringToWasm0(pubkey, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(tx_tree_root, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.get_tx_status(config.__wbg_ptr, ptr0, len0, ptr1, len1);
    return ret;
};

/**
 * Synchronize the user's balance proof. It may take a long time to generate ZKP.
 * @param {Config} config
 * @param {string} private_key
 * @returns {Promise<void>}
 */
module.exports.sync = function(config, private_key) {
    _assertClass(config, Config);
    const ptr0 = passStringToWasm0(private_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.sync(config.__wbg_ptr, ptr0, len0);
    return ret;
};

/**
 * Resynchronize the user's balance proof.
 * @param {Config} config
 * @param {string} private_key
 * @param {boolean} is_deep
 * @returns {Promise<void>}
 */
module.exports.resync = function(config, private_key, is_deep) {
    _assertClass(config, Config);
    const ptr0 = passStringToWasm0(private_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.resync(config.__wbg_ptr, ptr0, len0, is_deep);
    return ret;
};

/**
 * Synchronize the user's withdrawal proof, and send request to the withdrawal aggregator.
 * It may take a long time to generate ZKP.
 * @param {Config} config
 * @param {string} private_key
 * @param {number} fee_token_index
 * @returns {Promise<void>}
 */
module.exports.sync_withdrawals = function(config, private_key, fee_token_index) {
    _assertClass(config, Config);
    const ptr0 = passStringToWasm0(private_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.sync_withdrawals(config.__wbg_ptr, ptr0, len0, fee_token_index);
    return ret;
};

/**
 * Synchronize the user's claim of staking mining, and send request to the withdrawal aggregator.
 * It may take a long time to generate ZKP.
 * @param {Config} config
 * @param {string} private_key
 * @param {string} recipient
 * @param {number} fee_token_index
 * @returns {Promise<void>}
 */
module.exports.sync_claims = function(config, private_key, recipient, fee_token_index) {
    _assertClass(config, Config);
    const ptr0 = passStringToWasm0(private_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(recipient, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.sync_claims(config.__wbg_ptr, ptr0, len0, ptr1, len1, fee_token_index);
    return ret;
};

/**
 * Get the user's data. It is recommended to sync before calling this function.
 * @param {Config} config
 * @param {string} private_key
 * @returns {Promise<JsUserData>}
 */
module.exports.get_user_data = function(config, private_key) {
    _assertClass(config, Config);
    const ptr0 = passStringToWasm0(private_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.get_user_data(config.__wbg_ptr, ptr0, len0);
    return ret;
};

/**
 * @param {Config} config
 * @param {string} private_key
 * @returns {Promise<JsWithdrawalInfo[]>}
 */
module.exports.get_withdrawal_info = function(config, private_key) {
    _assertClass(config, Config);
    const ptr0 = passStringToWasm0(private_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.get_withdrawal_info(config.__wbg_ptr, ptr0, len0);
    return ret;
};

/**
 * @param {Config} config
 * @param {string} recipient
 * @returns {Promise<JsWithdrawalInfo[]>}
 */
module.exports.get_withdrawal_info_by_recipient = function(config, recipient) {
    _assertClass(config, Config);
    const ptr0 = passStringToWasm0(recipient, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.get_withdrawal_info_by_recipient(config.__wbg_ptr, ptr0, len0);
    return ret;
};

/**
 * @param {Config} config
 * @param {string} private_key
 * @returns {Promise<JsMining[]>}
 */
module.exports.get_mining_list = function(config, private_key) {
    _assertClass(config, Config);
    const ptr0 = passStringToWasm0(private_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.get_mining_list(config.__wbg_ptr, ptr0, len0);
    return ret;
};

/**
 * @param {Config} config
 * @param {string} private_key
 * @returns {Promise<JsClaimInfo[]>}
 */
module.exports.get_claim_info = function(config, private_key) {
    _assertClass(config, Config);
    const ptr0 = passStringToWasm0(private_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.get_claim_info(config.__wbg_ptr, ptr0, len0);
    return ret;
};

/**
 * @param {Config} config
 * @param {string} block_builder_url
 * @param {string} pubkey
 * @param {number} fee_token_index
 * @returns {Promise<JsFeeQuote>}
 */
module.exports.quote_transfer_fee = function(config, block_builder_url, pubkey, fee_token_index) {
    _assertClass(config, Config);
    const ptr0 = passStringToWasm0(block_builder_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(pubkey, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.quote_transfer_fee(config.__wbg_ptr, ptr0, len0, ptr1, len1, fee_token_index);
    return ret;
};

/**
 * @param {Config} config
 * @param {number} withdrawal_token_index
 * @param {number} fee_token_index
 * @returns {Promise<JsFeeQuote>}
 */
module.exports.quote_withdrawal_fee = function(config, withdrawal_token_index, fee_token_index) {
    _assertClass(config, Config);
    const ret = wasm.quote_withdrawal_fee(config.__wbg_ptr, withdrawal_token_index, fee_token_index);
    return ret;
};

/**
 * @param {Config} config
 * @param {number} fee_token_index
 * @returns {Promise<JsFeeQuote>}
 */
module.exports.quote_claim_fee = function(config, fee_token_index) {
    _assertClass(config, Config);
    const ret = wasm.quote_claim_fee(config.__wbg_ptr, fee_token_index);
    return ret;
};

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_export_2.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}
/**
 * @param {Config} config
 * @param {JsTransfer} withdrawal_transfer
 * @param {number} fee_token_index
 * @param {boolean} with_claim_fee
 * @returns {Promise<JsWithdrawalTransfers>}
 */
module.exports.generate_withdrawal_transfers = function(config, withdrawal_transfer, fee_token_index, with_claim_fee) {
    _assertClass(config, Config);
    _assertClass(withdrawal_transfer, JsTransfer);
    const ret = wasm.generate_withdrawal_transfers(config.__wbg_ptr, withdrawal_transfer.__wbg_ptr, fee_token_index, with_claim_fee);
    return ret;
};

/**
 * Generate fee payment memo from given transfers and fee transfer indices
 * @param {JsTransfer[]} transfers
 * @param {number | null} [withdrawal_fee_transfer_index]
 * @param {number | null} [claim_fee_transfer_index]
 * @returns {JsPaymentMemoEntry[]}
 */
module.exports.generate_fee_payment_memo = function(transfers, withdrawal_fee_transfer_index, claim_fee_transfer_index) {
    const ptr0 = passArrayJsValueToWasm0(transfers, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.generate_fee_payment_memo(ptr0, len0, isLikeNone(withdrawal_fee_transfer_index) ? 0x100000001 : (withdrawal_fee_transfer_index) >>> 0, isLikeNone(claim_fee_transfer_index) ? 0x100000001 : (claim_fee_transfer_index) >>> 0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v2;
};

function __wbg_adapter_34(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h9573329347911503(arg0, arg1);
}

function __wbg_adapter_37(arg0, arg1, arg2) {
    wasm.closure798_externref_shim(arg0, arg1, arg2);
}

function __wbg_adapter_526(arg0, arg1, arg2, arg3) {
    wasm.closure1617_externref_shim(arg0, arg1, arg2, arg3);
}

const __wbindgen_enum_RequestCredentials = ["omit", "same-origin", "include"];

const __wbindgen_enum_RequestMode = ["same-origin", "no-cors", "cors", "navigate"];

const ConfigFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_config_free(ptr >>> 0, 1));

class Config {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ConfigFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_config_free(ptr, 0);
    }
    /**
     * URL of the store vault server
     * @returns {string}
     */
    get store_vault_server_url() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_config_store_vault_server_url(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * URL of the store vault server
     * @param {string} arg0
     */
    set store_vault_server_url(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_config_store_vault_server_url(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * URL of the balance prover
     * @returns {string}
     */
    get balance_prover_url() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_config_balance_prover_url(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * URL of the balance prover
     * @param {string} arg0
     */
    set balance_prover_url(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_config_balance_prover_url(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * URL of the block validity prover
     * @returns {string}
     */
    get validity_prover_url() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_config_validity_prover_url(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * URL of the block validity prover
     * @param {string} arg0
     */
    set validity_prover_url(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_config_validity_prover_url(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * URL of the withdrawal aggregator
     * @returns {string}
     */
    get withdrawal_server_url() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_config_withdrawal_server_url(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * URL of the withdrawal aggregator
     * @param {string} arg0
     */
    set withdrawal_server_url(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_config_withdrawal_server_url(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * Time to reach the rollup contract after taking a backup of the deposit
     * If this time is exceeded, the deposit backup will be ignored
     * @returns {bigint}
     */
    get deposit_timeout() {
        const ret = wasm.__wbg_get_config_deposit_timeout(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Time to reach the rollup contract after taking a backup of the deposit
     * If this time is exceeded, the deposit backup will be ignored
     * @param {bigint} arg0
     */
    set deposit_timeout(arg0) {
        wasm.__wbg_set_config_deposit_timeout(this.__wbg_ptr, arg0);
    }
    /**
     * Time to reach the rollup contract after sending a tx request
     * If this time is exceeded, the tx request will be ignored
     * @returns {bigint}
     */
    get tx_timeout() {
        const ret = wasm.__wbg_get_config_tx_timeout(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Time to reach the rollup contract after sending a tx request
     * If this time is exceeded, the tx request will be ignored
     * @param {bigint} arg0
     */
    set tx_timeout(arg0) {
        wasm.__wbg_set_config_tx_timeout(this.__wbg_ptr, arg0);
    }
    /**
     * Interval between retries for tx requests
     * @returns {bigint}
     */
    get block_builder_request_interval() {
        const ret = wasm.__wbg_get_config_block_builder_request_interval(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Interval between retries for tx requests
     * @param {bigint} arg0
     */
    set block_builder_request_interval(arg0) {
        wasm.__wbg_set_config_block_builder_request_interval(this.__wbg_ptr, arg0);
    }
    /**
     * Maximum number of retries for tx requests,
     * @returns {bigint}
     */
    get block_builder_request_limit() {
        const ret = wasm.__wbg_get_config_block_builder_request_limit(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Maximum number of retries for tx requests,
     * @param {bigint} arg0
     */
    set block_builder_request_limit(arg0) {
        wasm.__wbg_set_config_block_builder_request_limit(this.__wbg_ptr, arg0);
    }
    /**
     * Initial wait time for tx query
     * @returns {bigint}
     */
    get block_builder_query_wait_time() {
        const ret = wasm.__wbg_get_config_block_builder_query_wait_time(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Initial wait time for tx query
     * @param {bigint} arg0
     */
    set block_builder_query_wait_time(arg0) {
        wasm.__wbg_set_config_block_builder_query_wait_time(this.__wbg_ptr, arg0);
    }
    /**
     * Interval between retries for tx queries
     * @returns {bigint}
     */
    get block_builder_query_interval() {
        const ret = wasm.__wbg_get_config_block_builder_query_interval(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Interval between retries for tx queries
     * @param {bigint} arg0
     */
    set block_builder_query_interval(arg0) {
        wasm.__wbg_set_config_block_builder_query_interval(this.__wbg_ptr, arg0);
    }
    /**
     * Maximum number of retries for tx queries
     * @returns {bigint}
     */
    get block_builder_query_limit() {
        const ret = wasm.__wbg_get_config_block_builder_query_limit(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Maximum number of retries for tx queries
     * @param {bigint} arg0
     */
    set block_builder_query_limit(arg0) {
        wasm.__wbg_set_config_block_builder_query_limit(this.__wbg_ptr, arg0);
    }
    /**
     * URL of the Ethereum RPC
     * @returns {string}
     */
    get l1_rpc_url() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_config_l1_rpc_url(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * URL of the Ethereum RPC
     * @param {string} arg0
     */
    set l1_rpc_url(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_config_l1_rpc_url(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * Chain ID of the Ethereum network
     * @returns {bigint}
     */
    get l1_chain_id() {
        const ret = wasm.__wbg_get_config_l1_chain_id(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Chain ID of the Ethereum network
     * @param {bigint} arg0
     */
    set l1_chain_id(arg0) {
        wasm.__wbg_set_config_l1_chain_id(this.__wbg_ptr, arg0);
    }
    /**
     * Address of the liquidity contract
     * @returns {string}
     */
    get liquidity_contract_address() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_config_liquidity_contract_address(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Address of the liquidity contract
     * @param {string} arg0
     */
    set liquidity_contract_address(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_config_liquidity_contract_address(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * URL of the Scroll RPC
     * @returns {string}
     */
    get l2_rpc_url() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_config_l2_rpc_url(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * URL of the Scroll RPC
     * @param {string} arg0
     */
    set l2_rpc_url(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_config_l2_rpc_url(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * Chain ID of the Scroll network
     * @returns {bigint}
     */
    get l2_chain_id() {
        const ret = wasm.__wbg_get_config_l2_chain_id(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Chain ID of the Scroll network
     * @param {bigint} arg0
     */
    set l2_chain_id(arg0) {
        wasm.__wbg_set_config_l2_chain_id(this.__wbg_ptr, arg0);
    }
    /**
     * Address of the rollup contract
     * @returns {string}
     */
    get rollup_contract_address() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_config_rollup_contract_address(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Address of the rollup contract
     * @param {string} arg0
     */
    set rollup_contract_address(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_config_rollup_contract_address(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * Scroll block number when the rollup contract was deployed
     * @returns {bigint}
     */
    get rollup_contract_deployed_block_number() {
        const ret = wasm.__wbg_get_config_rollup_contract_deployed_block_number(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Scroll block number when the rollup contract was deployed
     * @param {bigint} arg0
     */
    set rollup_contract_deployed_block_number(arg0) {
        wasm.__wbg_set_config_rollup_contract_deployed_block_number(this.__wbg_ptr, arg0);
    }
    /**
     * Address of the withdrawal contract
     * @returns {string}
     */
    get withdrawal_contract_address() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_config_withdrawal_contract_address(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Address of the withdrawal contract
     * @param {string} arg0
     */
    set withdrawal_contract_address(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_config_withdrawal_contract_address(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} store_vault_server_url
     * @param {string} balance_prover_url
     * @param {string} validity_prover_url
     * @param {string} withdrawal_server_url
     * @param {bigint} deposit_timeout
     * @param {bigint} tx_timeout
     * @param {bigint} block_builder_request_interval
     * @param {bigint} block_builder_request_limit
     * @param {bigint} block_builder_query_wait_time
     * @param {bigint} block_builder_query_interval
     * @param {bigint} block_builder_query_limit
     * @param {string} l1_rpc_url
     * @param {bigint} l1_chain_id
     * @param {string} liquidity_contract_address
     * @param {string} l2_rpc_url
     * @param {bigint} l2_chain_id
     * @param {string} rollup_contract_address
     * @param {bigint} rollup_contract_deployed_block_number
     * @param {string} withdrawal_contract_address
     */
    constructor(store_vault_server_url, balance_prover_url, validity_prover_url, withdrawal_server_url, deposit_timeout, tx_timeout, block_builder_request_interval, block_builder_request_limit, block_builder_query_wait_time, block_builder_query_interval, block_builder_query_limit, l1_rpc_url, l1_chain_id, liquidity_contract_address, l2_rpc_url, l2_chain_id, rollup_contract_address, rollup_contract_deployed_block_number, withdrawal_contract_address) {
        const ptr0 = passStringToWasm0(store_vault_server_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(balance_prover_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(validity_prover_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passStringToWasm0(withdrawal_server_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len3 = WASM_VECTOR_LEN;
        const ptr4 = passStringToWasm0(l1_rpc_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len4 = WASM_VECTOR_LEN;
        const ptr5 = passStringToWasm0(liquidity_contract_address, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len5 = WASM_VECTOR_LEN;
        const ptr6 = passStringToWasm0(l2_rpc_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len6 = WASM_VECTOR_LEN;
        const ptr7 = passStringToWasm0(rollup_contract_address, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len7 = WASM_VECTOR_LEN;
        const ptr8 = passStringToWasm0(withdrawal_contract_address, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len8 = WASM_VECTOR_LEN;
        const ret = wasm.config_new(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, deposit_timeout, tx_timeout, block_builder_request_interval, block_builder_request_limit, block_builder_query_wait_time, block_builder_query_interval, block_builder_query_limit, ptr4, len4, l1_chain_id, ptr5, len5, ptr6, len6, l2_chain_id, ptr7, len7, rollup_contract_deployed_block_number, ptr8, len8);
        this.__wbg_ptr = ret >>> 0;
        ConfigFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
module.exports.Config = Config;

const IntmaxAccountFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_intmaxaccount_free(ptr >>> 0, 1));

class IntmaxAccount {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(IntmaxAccount.prototype);
        obj.__wbg_ptr = ptr;
        IntmaxAccountFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IntmaxAccountFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_intmaxaccount_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get privkey() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_intmaxaccount_privkey(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set privkey(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_intmaxaccount_privkey(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get pubkey() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_intmaxaccount_pubkey(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set pubkey(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_intmaxaccount_pubkey(this.__wbg_ptr, ptr0, len0);
    }
}
module.exports.IntmaxAccount = IntmaxAccount;

const JsAccountInfoFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsaccountinfo_free(ptr >>> 0, 1));

class JsAccountInfo {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsAccountInfo.prototype);
        obj.__wbg_ptr = ptr;
        JsAccountInfoFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsAccountInfoFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsaccountinfo_free(ptr, 0);
    }
    /**
     * @returns {bigint | undefined}
     */
    get account_id() {
        const ret = wasm.__wbg_get_jsaccountinfo_account_id(this.__wbg_ptr);
        return ret[0] === 0 ? undefined : BigInt.asUintN(64, ret[1]);
    }
    /**
     * @param {bigint | null} [arg0]
     */
    set account_id(arg0) {
        wasm.__wbg_set_jsaccountinfo_account_id(this.__wbg_ptr, !isLikeNone(arg0), isLikeNone(arg0) ? BigInt(0) : arg0);
    }
    /**
     * @returns {number}
     */
    get block_number() {
        const ret = wasm.__wbg_get_jsaccountinfo_block_number(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set block_number(arg0) {
        wasm.__wbg_set_jsaccountinfo_block_number(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get last_block_number() {
        const ret = wasm.__wbg_get_jsaccountinfo_last_block_number(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set last_block_number(arg0) {
        wasm.__wbg_set_jsaccountinfo_last_block_number(this.__wbg_ptr, arg0);
    }
}
module.exports.JsAccountInfo = JsAccountInfo;

const JsAuthFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsauth_free(ptr >>> 0, 1));

class JsAuth {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsAuth.prototype);
        obj.__wbg_ptr = ptr;
        JsAuthFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsAuthFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsauth_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get pubkey() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jsauth_pubkey(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set pubkey(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsauth_pubkey(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {bigint}
     */
    get expiry() {
        const ret = wasm.__wbg_get_jsauth_expiry(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * @param {bigint} arg0
     */
    set expiry(arg0) {
        wasm.__wbg_set_jsauth_expiry(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {JsFlatG2}
     */
    get signature() {
        const ret = wasm.__wbg_get_jsauth_signature(this.__wbg_ptr);
        return JsFlatG2.__wrap(ret);
    }
    /**
     * @param {JsFlatG2} arg0
     */
    set signature(arg0) {
        _assertClass(arg0, JsFlatG2);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_jsauth_signature(this.__wbg_ptr, ptr0);
    }
}
module.exports.JsAuth = JsAuth;

const JsBlockFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsblock_free(ptr >>> 0, 1));

class JsBlock {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsBlock.prototype);
        obj.__wbg_ptr = ptr;
        JsBlockFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsBlockFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsblock_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get prev_block_hash() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jsblock_prev_block_hash(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set prev_block_hash(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsblock_prev_block_hash(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get deposit_tree_root() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jsblock_deposit_tree_root(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set deposit_tree_root(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsblock_deposit_tree_root(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get signature_hash() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jsblock_signature_hash(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set signature_hash(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsblock_signature_hash(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {bigint}
     */
    get timestamp() {
        const ret = wasm.__wbg_get_jsblock_timestamp(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * @param {bigint} arg0
     */
    set timestamp(arg0) {
        wasm.__wbg_set_jsblock_timestamp(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get block_number() {
        const ret = wasm.__wbg_get_jsblock_block_number(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set block_number(arg0) {
        wasm.__wbg_set_jsblock_block_number(this.__wbg_ptr, arg0);
    }
}
module.exports.JsBlock = JsBlock;

const JsBlockProposalFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsblockproposal_free(ptr >>> 0, 1));

class JsBlockProposal {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsBlockProposalFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsblockproposal_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    tx_tree_root() {
        let deferred2_0;
        let deferred2_1;
        try {
            const ret = wasm.jsblockproposal_tx_tree_root(this.__wbg_ptr);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
}
module.exports.JsBlockProposal = JsBlockProposal;

const JsClaimFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsclaim_free(ptr >>> 0, 1));

class JsClaim {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsClaim.prototype);
        obj.__wbg_ptr = ptr;
        JsClaimFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsClaimFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsclaim_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get recipient() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jsclaim_recipient(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set recipient(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsclaim_recipient(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get amount() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jsclaim_amount(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set amount(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsclaim_amount(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get nullifier() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jsclaim_nullifier(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set nullifier(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsblock_deposit_tree_root(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get block_hash() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jsclaim_block_hash(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set block_hash(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsclaim_block_hash(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {number}
     */
    get block_number() {
        const ret = wasm.__wbg_get_jsblock_block_number(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set block_number(arg0) {
        wasm.__wbg_set_jsblock_block_number(this.__wbg_ptr, arg0);
    }
}
module.exports.JsClaim = JsClaim;

const JsClaimInfoFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsclaiminfo_free(ptr >>> 0, 1));

class JsClaimInfo {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsClaimInfo.prototype);
        obj.__wbg_ptr = ptr;
        JsClaimInfoFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsClaimInfoFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsclaiminfo_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get status() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jsclaiminfo_status(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set status(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsclaim_recipient(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {JsClaim}
     */
    get claim() {
        const ret = wasm.__wbg_get_jsclaiminfo_claim(this.__wbg_ptr);
        return JsClaim.__wrap(ret);
    }
    /**
     * @param {JsClaim} arg0
     */
    set claim(arg0) {
        _assertClass(arg0, JsClaim);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_jsclaiminfo_claim(this.__wbg_ptr, ptr0);
    }
}
module.exports.JsClaimInfo = JsClaimInfo;

const JsContractWithdrawalFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jscontractwithdrawal_free(ptr >>> 0, 1));

class JsContractWithdrawal {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsContractWithdrawal.prototype);
        obj.__wbg_ptr = ptr;
        JsContractWithdrawalFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsContractWithdrawalFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jscontractwithdrawal_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get recipient() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jscontractwithdrawal_recipient(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set recipient(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsclaim_recipient(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {number}
     */
    get token_index() {
        const ret = wasm.__wbg_get_jscontractwithdrawal_token_index(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set token_index(arg0) {
        wasm.__wbg_set_jscontractwithdrawal_token_index(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {string}
     */
    get amount() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jscontractwithdrawal_amount(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set amount(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsclaim_amount(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get nullifier() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jscontractwithdrawal_nullifier(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set nullifier(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsblock_deposit_tree_root(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} recipient
     * @param {number} token_index
     * @param {string} amount
     * @param {string} nullifier
     */
    constructor(recipient, token_index, amount, nullifier) {
        const ptr0 = passStringToWasm0(recipient, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(amount, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(nullifier, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.jscontractwithdrawal_new(ptr0, len0, token_index, ptr1, len1, ptr2, len2);
        this.__wbg_ptr = ret >>> 0;
        JsContractWithdrawalFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {string}
     */
    hash() {
        let deferred2_0;
        let deferred2_1;
        try {
            const ret = wasm.jscontractwithdrawal_hash(this.__wbg_ptr);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
}
module.exports.JsContractWithdrawal = JsContractWithdrawal;

const JsDepositDataFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsdepositdata_free(ptr >>> 0, 1));

class JsDepositData {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsDepositData.prototype);
        obj.__wbg_ptr = ptr;
        JsDepositDataFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsDepositDataFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsdepositdata_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get deposit_salt() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jsdepositdata_deposit_salt(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set deposit_salt(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsdepositdata_deposit_salt(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get depositor() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jsdepositdata_depositor(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set depositor(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsdepositdata_depositor(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get pubkey_salt_hash() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jsdepositdata_pubkey_salt_hash(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set pubkey_salt_hash(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsdepositdata_pubkey_salt_hash(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get amount() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jsdepositdata_amount(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set amount(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsdepositdata_amount(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {boolean}
     */
    get is_eligible() {
        const ret = wasm.__wbg_get_jsdepositdata_is_eligible(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {boolean} arg0
     */
    set is_eligible(arg0) {
        wasm.__wbg_set_jsdepositdata_is_eligible(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get token_type() {
        const ret = wasm.__wbg_get_jsdepositdata_token_type(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set token_type(arg0) {
        wasm.__wbg_set_jsdepositdata_token_type(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {string}
     */
    get token_address() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jsdepositdata_token_address(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set token_address(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsdepositdata_token_address(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get token_id() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jsdepositdata_token_id(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set token_id(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsdepositdata_token_id(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {boolean}
     */
    get is_mining() {
        const ret = wasm.__wbg_get_jsdepositdata_is_mining(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {boolean} arg0
     */
    set is_mining(arg0) {
        wasm.__wbg_set_jsdepositdata_is_mining(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number | undefined}
     */
    get token_index() {
        const ret = wasm.__wbg_get_jsdepositdata_token_index(this.__wbg_ptr);
        return ret === 0x100000001 ? undefined : ret;
    }
    /**
     * @param {number | null} [arg0]
     */
    set token_index(arg0) {
        wasm.__wbg_set_jsdepositdata_token_index(this.__wbg_ptr, isLikeNone(arg0) ? 0x100000001 : (arg0) >>> 0);
    }
}
module.exports.JsDepositData = JsDepositData;

const JsDepositEntryFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsdepositentry_free(ptr >>> 0, 1));

class JsDepositEntry {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsDepositEntry.prototype);
        obj.__wbg_ptr = ptr;
        JsDepositEntryFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof JsDepositEntry)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsDepositEntryFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsdepositentry_free(ptr, 0);
    }
    /**
     * @returns {JsDepositData}
     */
    get data() {
        const ret = wasm.__wbg_get_jsdepositentry_data(this.__wbg_ptr);
        return JsDepositData.__wrap(ret);
    }
    /**
     * @param {JsDepositData} arg0
     */
    set data(arg0) {
        _assertClass(arg0, JsDepositData);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_jsdepositentry_data(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {JsEntryStatusWithBlockNumber}
     */
    get status() {
        const ret = wasm.__wbg_get_jsdepositentry_status(this.__wbg_ptr);
        return JsEntryStatusWithBlockNumber.__wrap(ret);
    }
    /**
     * @param {JsEntryStatusWithBlockNumber} arg0
     */
    set status(arg0) {
        _assertClass(arg0, JsEntryStatusWithBlockNumber);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_jsdepositentry_status(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {JsMetaData}
     */
    get meta() {
        const ret = wasm.__wbg_get_jsdepositentry_meta(this.__wbg_ptr);
        return JsMetaData.__wrap(ret);
    }
    /**
     * @param {JsMetaData} arg0
     */
    set meta(arg0) {
        _assertClass(arg0, JsMetaData);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_jsdepositentry_meta(this.__wbg_ptr, ptr0);
    }
}
module.exports.JsDepositEntry = JsDepositEntry;

const JsDepositHistoryFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsdeposithistory_free(ptr >>> 0, 1));

class JsDepositHistory {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsDepositHistory.prototype);
        obj.__wbg_ptr = ptr;
        JsDepositHistoryFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsDepositHistoryFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsdeposithistory_free(ptr, 0);
    }
    /**
     * @returns {JsDepositEntry[]}
     */
    get history() {
        const ret = wasm.__wbg_get_jsdeposithistory_history(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {JsDepositEntry[]} arg0
     */
    set history(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsdeposithistory_history(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {JsMetaDataCursorResponse}
     */
    get cursor_response() {
        const ret = wasm.__wbg_get_jsdeposithistory_cursor_response(this.__wbg_ptr);
        return JsMetaDataCursorResponse.__wrap(ret);
    }
    /**
     * @param {JsMetaDataCursorResponse} arg0
     */
    set cursor_response(arg0) {
        _assertClass(arg0, JsMetaDataCursorResponse);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_jsdeposithistory_cursor_response(this.__wbg_ptr, ptr0);
    }
}
module.exports.JsDepositHistory = JsDepositHistory;

const JsDepositResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsdepositresult_free(ptr >>> 0, 1));

class JsDepositResult {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsDepositResult.prototype);
        obj.__wbg_ptr = ptr;
        JsDepositResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsDepositResultFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsdepositresult_free(ptr, 0);
    }
    /**
     * @returns {JsDepositData}
     */
    get deposit_data() {
        const ret = wasm.__wbg_get_jsdepositresult_deposit_data(this.__wbg_ptr);
        return JsDepositData.__wrap(ret);
    }
    /**
     * @param {JsDepositData} arg0
     */
    set deposit_data(arg0) {
        _assertClass(arg0, JsDepositData);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_jsdepositresult_deposit_data(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {string}
     */
    get deposit_uuid() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jsdepositresult_deposit_uuid(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set deposit_uuid(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsdepositresult_deposit_uuid(this.__wbg_ptr, ptr0, len0);
    }
}
module.exports.JsDepositResult = JsDepositResult;

const JsDeriveFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsderive_free(ptr >>> 0, 1));

class JsDerive {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsDerive.prototype);
        obj.__wbg_ptr = ptr;
        JsDeriveFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsDeriveFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsderive_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get derive_path() {
        const ret = wasm.__wbg_get_jsderive_derive_path(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set derive_path(arg0) {
        wasm.__wbg_set_jsderive_derive_path(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get redeposit_path() {
        const ret = wasm.__wbg_get_jsderive_redeposit_path(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set redeposit_path(arg0) {
        wasm.__wbg_set_jsderive_redeposit_path(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} derive_path
     * @param {number} redeposit_path
     */
    constructor(derive_path, redeposit_path) {
        const ret = wasm.jsderive_new(derive_path, redeposit_path);
        this.__wbg_ptr = ret >>> 0;
        JsDeriveFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
module.exports.JsDerive = JsDerive;

const JsEncryptedDataFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsencrypteddata_free(ptr >>> 0, 1));

class JsEncryptedData {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsEncryptedData.prototype);
        obj.__wbg_ptr = ptr;
        JsEncryptedDataFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsEncryptedDataFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsencrypteddata_free(ptr, 0);
    }
    /**
     * @returns {Uint8Array}
     */
    get data() {
        const ret = wasm.__wbg_get_jsencrypteddata_data(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} arg0
     */
    set data(arg0) {
        const ptr0 = passArray8ToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsencrypteddata_data(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get uuid() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jsencrypteddata_uuid(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set uuid(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsencrypteddata_uuid(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {bigint}
     */
    get timestamp() {
        const ret = wasm.__wbg_get_jsencrypteddata_timestamp(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * @param {bigint} arg0
     */
    set timestamp(arg0) {
        wasm.__wbg_set_jsencrypteddata_timestamp(this.__wbg_ptr, arg0);
    }
    /**
     * Deposit, Transfer(Receive), Tx(Send)
     * @returns {string}
     */
    get data_type() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jsencrypteddata_data_type(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Deposit, Transfer(Receive), Tx(Send)
     * @param {string} arg0
     */
    set data_type(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsencrypteddata_data_type(this.__wbg_ptr, ptr0, len0);
    }
}
module.exports.JsEncryptedData = JsEncryptedData;

const JsEntryStatusWithBlockNumberFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsentrystatuswithblocknumber_free(ptr >>> 0, 1));

class JsEntryStatusWithBlockNumber {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsEntryStatusWithBlockNumber.prototype);
        obj.__wbg_ptr = ptr;
        JsEntryStatusWithBlockNumberFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsEntryStatusWithBlockNumberFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsentrystatuswithblocknumber_free(ptr, 0);
    }
    /**
     * The status of the entry
     * - "settled": The entry has been on-chain but not yet incorporated into the proof
     * - "processed": The entry has been incorporated into the proof
     * - "pending": The entry is not yet on-chain
     * - "timeout": The entry is not yet on-chain and has timed out
     * @returns {string}
     */
    get status() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jsentrystatuswithblocknumber_status(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The status of the entry
     * - "settled": The entry has been on-chain but not yet incorporated into the proof
     * - "processed": The entry has been incorporated into the proof
     * - "pending": The entry is not yet on-chain
     * - "timeout": The entry is not yet on-chain and has timed out
     * @param {string} arg0
     */
    set status(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsentrystatuswithblocknumber_status(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {number | undefined}
     */
    get block_number() {
        const ret = wasm.__wbg_get_jsentrystatuswithblocknumber_block_number(this.__wbg_ptr);
        return ret === 0x100000001 ? undefined : ret;
    }
    /**
     * @param {number | null} [arg0]
     */
    set block_number(arg0) {
        wasm.__wbg_set_jsentrystatuswithblocknumber_block_number(this.__wbg_ptr, isLikeNone(arg0) ? 0x100000001 : (arg0) >>> 0);
    }
}
module.exports.JsEntryStatusWithBlockNumber = JsEntryStatusWithBlockNumber;

const JsFeeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsfee_free(ptr >>> 0, 1));

class JsFee {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsFee.prototype);
        obj.__wbg_ptr = ptr;
        JsFeeFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof JsFee)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsFeeFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsfee_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get amount() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jsfee_amount(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set amount(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsfee_amount(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {number}
     */
    get token_index() {
        const ret = wasm.__wbg_get_jsfee_token_index(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set token_index(arg0) {
        wasm.__wbg_set_jsfee_token_index(this.__wbg_ptr, arg0);
    }
    /**
     * @param {string} amount
     * @param {number} token_index
     */
    constructor(amount, token_index) {
        const ptr0 = passStringToWasm0(amount, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.jsfee_new(ptr0, len0, token_index);
        this.__wbg_ptr = ret >>> 0;
        JsFeeFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
module.exports.JsFee = JsFee;

const JsFeeInfoFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsfeeinfo_free(ptr >>> 0, 1));

class JsFeeInfo {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsFeeInfoFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsfeeinfo_free(ptr, 0);
    }
    /**
     * @returns {string | undefined}
     */
    get beneficiary() {
        const ret = wasm.__wbg_get_jsfeeinfo_beneficiary(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @param {string | null} [arg0]
     */
    set beneficiary(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsfeeinfo_beneficiary(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {JsFee[] | undefined}
     */
    get registration_fee() {
        const ret = wasm.__wbg_get_jsfeeinfo_registration_fee(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        }
        return v1;
    }
    /**
     * @param {JsFee[] | null} [arg0]
     */
    set registration_fee(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsfeeinfo_registration_fee(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {JsFee[] | undefined}
     */
    get non_registration_fee() {
        const ret = wasm.__wbg_get_jsfeeinfo_non_registration_fee(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        }
        return v1;
    }
    /**
     * @param {JsFee[] | null} [arg0]
     */
    set non_registration_fee(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsfeeinfo_non_registration_fee(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {JsFee[] | undefined}
     */
    get registration_collateral_fee() {
        const ret = wasm.__wbg_get_jsfeeinfo_registration_collateral_fee(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        }
        return v1;
    }
    /**
     * @param {JsFee[] | null} [arg0]
     */
    set registration_collateral_fee(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsfeeinfo_registration_collateral_fee(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {JsFee[] | undefined}
     */
    get non_registration_collateral_fee() {
        const ret = wasm.__wbg_get_jsfeeinfo_non_registration_collateral_fee(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        }
        return v1;
    }
    /**
     * @param {JsFee[] | null} [arg0]
     */
    set non_registration_collateral_fee(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsfeeinfo_non_registration_collateral_fee(this.__wbg_ptr, ptr0, len0);
    }
}
module.exports.JsFeeInfo = JsFeeInfo;

const JsFeeQuoteFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsfeequote_free(ptr >>> 0, 1));

class JsFeeQuote {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsFeeQuote.prototype);
        obj.__wbg_ptr = ptr;
        JsFeeQuoteFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsFeeQuoteFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsfeequote_free(ptr, 0);
    }
    /**
     * @returns {string | undefined}
     */
    get beneficiary() {
        const ret = wasm.__wbg_get_jsfeequote_beneficiary(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @param {string | null} [arg0]
     */
    set beneficiary(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsfeeinfo_beneficiary(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {JsFee | undefined}
     */
    get fee() {
        const ret = wasm.__wbg_get_jsfeequote_fee(this.__wbg_ptr);
        return ret === 0 ? undefined : JsFee.__wrap(ret);
    }
    /**
     * @param {JsFee | null} [arg0]
     */
    set fee(arg0) {
        let ptr0 = 0;
        if (!isLikeNone(arg0)) {
            _assertClass(arg0, JsFee);
            ptr0 = arg0.__destroy_into_raw();
        }
        wasm.__wbg_set_jsfeequote_fee(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {JsFee | undefined}
     */
    get collateral_fee() {
        const ret = wasm.__wbg_get_jsfeequote_collateral_fee(this.__wbg_ptr);
        return ret === 0 ? undefined : JsFee.__wrap(ret);
    }
    /**
     * @param {JsFee | null} [arg0]
     */
    set collateral_fee(arg0) {
        let ptr0 = 0;
        if (!isLikeNone(arg0)) {
            _assertClass(arg0, JsFee);
            ptr0 = arg0.__destroy_into_raw();
        }
        wasm.__wbg_set_jsfeequote_collateral_fee(this.__wbg_ptr, ptr0);
    }
}
module.exports.JsFeeQuote = JsFeeQuote;

const JsFlatG2Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsflatg2_free(ptr >>> 0, 1));

class JsFlatG2 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsFlatG2.prototype);
        obj.__wbg_ptr = ptr;
        JsFlatG2Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsFlatG2Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsflatg2_free(ptr, 0);
    }
    /**
     * @returns {string[]}
     */
    get elements() {
        const ret = wasm.__wbg_get_jsflatg2_elements(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {string[]} arg0
     */
    set elements(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsflatg2_elements(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string[]} elements
     */
    constructor(elements) {
        const ptr0 = passArrayJsValueToWasm0(elements, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.jsflatg2_new(ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        JsFlatG2Finalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
module.exports.JsFlatG2 = JsFlatG2;

const JsGenericAddressFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsgenericaddress_free(ptr >>> 0, 1));

class JsGenericAddress {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsGenericAddress.prototype);
        obj.__wbg_ptr = ptr;
        JsGenericAddressFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsGenericAddressFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsgenericaddress_free(ptr, 0);
    }
    /**
     * true if pubkey, false if ethereum address
     * @returns {boolean}
     */
    get is_pubkey() {
        const ret = wasm.__wbg_get_jsgenericaddress_is_pubkey(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * true if pubkey, false if ethereum address
     * @param {boolean} arg0
     */
    set is_pubkey(arg0) {
        wasm.__wbg_set_jsgenericaddress_is_pubkey(this.__wbg_ptr, arg0);
    }
    /**
     * hex string of 32 bytes (pubkey) or 20 bytes (ethereum address)
     * @returns {string}
     */
    get data() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jsgenericaddress_data(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * hex string of 32 bytes (pubkey) or 20 bytes (ethereum address)
     * @param {string} arg0
     */
    set data(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsclaim_recipient(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {boolean} is_pubkey
     * @param {string} data
     */
    constructor(is_pubkey, data) {
        const ptr0 = passStringToWasm0(data, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.jsgenericaddress_new(is_pubkey, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0] >>> 0;
        JsGenericAddressFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
module.exports.JsGenericAddress = JsGenericAddress;

const JsMetaDataFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsmetadata_free(ptr >>> 0, 1));

class JsMetaData {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsMetaData.prototype);
        obj.__wbg_ptr = ptr;
        JsMetaDataFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsMetaDataFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsmetadata_free(ptr, 0);
    }
    /**
     * @returns {bigint}
     */
    get timestamp() {
        const ret = wasm.__wbg_get_jsblock_timestamp(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * @param {bigint} arg0
     */
    set timestamp(arg0) {
        wasm.__wbg_set_jsblock_timestamp(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {string}
     */
    get uuid() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jsmetadata_uuid(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set uuid(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsblock_prev_block_hash(this.__wbg_ptr, ptr0, len0);
    }
}
module.exports.JsMetaData = JsMetaData;

const JsMetaDataCursorFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsmetadatacursor_free(ptr >>> 0, 1));

class JsMetaDataCursor {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsMetaDataCursorFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsmetadatacursor_free(ptr, 0);
    }
    /**
     * @returns {JsMetaData | undefined}
     */
    get cursor() {
        const ret = wasm.__wbg_get_jsmetadatacursor_cursor(this.__wbg_ptr);
        return ret === 0 ? undefined : JsMetaData.__wrap(ret);
    }
    /**
     * @param {JsMetaData | null} [arg0]
     */
    set cursor(arg0) {
        let ptr0 = 0;
        if (!isLikeNone(arg0)) {
            _assertClass(arg0, JsMetaData);
            ptr0 = arg0.__destroy_into_raw();
        }
        wasm.__wbg_set_jsmetadatacursor_cursor(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {string}
     */
    get order() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jsmetadatacursor_order(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set order(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsblock_signature_hash(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {number | undefined}
     */
    get limit() {
        const ret = wasm.__wbg_get_jsmetadatacursor_limit(this.__wbg_ptr);
        return ret === 0x100000001 ? undefined : ret;
    }
    /**
     * @param {number | null} [arg0]
     */
    set limit(arg0) {
        wasm.__wbg_set_jsmetadatacursor_limit(this.__wbg_ptr, isLikeNone(arg0) ? 0x100000001 : (arg0) >>> 0);
    }
    /**
     * @param {JsMetaData | null | undefined} cursor
     * @param {string} order
     * @param {number | null} [limit]
     */
    constructor(cursor, order, limit) {
        let ptr0 = 0;
        if (!isLikeNone(cursor)) {
            _assertClass(cursor, JsMetaData);
            ptr0 = cursor.__destroy_into_raw();
        }
        const ptr1 = passStringToWasm0(order, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.jsmetadatacursor_new(ptr0, ptr1, len1, isLikeNone(limit) ? 0x100000001 : (limit) >>> 0);
        this.__wbg_ptr = ret >>> 0;
        JsMetaDataCursorFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
module.exports.JsMetaDataCursor = JsMetaDataCursor;

const JsMetaDataCursorResponseFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsmetadatacursorresponse_free(ptr >>> 0, 1));

class JsMetaDataCursorResponse {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsMetaDataCursorResponse.prototype);
        obj.__wbg_ptr = ptr;
        JsMetaDataCursorResponseFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsMetaDataCursorResponseFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsmetadatacursorresponse_free(ptr, 0);
    }
    /**
     * @returns {JsMetaData | undefined}
     */
    get next_cursor() {
        const ret = wasm.__wbg_get_jsmetadatacursorresponse_next_cursor(this.__wbg_ptr);
        return ret === 0 ? undefined : JsMetaData.__wrap(ret);
    }
    /**
     * @param {JsMetaData | null} [arg0]
     */
    set next_cursor(arg0) {
        let ptr0 = 0;
        if (!isLikeNone(arg0)) {
            _assertClass(arg0, JsMetaData);
            ptr0 = arg0.__destroy_into_raw();
        }
        wasm.__wbg_set_jsmetadatacursorresponse_next_cursor(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {boolean}
     */
    get has_more() {
        const ret = wasm.__wbg_get_jsmetadatacursorresponse_has_more(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {boolean} arg0
     */
    set has_more(arg0) {
        wasm.__wbg_set_jsmetadatacursorresponse_has_more(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get total_count() {
        const ret = wasm.__wbg_get_jsmetadatacursorresponse_total_count(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set total_count(arg0) {
        wasm.__wbg_set_jsmetadatacursorresponse_total_count(this.__wbg_ptr, arg0);
    }
    /**
     * @param {JsMetaData | null | undefined} next_cursor
     * @param {boolean} has_more
     * @param {number} total_count
     */
    constructor(next_cursor, has_more, total_count) {
        let ptr0 = 0;
        if (!isLikeNone(next_cursor)) {
            _assertClass(next_cursor, JsMetaData);
            ptr0 = next_cursor.__destroy_into_raw();
        }
        const ret = wasm.jsmetadatacursorresponse_new(ptr0, has_more, total_count);
        this.__wbg_ptr = ret >>> 0;
        JsMetaDataCursorResponseFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
module.exports.JsMetaDataCursorResponse = JsMetaDataCursorResponse;

const JsMiningFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsmining_free(ptr >>> 0, 1));

class JsMining {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsMining.prototype);
        obj.__wbg_ptr = ptr;
        JsMiningFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsMiningFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsmining_free(ptr, 0);
    }
    /**
     * @returns {JsMetaData}
     */
    get meta() {
        const ret = wasm.__wbg_get_jsmining_meta(this.__wbg_ptr);
        return JsMetaData.__wrap(ret);
    }
    /**
     * @param {JsMetaData} arg0
     */
    set meta(arg0) {
        _assertClass(arg0, JsMetaData);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_jsmining_meta(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {JsDepositData}
     */
    get deposit_data() {
        const ret = wasm.__wbg_get_jsmining_deposit_data(this.__wbg_ptr);
        return JsDepositData.__wrap(ret);
    }
    /**
     * @param {JsDepositData} arg0
     */
    set deposit_data(arg0) {
        _assertClass(arg0, JsDepositData);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_jsmining_deposit_data(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {JsBlock}
     */
    get block() {
        const ret = wasm.__wbg_get_jsmining_block(this.__wbg_ptr);
        return JsBlock.__wrap(ret);
    }
    /**
     * @param {JsBlock} arg0
     */
    set block(arg0) {
        _assertClass(arg0, JsBlock);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_jsmining_block(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {bigint}
     */
    get maturity() {
        const ret = wasm.__wbg_get_jsmining_maturity(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * @param {bigint} arg0
     */
    set maturity(arg0) {
        wasm.__wbg_set_jsmining_maturity(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {string}
     */
    get status() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jsmining_status(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set status(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsmining_status(this.__wbg_ptr, ptr0, len0);
    }
}
module.exports.JsMining = JsMining;

const JsPaymentMemoEntryFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jspaymentmemoentry_free(ptr >>> 0, 1));

class JsPaymentMemoEntry {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsPaymentMemoEntry.prototype);
        obj.__wbg_ptr = ptr;
        JsPaymentMemoEntryFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof JsPaymentMemoEntry)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsPaymentMemoEntryFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jspaymentmemoentry_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get transfer_index() {
        const ret = wasm.__wbg_get_jsaccountinfo_last_block_number(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set transfer_index(arg0) {
        wasm.__wbg_set_jsaccountinfo_last_block_number(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {string}
     */
    get topic() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jspaymentmemoentry_topic(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set topic(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jspaymentmemoentry_topic(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get memo() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jspaymentmemoentry_memo(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set memo(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jspaymentmemoentry_memo(this.__wbg_ptr, ptr0, len0);
    }
}
module.exports.JsPaymentMemoEntry = JsPaymentMemoEntry;

const JsTransferFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jstransfer_free(ptr >>> 0, 1));

class JsTransfer {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsTransfer.prototype);
        obj.__wbg_ptr = ptr;
        JsTransferFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof JsTransfer)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsTransferFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jstransfer_free(ptr, 0);
    }
    /**
     * @returns {JsGenericAddress}
     */
    get recipient() {
        const ret = wasm.__wbg_get_jstransfer_recipient(this.__wbg_ptr);
        return JsGenericAddress.__wrap(ret);
    }
    /**
     * @param {JsGenericAddress} arg0
     */
    set recipient(arg0) {
        _assertClass(arg0, JsGenericAddress);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_jstransfer_recipient(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {number}
     */
    get token_index() {
        const ret = wasm.__wbg_get_jstransfer_token_index(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set token_index(arg0) {
        wasm.__wbg_set_jstransfer_token_index(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {string}
     */
    get amount() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jstransfer_amount(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set amount(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jstransfer_amount(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get salt() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jstransfer_salt(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set salt(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jstransfer_salt(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {JsGenericAddress} recipient
     * @param {number} token_index
     * @param {string} amount
     * @param {string} salt
     */
    constructor(recipient, token_index, amount, salt) {
        _assertClass(recipient, JsGenericAddress);
        var ptr0 = recipient.__destroy_into_raw();
        const ptr1 = passStringToWasm0(amount, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(salt, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.jstransfer_new(ptr0, token_index, ptr1, len1, ptr2, len2);
        this.__wbg_ptr = ret >>> 0;
        JsTransferFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {JsContractWithdrawal}
     */
    to_withdrawal() {
        const ret = wasm.jstransfer_to_withdrawal(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return JsContractWithdrawal.__wrap(ret[0]);
    }
}
module.exports.JsTransfer = JsTransfer;

const JsTransferDataFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jstransferdata_free(ptr >>> 0, 1));

class JsTransferData {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsTransferData.prototype);
        obj.__wbg_ptr = ptr;
        JsTransferDataFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsTransferDataFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jstransferdata_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get sender() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jstransferdata_sender(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set sender(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsclaim_recipient(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {JsTransfer}
     */
    get transfer() {
        const ret = wasm.__wbg_get_jstransferdata_transfer(this.__wbg_ptr);
        return JsTransfer.__wrap(ret);
    }
    /**
     * @param {JsTransfer} arg0
     */
    set transfer(arg0) {
        _assertClass(arg0, JsTransfer);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_jstransferdata_transfer(this.__wbg_ptr, ptr0);
    }
}
module.exports.JsTransferData = JsTransferData;

const JsTransferEntryFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jstransferentry_free(ptr >>> 0, 1));

class JsTransferEntry {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsTransferEntry.prototype);
        obj.__wbg_ptr = ptr;
        JsTransferEntryFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof JsTransferEntry)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsTransferEntryFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jstransferentry_free(ptr, 0);
    }
    /**
     * @returns {JsTransferData}
     */
    get data() {
        const ret = wasm.__wbg_get_jstransferentry_data(this.__wbg_ptr);
        return JsTransferData.__wrap(ret);
    }
    /**
     * @param {JsTransferData} arg0
     */
    set data(arg0) {
        _assertClass(arg0, JsTransferData);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_jstransferentry_data(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {JsEntryStatusWithBlockNumber}
     */
    get status() {
        const ret = wasm.__wbg_get_jstransferentry_status(this.__wbg_ptr);
        return JsEntryStatusWithBlockNumber.__wrap(ret);
    }
    /**
     * @param {JsEntryStatusWithBlockNumber} arg0
     */
    set status(arg0) {
        _assertClass(arg0, JsEntryStatusWithBlockNumber);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_jstransferentry_status(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {JsMetaData}
     */
    get meta() {
        const ret = wasm.__wbg_get_jstransferentry_meta(this.__wbg_ptr);
        return JsMetaData.__wrap(ret);
    }
    /**
     * @param {JsMetaData} arg0
     */
    set meta(arg0) {
        _assertClass(arg0, JsMetaData);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_jstransferentry_meta(this.__wbg_ptr, ptr0);
    }
}
module.exports.JsTransferEntry = JsTransferEntry;

const JsTransferHistoryFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jstransferhistory_free(ptr >>> 0, 1));

class JsTransferHistory {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsTransferHistory.prototype);
        obj.__wbg_ptr = ptr;
        JsTransferHistoryFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsTransferHistoryFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jstransferhistory_free(ptr, 0);
    }
    /**
     * @returns {JsTransferEntry[]}
     */
    get history() {
        const ret = wasm.__wbg_get_jstransferhistory_history(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {JsTransferEntry[]} arg0
     */
    set history(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jstransferhistory_history(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {JsMetaDataCursorResponse}
     */
    get cursor_response() {
        const ret = wasm.__wbg_get_jsdeposithistory_cursor_response(this.__wbg_ptr);
        return JsMetaDataCursorResponse.__wrap(ret);
    }
    /**
     * @param {JsMetaDataCursorResponse} arg0
     */
    set cursor_response(arg0) {
        _assertClass(arg0, JsMetaDataCursorResponse);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_jsdeposithistory_cursor_response(this.__wbg_ptr, ptr0);
    }
}
module.exports.JsTransferHistory = JsTransferHistory;

const JsTxFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jstx_free(ptr >>> 0, 1));

class JsTx {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsTx.prototype);
        obj.__wbg_ptr = ptr;
        JsTxFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsTxFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jstx_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get transfer_tree_root() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jstx_transfer_tree_root(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set transfer_tree_root(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsclaim_recipient(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {number}
     */
    get nonce() {
        const ret = wasm.__wbg_get_jstx_nonce(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set nonce(arg0) {
        wasm.__wbg_set_jstx_nonce(this.__wbg_ptr, arg0);
    }
}
module.exports.JsTx = JsTx;

const JsTxDataFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jstxdata_free(ptr >>> 0, 1));

class JsTxData {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsTxData.prototype);
        obj.__wbg_ptr = ptr;
        JsTxDataFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsTxDataFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jstxdata_free(ptr, 0);
    }
    /**
     * @returns {JsTx}
     */
    get tx() {
        const ret = wasm.__wbg_get_jstxdata_tx(this.__wbg_ptr);
        return JsTx.__wrap(ret);
    }
    /**
     * @param {JsTx} arg0
     */
    set tx(arg0) {
        _assertClass(arg0, JsTx);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_jstransfer_recipient(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {JsTransfer[]}
     */
    get transfers() {
        const ret = wasm.__wbg_get_jstxdata_transfers(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {JsTransfer[]} arg0
     */
    set transfers(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jstxdata_transfers(this.__wbg_ptr, ptr0, len0);
    }
}
module.exports.JsTxData = JsTxData;

const JsTxEntryFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jstxentry_free(ptr >>> 0, 1));

class JsTxEntry {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsTxEntry.prototype);
        obj.__wbg_ptr = ptr;
        JsTxEntryFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof JsTxEntry)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsTxEntryFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jstxentry_free(ptr, 0);
    }
    /**
     * @returns {JsTxData}
     */
    get data() {
        const ret = wasm.__wbg_get_jstxentry_data(this.__wbg_ptr);
        return JsTxData.__wrap(ret);
    }
    /**
     * @param {JsTxData} arg0
     */
    set data(arg0) {
        _assertClass(arg0, JsTxData);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_jstxentry_data(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {JsEntryStatusWithBlockNumber}
     */
    get status() {
        const ret = wasm.__wbg_get_jstxentry_status(this.__wbg_ptr);
        return JsEntryStatusWithBlockNumber.__wrap(ret);
    }
    /**
     * @param {JsEntryStatusWithBlockNumber} arg0
     */
    set status(arg0) {
        _assertClass(arg0, JsEntryStatusWithBlockNumber);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_jstxentry_status(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {JsMetaData}
     */
    get meta() {
        const ret = wasm.__wbg_get_jsdepositentry_meta(this.__wbg_ptr);
        return JsMetaData.__wrap(ret);
    }
    /**
     * @param {JsMetaData} arg0
     */
    set meta(arg0) {
        _assertClass(arg0, JsMetaData);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_jsdepositentry_meta(this.__wbg_ptr, ptr0);
    }
}
module.exports.JsTxEntry = JsTxEntry;

const JsTxHistoryFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jstxhistory_free(ptr >>> 0, 1));

class JsTxHistory {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsTxHistory.prototype);
        obj.__wbg_ptr = ptr;
        JsTxHistoryFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsTxHistoryFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jstxhistory_free(ptr, 0);
    }
    /**
     * @returns {JsTxEntry[]}
     */
    get history() {
        const ret = wasm.__wbg_get_jstxhistory_history(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {JsTxEntry[]} arg0
     */
    set history(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jstxhistory_history(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {JsMetaDataCursorResponse}
     */
    get cursor_response() {
        const ret = wasm.__wbg_get_jsdeposithistory_cursor_response(this.__wbg_ptr);
        return JsMetaDataCursorResponse.__wrap(ret);
    }
    /**
     * @param {JsMetaDataCursorResponse} arg0
     */
    set cursor_response(arg0) {
        _assertClass(arg0, JsMetaDataCursorResponse);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_jsdeposithistory_cursor_response(this.__wbg_ptr, ptr0);
    }
}
module.exports.JsTxHistory = JsTxHistory;

const JsTxRequestMemoFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jstxrequestmemo_free(ptr >>> 0, 1));

class JsTxRequestMemo {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsTxRequestMemo.prototype);
        obj.__wbg_ptr = ptr;
        JsTxRequestMemoFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsTxRequestMemoFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jstxrequestmemo_free(ptr, 0);
    }
    /**
     * @returns {JsTx}
     */
    tx() {
        const ret = wasm.jstxrequestmemo_tx(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return JsTx.__wrap(ret[0]);
    }
    /**
     * @returns {boolean}
     */
    is_registration_block() {
        const ret = wasm.jstxrequestmemo_is_registration_block(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] !== 0;
    }
}
module.exports.JsTxRequestMemo = JsTxRequestMemo;

const JsTxResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jstxresult_free(ptr >>> 0, 1));

class JsTxResult {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsTxResult.prototype);
        obj.__wbg_ptr = ptr;
        JsTxResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsTxResultFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jstxresult_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get tx_tree_root() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jstxresult_tx_tree_root(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set tx_tree_root(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsclaim_recipient(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string[]}
     */
    get transfer_uuids() {
        const ret = wasm.__wbg_get_jstxresult_transfer_uuids(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {string[]} arg0
     */
    set transfer_uuids(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jstxresult_transfer_uuids(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string[]}
     */
    get withdrawal_uuids() {
        const ret = wasm.__wbg_get_jstxresult_withdrawal_uuids(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {string[]} arg0
     */
    set withdrawal_uuids(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jstxresult_withdrawal_uuids(this.__wbg_ptr, ptr0, len0);
    }
}
module.exports.JsTxResult = JsTxResult;

const JsUserDataFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsuserdata_free(ptr >>> 0, 1));

class JsUserData {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsUserData.prototype);
        obj.__wbg_ptr = ptr;
        JsUserDataFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsUserDataFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsuserdata_free(ptr, 0);
    }
    /**
     * The user public key
     * @returns {string}
     */
    get pubkey() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jsuserdata_pubkey(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The user public key
     * @param {string} arg0
     */
    set pubkey(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsblock_signature_hash(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * The token balances of the user
     * @returns {TokenBalance[]}
     */
    get balances() {
        const ret = wasm.__wbg_get_jsuserdata_balances(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * The token balances of the user
     * @param {TokenBalance[]} arg0
     */
    set balances(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsuserdata_balances(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * The private commitment of the user
     * @returns {string}
     */
    get private_commitment() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jsuserdata_private_commitment(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The private commitment of the user
     * @param {string} arg0
     */
    set private_commitment(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsuserdata_private_commitment(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * The last unix timestamp of processed deposits
     * @returns {bigint}
     */
    get deposit_lpt() {
        const ret = wasm.__wbg_get_jsblock_timestamp(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * The last unix timestamp of processed deposits
     * @param {bigint} arg0
     */
    set deposit_lpt(arg0) {
        wasm.__wbg_set_jsblock_timestamp(this.__wbg_ptr, arg0);
    }
    /**
     * The last unix timestamp of processed transfers
     * @returns {bigint}
     */
    get transfer_lpt() {
        const ret = wasm.__wbg_get_jsuserdata_transfer_lpt(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * The last unix timestamp of processed transfers
     * @param {bigint} arg0
     */
    set transfer_lpt(arg0) {
        wasm.__wbg_set_jsuserdata_transfer_lpt(this.__wbg_ptr, arg0);
    }
    /**
     * The last unix timestamp of processed txs
     * @returns {bigint}
     */
    get tx_lpt() {
        const ret = wasm.__wbg_get_jsuserdata_tx_lpt(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * The last unix timestamp of processed txs
     * @param {bigint} arg0
     */
    set tx_lpt(arg0) {
        wasm.__wbg_set_jsuserdata_tx_lpt(this.__wbg_ptr, arg0);
    }
    /**
     * The last unix timestamp of processed withdrawals
     * @returns {bigint}
     */
    get withdrawal_lpt() {
        const ret = wasm.__wbg_get_jsuserdata_withdrawal_lpt(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * The last unix timestamp of processed withdrawals
     * @param {bigint} arg0
     */
    set withdrawal_lpt(arg0) {
        wasm.__wbg_set_jsuserdata_withdrawal_lpt(this.__wbg_ptr, arg0);
    }
    /**
     * Uuids of processed deposits
     * @returns {string[]}
     */
    get processed_deposit_uuids() {
        const ret = wasm.__wbg_get_jsuserdata_processed_deposit_uuids(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Uuids of processed deposits
     * @param {string[]} arg0
     */
    set processed_deposit_uuids(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsuserdata_processed_deposit_uuids(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * Uuids of processed transfers
     * @returns {string[]}
     */
    get processed_transfer_uuids() {
        const ret = wasm.__wbg_get_jsuserdata_processed_transfer_uuids(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Uuids of processed transfers
     * @param {string[]} arg0
     */
    set processed_transfer_uuids(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsuserdata_processed_transfer_uuids(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * Uuids of processed txs
     * @returns {string[]}
     */
    get processed_tx_uuids() {
        const ret = wasm.__wbg_get_jsuserdata_processed_tx_uuids(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Uuids of processed txs
     * @param {string[]} arg0
     */
    set processed_tx_uuids(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsuserdata_processed_tx_uuids(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * Uuids of processed withdrawals
     * @returns {string[]}
     */
    get processed_withdrawal_uuids() {
        const ret = wasm.__wbg_get_jsuserdata_processed_withdrawal_uuids(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Uuids of processed withdrawals
     * @param {string[]} arg0
     */
    set processed_withdrawal_uuids(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsuserdata_processed_withdrawal_uuids(this.__wbg_ptr, ptr0, len0);
    }
}
module.exports.JsUserData = JsUserData;

const JsWithdrawalInfoFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jswithdrawalinfo_free(ptr >>> 0, 1));

class JsWithdrawalInfo {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsWithdrawalInfo.prototype);
        obj.__wbg_ptr = ptr;
        JsWithdrawalInfoFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsWithdrawalInfoFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jswithdrawalinfo_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get status() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_jswithdrawalinfo_status(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set status(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsclaim_recipient(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {JsContractWithdrawal}
     */
    get contract_withdrawal() {
        const ret = wasm.__wbg_get_jswithdrawalinfo_contract_withdrawal(this.__wbg_ptr);
        return JsContractWithdrawal.__wrap(ret);
    }
    /**
     * @param {JsContractWithdrawal} arg0
     */
    set contract_withdrawal(arg0) {
        _assertClass(arg0, JsContractWithdrawal);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_jswithdrawalinfo_contract_withdrawal(this.__wbg_ptr, ptr0);
    }
}
module.exports.JsWithdrawalInfo = JsWithdrawalInfo;

const JsWithdrawalTransfersFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jswithdrawaltransfers_free(ptr >>> 0, 1));

class JsWithdrawalTransfers {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsWithdrawalTransfers.prototype);
        obj.__wbg_ptr = ptr;
        JsWithdrawalTransfersFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsWithdrawalTransfersFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jswithdrawaltransfers_free(ptr, 0);
    }
    /**
     * @returns {JsTransfer[]}
     */
    get transfers() {
        const ret = wasm.__wbg_get_jswithdrawaltransfers_transfers(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {JsTransfer[]} arg0
     */
    set transfers(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jswithdrawaltransfers_transfers(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {number | undefined}
     */
    get withdrawal_fee_transfer_index() {
        const ret = wasm.__wbg_get_jswithdrawaltransfers_withdrawal_fee_transfer_index(this.__wbg_ptr);
        return ret === 0x100000001 ? undefined : ret;
    }
    /**
     * @param {number | null} [arg0]
     */
    set withdrawal_fee_transfer_index(arg0) {
        wasm.__wbg_set_jswithdrawaltransfers_withdrawal_fee_transfer_index(this.__wbg_ptr, isLikeNone(arg0) ? 0x100000001 : (arg0) >>> 0);
    }
    /**
     * @returns {number | undefined}
     */
    get claim_fee_transfer_index() {
        const ret = wasm.__wbg_get_jswithdrawaltransfers_claim_fee_transfer_index(this.__wbg_ptr);
        return ret === 0x100000001 ? undefined : ret;
    }
    /**
     * @param {number | null} [arg0]
     */
    set claim_fee_transfer_index(arg0) {
        wasm.__wbg_set_jswithdrawaltransfers_claim_fee_transfer_index(this.__wbg_ptr, isLikeNone(arg0) ? 0x100000001 : (arg0) >>> 0);
    }
}
module.exports.JsWithdrawalTransfers = JsWithdrawalTransfers;

const TokenBalanceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_tokenbalance_free(ptr >>> 0, 1));

class TokenBalance {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(TokenBalance.prototype);
        obj.__wbg_ptr = ptr;
        TokenBalanceFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof TokenBalance)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TokenBalanceFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_tokenbalance_free(ptr, 0);
    }
    /**
     * Token index of the balance
     * @returns {number}
     */
    get token_index() {
        const ret = wasm.__wbg_get_jstx_nonce(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Token index of the balance
     * @param {number} arg0
     */
    set token_index(arg0) {
        wasm.__wbg_set_jstx_nonce(this.__wbg_ptr, arg0);
    }
    /**
     * The amount of the token. 10 base string
     * @returns {string}
     */
    get amount() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_tokenbalance_amount(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The amount of the token. 10 base string
     * @param {string} arg0
     */
    set amount(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jsclaim_recipient(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * Flag indicating whether the balance is insufficient for that token index.
     * If true, subsequent transfers or withdrawals for that token index will be impossible.
     * @returns {boolean}
     */
    get is_insufficient() {
        const ret = wasm.__wbg_get_tokenbalance_is_insufficient(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Flag indicating whether the balance is insufficient for that token index.
     * If true, subsequent transfers or withdrawals for that token index will be impossible.
     * @param {boolean} arg0
     */
    set is_insufficient(arg0) {
        wasm.__wbg_set_tokenbalance_is_insufficient(this.__wbg_ptr, arg0);
    }
}
module.exports.TokenBalance = TokenBalance;

module.exports.__wbg_abort_775ef1d17fc65868 = function(arg0) {
    arg0.abort();
};

module.exports.__wbg_append_8c7dd8d641a5f01b = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    arg0.append(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
}, arguments) };

module.exports.__wbg_arrayBuffer_d1b44c4390db422f = function() { return handleError(function (arg0) {
    const ret = arg0.arrayBuffer();
    return ret;
}, arguments) };

module.exports.__wbg_buffer_609cc3eee51ed158 = function(arg0) {
    const ret = arg0.buffer;
    return ret;
};

module.exports.__wbg_call_672a4d21634d4a24 = function() { return handleError(function (arg0, arg1) {
    const ret = arg0.call(arg1);
    return ret;
}, arguments) };

module.exports.__wbg_call_7cccdd69e0791ae2 = function() { return handleError(function (arg0, arg1, arg2) {
    const ret = arg0.call(arg1, arg2);
    return ret;
}, arguments) };

module.exports.__wbg_clearTimeout_5a54f8841c30079a = function(arg0) {
    const ret = clearTimeout(arg0);
    return ret;
};

module.exports.__wbg_crypto_ed58b8e10a292839 = function(arg0) {
    const ret = arg0.crypto;
    return ret;
};

module.exports.__wbg_done_769e5ede4b31c67b = function(arg0) {
    const ret = arg0.done;
    return ret;
};

module.exports.__wbg_error_7534b8e9a36f1ab4 = function(arg0, arg1) {
    let deferred0_0;
    let deferred0_1;
    try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        console.error(getStringFromWasm0(arg0, arg1));
    } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
    }
};

module.exports.__wbg_fetch_4465c2b10f21a927 = function(arg0) {
    const ret = fetch(arg0);
    return ret;
};

module.exports.__wbg_fetch_509096533071c657 = function(arg0, arg1) {
    const ret = arg0.fetch(arg1);
    return ret;
};

module.exports.__wbg_fetch_f1856afdb49415d1 = function(arg0) {
    const ret = fetch(arg0);
    return ret;
};

module.exports.__wbg_getRandomValues_bcb4912f16000dc4 = function() { return handleError(function (arg0, arg1) {
    arg0.getRandomValues(arg1);
}, arguments) };

module.exports.__wbg_getTime_46267b1c24877e30 = function(arg0) {
    const ret = arg0.getTime();
    return ret;
};

module.exports.__wbg_get_67b2ba62fc30de12 = function() { return handleError(function (arg0, arg1) {
    const ret = Reflect.get(arg0, arg1);
    return ret;
}, arguments) };

module.exports.__wbg_has_a5ea9117f258a0ec = function() { return handleError(function (arg0, arg1) {
    const ret = Reflect.has(arg0, arg1);
    return ret;
}, arguments) };

module.exports.__wbg_headers_9cb51cfd2ac780a4 = function(arg0) {
    const ret = arg0.headers;
    return ret;
};

module.exports.__wbg_instanceof_Response_f2cc20d9f7dfd644 = function(arg0) {
    let result;
    try {
        result = arg0 instanceof Response;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

module.exports.__wbg_intmaxaccount_new = function(arg0) {
    const ret = IntmaxAccount.__wrap(arg0);
    return ret;
};

module.exports.__wbg_iterator_9a24c88df860dc65 = function() {
    const ret = Symbol.iterator;
    return ret;
};

module.exports.__wbg_jsaccountinfo_new = function(arg0) {
    const ret = JsAccountInfo.__wrap(arg0);
    return ret;
};

module.exports.__wbg_jsauth_new = function(arg0) {
    const ret = JsAuth.__wrap(arg0);
    return ret;
};

module.exports.__wbg_jsclaiminfo_new = function(arg0) {
    const ret = JsClaimInfo.__wrap(arg0);
    return ret;
};

module.exports.__wbg_jsdepositdata_new = function(arg0) {
    const ret = JsDepositData.__wrap(arg0);
    return ret;
};

module.exports.__wbg_jsdepositentry_new = function(arg0) {
    const ret = JsDepositEntry.__wrap(arg0);
    return ret;
};

module.exports.__wbg_jsdepositentry_unwrap = function(arg0) {
    const ret = JsDepositEntry.__unwrap(arg0);
    return ret;
};

module.exports.__wbg_jsdeposithistory_new = function(arg0) {
    const ret = JsDepositHistory.__wrap(arg0);
    return ret;
};

module.exports.__wbg_jsdepositresult_new = function(arg0) {
    const ret = JsDepositResult.__wrap(arg0);
    return ret;
};

module.exports.__wbg_jsderive_new = function(arg0) {
    const ret = JsDerive.__wrap(arg0);
    return ret;
};

module.exports.__wbg_jsencrypteddata_new = function(arg0) {
    const ret = JsEncryptedData.__wrap(arg0);
    return ret;
};

module.exports.__wbg_jsfee_new = function(arg0) {
    const ret = JsFee.__wrap(arg0);
    return ret;
};

module.exports.__wbg_jsfee_unwrap = function(arg0) {
    const ret = JsFee.__unwrap(arg0);
    return ret;
};

module.exports.__wbg_jsfeequote_new = function(arg0) {
    const ret = JsFeeQuote.__wrap(arg0);
    return ret;
};

module.exports.__wbg_jsflatg2_new = function(arg0) {
    const ret = JsFlatG2.__wrap(arg0);
    return ret;
};

module.exports.__wbg_jsmining_new = function(arg0) {
    const ret = JsMining.__wrap(arg0);
    return ret;
};

module.exports.__wbg_jspaymentmemoentry_new = function(arg0) {
    const ret = JsPaymentMemoEntry.__wrap(arg0);
    return ret;
};

module.exports.__wbg_jspaymentmemoentry_unwrap = function(arg0) {
    const ret = JsPaymentMemoEntry.__unwrap(arg0);
    return ret;
};

module.exports.__wbg_jstransfer_new = function(arg0) {
    const ret = JsTransfer.__wrap(arg0);
    return ret;
};

module.exports.__wbg_jstransfer_unwrap = function(arg0) {
    const ret = JsTransfer.__unwrap(arg0);
    return ret;
};

module.exports.__wbg_jstransferdata_new = function(arg0) {
    const ret = JsTransferData.__wrap(arg0);
    return ret;
};

module.exports.__wbg_jstransferentry_new = function(arg0) {
    const ret = JsTransferEntry.__wrap(arg0);
    return ret;
};

module.exports.__wbg_jstransferentry_unwrap = function(arg0) {
    const ret = JsTransferEntry.__unwrap(arg0);
    return ret;
};

module.exports.__wbg_jstransferhistory_new = function(arg0) {
    const ret = JsTransferHistory.__wrap(arg0);
    return ret;
};

module.exports.__wbg_jstxdata_new = function(arg0) {
    const ret = JsTxData.__wrap(arg0);
    return ret;
};

module.exports.__wbg_jstxentry_new = function(arg0) {
    const ret = JsTxEntry.__wrap(arg0);
    return ret;
};

module.exports.__wbg_jstxentry_unwrap = function(arg0) {
    const ret = JsTxEntry.__unwrap(arg0);
    return ret;
};

module.exports.__wbg_jstxhistory_new = function(arg0) {
    const ret = JsTxHistory.__wrap(arg0);
    return ret;
};

module.exports.__wbg_jstxrequestmemo_new = function(arg0) {
    const ret = JsTxRequestMemo.__wrap(arg0);
    return ret;
};

module.exports.__wbg_jstxresult_new = function(arg0) {
    const ret = JsTxResult.__wrap(arg0);
    return ret;
};

module.exports.__wbg_jsuserdata_new = function(arg0) {
    const ret = JsUserData.__wrap(arg0);
    return ret;
};

module.exports.__wbg_jswithdrawalinfo_new = function(arg0) {
    const ret = JsWithdrawalInfo.__wrap(arg0);
    return ret;
};

module.exports.__wbg_jswithdrawaltransfers_new = function(arg0) {
    const ret = JsWithdrawalTransfers.__wrap(arg0);
    return ret;
};

module.exports.__wbg_length_a446193dc22c12f8 = function(arg0) {
    const ret = arg0.length;
    return ret;
};

module.exports.__wbg_msCrypto_0a36e2ec3a343d26 = function(arg0) {
    const ret = arg0.msCrypto;
    return ret;
};

module.exports.__wbg_new0_f788a2397c7ca929 = function() {
    const ret = new Date();
    return ret;
};

module.exports.__wbg_new_018dcc2d6c8c2f6a = function() { return handleError(function () {
    const ret = new Headers();
    return ret;
}, arguments) };

module.exports.__wbg_new_23a2665fac83c611 = function(arg0, arg1) {
    try {
        var state0 = {a: arg0, b: arg1};
        var cb0 = (arg0, arg1) => {
            const a = state0.a;
            state0.a = 0;
            try {
                return __wbg_adapter_526(a, state0.b, arg0, arg1);
            } finally {
                state0.a = a;
            }
        };
        const ret = new Promise(cb0);
        return ret;
    } finally {
        state0.a = state0.b = 0;
    }
};

module.exports.__wbg_new_405e22f390576ce2 = function() {
    const ret = new Object();
    return ret;
};

module.exports.__wbg_new_8a6f238a6ece86ea = function() {
    const ret = new Error();
    return ret;
};

module.exports.__wbg_new_a12002a7f91c75be = function(arg0) {
    const ret = new Uint8Array(arg0);
    return ret;
};

module.exports.__wbg_new_e25e5aab09ff45db = function() { return handleError(function () {
    const ret = new AbortController();
    return ret;
}, arguments) };

module.exports.__wbg_newnoargs_105ed471475aaf50 = function(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return ret;
};

module.exports.__wbg_newwithbyteoffsetandlength_d97e637ebe145a9a = function(arg0, arg1, arg2) {
    const ret = new Uint8Array(arg0, arg1 >>> 0, arg2 >>> 0);
    return ret;
};

module.exports.__wbg_newwithlength_a381634e90c276d4 = function(arg0) {
    const ret = new Uint8Array(arg0 >>> 0);
    return ret;
};

module.exports.__wbg_newwithstrandinit_06c535e0a867c635 = function() { return handleError(function (arg0, arg1, arg2) {
    const ret = new Request(getStringFromWasm0(arg0, arg1), arg2);
    return ret;
}, arguments) };

module.exports.__wbg_next_25feadfc0913fea9 = function(arg0) {
    const ret = arg0.next;
    return ret;
};

module.exports.__wbg_next_6574e1a8a62d1055 = function() { return handleError(function (arg0) {
    const ret = arg0.next();
    return ret;
}, arguments) };

module.exports.__wbg_node_02999533c4ea02e3 = function(arg0) {
    const ret = arg0.node;
    return ret;
};

module.exports.__wbg_process_5c1d670bc53614b8 = function(arg0) {
    const ret = arg0.process;
    return ret;
};

module.exports.__wbg_queueMicrotask_97d92b4fcc8a61c5 = function(arg0) {
    queueMicrotask(arg0);
};

module.exports.__wbg_queueMicrotask_d3219def82552485 = function(arg0) {
    const ret = arg0.queueMicrotask;
    return ret;
};

module.exports.__wbg_randomFillSync_ab2cfe79ebbf2740 = function() { return handleError(function (arg0, arg1) {
    arg0.randomFillSync(arg1);
}, arguments) };

module.exports.__wbg_require_79b1e9274cde3c87 = function() { return handleError(function () {
    const ret = module.require;
    return ret;
}, arguments) };

module.exports.__wbg_resolve_4851785c9c5f573d = function(arg0) {
    const ret = Promise.resolve(arg0);
    return ret;
};

module.exports.__wbg_setTimeout_db2dbaeefb6f39c7 = function() { return handleError(function (arg0, arg1) {
    const ret = setTimeout(arg0, arg1);
    return ret;
}, arguments) };

module.exports.__wbg_set_65595bdd868b3009 = function(arg0, arg1, arg2) {
    arg0.set(arg1, arg2 >>> 0);
};

module.exports.__wbg_setbody_5923b78a95eedf29 = function(arg0, arg1) {
    arg0.body = arg1;
};

module.exports.__wbg_setcredentials_c3a22f1cd105a2c6 = function(arg0, arg1) {
    arg0.credentials = __wbindgen_enum_RequestCredentials[arg1];
};

module.exports.__wbg_setheaders_834c0bdb6a8949ad = function(arg0, arg1) {
    arg0.headers = arg1;
};

module.exports.__wbg_setmethod_3c5280fe5d890842 = function(arg0, arg1, arg2) {
    arg0.method = getStringFromWasm0(arg1, arg2);
};

module.exports.__wbg_setmode_5dc300b865044b65 = function(arg0, arg1) {
    arg0.mode = __wbindgen_enum_RequestMode[arg1];
};

module.exports.__wbg_setsignal_75b21ef3a81de905 = function(arg0, arg1) {
    arg0.signal = arg1;
};

module.exports.__wbg_signal_aaf9ad74119f20a4 = function(arg0) {
    const ret = arg0.signal;
    return ret;
};

module.exports.__wbg_stack_0ed75d68575b0f3c = function(arg0, arg1) {
    const ret = arg1.stack;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

module.exports.__wbg_static_accessor_GLOBAL_88a902d13a557d07 = function() {
    const ret = typeof global === 'undefined' ? null : global;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

module.exports.__wbg_static_accessor_GLOBAL_THIS_56578be7e9f832b0 = function() {
    const ret = typeof globalThis === 'undefined' ? null : globalThis;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

module.exports.__wbg_static_accessor_SELF_37c5d418e4bf5819 = function() {
    const ret = typeof self === 'undefined' ? null : self;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

module.exports.__wbg_static_accessor_WINDOW_5de37043a91a9c40 = function() {
    const ret = typeof window === 'undefined' ? null : window;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

module.exports.__wbg_status_f6360336ca686bf0 = function(arg0) {
    const ret = arg0.status;
    return ret;
};

module.exports.__wbg_stringify_f7ed6987935b4a24 = function() { return handleError(function (arg0) {
    const ret = JSON.stringify(arg0);
    return ret;
}, arguments) };

module.exports.__wbg_subarray_aa9065fa9dc5df96 = function(arg0, arg1, arg2) {
    const ret = arg0.subarray(arg1 >>> 0, arg2 >>> 0);
    return ret;
};

module.exports.__wbg_text_7805bea50de2af49 = function() { return handleError(function (arg0) {
    const ret = arg0.text();
    return ret;
}, arguments) };

module.exports.__wbg_then_44b73946d2fb3e7d = function(arg0, arg1) {
    const ret = arg0.then(arg1);
    return ret;
};

module.exports.__wbg_then_48b406749878a531 = function(arg0, arg1, arg2) {
    const ret = arg0.then(arg1, arg2);
    return ret;
};

module.exports.__wbg_tokenbalance_new = function(arg0) {
    const ret = TokenBalance.__wrap(arg0);
    return ret;
};

module.exports.__wbg_tokenbalance_unwrap = function(arg0) {
    const ret = TokenBalance.__unwrap(arg0);
    return ret;
};

module.exports.__wbg_url_ae10c34ca209681d = function(arg0, arg1) {
    const ret = arg1.url;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

module.exports.__wbg_value_cd1ffa7b1ab794f1 = function(arg0) {
    const ret = arg0.value;
    return ret;
};

module.exports.__wbg_versions_c71aa1626a93e0a1 = function(arg0) {
    const ret = arg0.versions;
    return ret;
};

module.exports.__wbindgen_array_new = function() {
    const ret = [];
    return ret;
};

module.exports.__wbindgen_array_push = function(arg0, arg1) {
    arg0.push(arg1);
};

module.exports.__wbindgen_cb_drop = function(arg0) {
    const obj = arg0.original;
    if (obj.cnt-- == 1) {
        obj.a = 0;
        return true;
    }
    const ret = false;
    return ret;
};

module.exports.__wbindgen_closure_wrapper2935 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 661, __wbg_adapter_34);
    return ret;
};

module.exports.__wbindgen_closure_wrapper3163 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 799, __wbg_adapter_37);
    return ret;
};

module.exports.__wbindgen_debug_string = function(arg0, arg1) {
    const ret = debugString(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

module.exports.__wbindgen_error_new = function(arg0, arg1) {
    const ret = new Error(getStringFromWasm0(arg0, arg1));
    return ret;
};

module.exports.__wbindgen_init_externref_table = function() {
    const table = wasm.__wbindgen_export_2;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
    ;
};

module.exports.__wbindgen_is_function = function(arg0) {
    const ret = typeof(arg0) === 'function';
    return ret;
};

module.exports.__wbindgen_is_object = function(arg0) {
    const val = arg0;
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
};

module.exports.__wbindgen_is_string = function(arg0) {
    const ret = typeof(arg0) === 'string';
    return ret;
};

module.exports.__wbindgen_is_undefined = function(arg0) {
    const ret = arg0 === undefined;
    return ret;
};

module.exports.__wbindgen_memory = function() {
    const ret = wasm.memory;
    return ret;
};

module.exports.__wbindgen_string_get = function(arg0, arg1) {
    const obj = arg1;
    const ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

module.exports.__wbindgen_string_new = function(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return ret;
};

module.exports.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

const path = require('path').join(__dirname, 'intmax2_wasm_lib_bg.wasm');
const bytes = require('fs').readFileSync(path);

const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
wasm = wasmInstance.exports;
module.exports.__wasm = wasm;

wasm.__wbindgen_start();

