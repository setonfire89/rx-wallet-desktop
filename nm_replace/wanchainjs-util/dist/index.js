'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var createKeccakHash = require('keccak');
var secp256k1 = require('secp256k1');
var assert = require('assert');
var rlp = require('rlp');
var BN = require('bn.js');
var createHash = require('create-hash');
var Buffer = require('safe-buffer').Buffer;
Object.assign(exports, require('ethjs-util'));

var SECP256K1_N = new BN('fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141', 16);
var SECP256K1_N_DIV_2 = new BN('7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0', 16);

/**
 * the max integer that this VM can handle (a ```BN```)
 * @var {BN} MAX_INTEGER
 */
exports.MAX_INTEGER = new BN('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16);

/**
 * 2^256 (a ```BN```)
 * @var {BN} TWO_POW256
 */
exports.TWO_POW256 = new BN('10000000000000000000000000000000000000000000000000000000000000000', 16);

/**
 * Keccak-256 hash of null (a ```String```)
 * @var {String} KECCAK256_NULL_S
 */
exports.KECCAK256_NULL_S = 'c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470';
exports.SHA3_NULL_S = exports.KECCAK256_NULL_S;

/**
 * Keccak-256 hash of null (a ```Buffer```)
 * @var {Buffer} KECCAK256_NULL
 */
exports.KECCAK256_NULL = Buffer.from(exports.KECCAK256_NULL_S, 'hex');
exports.SHA3_NULL = exports.KECCAK256_NULL;

/**
 * Keccak-256 of an RLP of an empty array (a ```String```)
 * @var {String} KECCAK256_RLP_ARRAY_S
 */
exports.KECCAK256_RLP_ARRAY_S = '1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347';
exports.SHA3_RLP_ARRAY_S = exports.KECCAK256_RLP_ARRAY_S;

/**
 * Keccak-256 of an RLP of an empty array (a ```Buffer```)
 * @var {Buffer} KECCAK256_RLP_ARRAY
 */
exports.KECCAK256_RLP_ARRAY = Buffer.from(exports.KECCAK256_RLP_ARRAY_S, 'hex');
exports.SHA3_RLP_ARRAY = exports.KECCAK256_RLP_ARRAY;

/**
 * Keccak-256 hash of the RLP of null  (a ```String```)
 * @var {String} KECCAK256_RLP_S
 */
exports.KECCAK256_RLP_S = '56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421';
exports.SHA3_RLP_S = exports.KECCAK256_RLP_S;

/**
 * Keccak-256 hash of the RLP of null (a ```Buffer```)
 * @var {Buffer} KECCAK256_RLP
 */
exports.KECCAK256_RLP = Buffer.from(exports.KECCAK256_RLP_S, 'hex');
exports.SHA3_RLP = exports.KECCAK256_RLP;

/**
 * [`BN`](https://github.com/indutny/bn.js)
 * @var {Function}
 */
exports.BN = BN;

/**
 * [`rlp`](https://github.com/ethereumjs/rlp)
 * @var {Function}
 */
exports.rlp = rlp;

/**
 * [`secp256k1`](https://github.com/cryptocoinjs/secp256k1-node/)
 * @var {Object}
 */
exports.secp256k1 = secp256k1;

/**
 * Returns a buffer filled with 0s
 * @method zeros
 * @param {Number} bytes  the number of bytes the buffer should be
 * @return {Buffer}
 */
exports.zeros = function (bytes) {
  return Buffer.allocUnsafe(bytes).fill(0);
};

/**
  * Returns a zero address
  * @method zeroAddress
  * @return {String}
  */
exports.zeroAddress = function () {
  var addressLength = 20;
  var zeroAddress = exports.zeros(addressLength);
  return exports.bufferToHex(zeroAddress);
};

/**
 * Left Pads an `Array` or `Buffer` with leading zeros till it has `length` bytes.
 * Or it truncates the beginning if it exceeds.
 * @method lsetLength
 * @param {Buffer|Array} msg the value to pad
 * @param {Number} length the number of bytes the output should be
 * @param {Boolean} [right=false] whether to start padding form the left or right
 * @return {Buffer|Array}
 */
exports.setLengthLeft = exports.setLength = function (msg, length, right) {
  var buf = exports.zeros(length);
  msg = exports.toBuffer(msg);
  if (right) {
    if (msg.length < length) {
      msg.copy(buf);
      return buf;
    }
    return msg.slice(0, length);
  } else {
    if (msg.length < length) {
      msg.copy(buf, length - msg.length);
      return buf;
    }
    return msg.slice(-length);
  }
};

/**
 * Right Pads an `Array` or `Buffer` with leading zeros till it has `length` bytes.
 * Or it truncates the beginning if it exceeds.
 * @param {Buffer|Array} msg the value to pad
 * @param {Number} length the number of bytes the output should be
 * @return {Buffer|Array}
 */
exports.setLengthRight = function (msg, length) {
  return exports.setLength(msg, length, true);
};

/**
 * Trims leading zeros from a `Buffer` or an `Array`
 * @param {Buffer|Array|String} a
 * @return {Buffer|Array|String}
 */
exports.unpad = exports.stripZeros = function (a) {
  a = exports.stripHexPrefix(a);
  var first = a[0];
  while (a.length > 0 && first.toString() === '0') {
    a = a.slice(1);
    first = a[0];
  }
  return a;
};
/**
 * Attempts to turn a value into a `Buffer`. As input it supports `Buffer`, `String`, `Number`, null/undefined, `BN` and other objects with a `toArray()` method.
 * @param {*} v the value
 */
exports.toBuffer = function (v) {
  if (!Buffer.isBuffer(v)) {
    if (Array.isArray(v)) {
      v = Buffer.from(v);
    } else if (typeof v === 'string') {
      if (exports.isHexString(v)) {
        v = Buffer.from(exports.padToEven(exports.stripHexPrefix(v)), 'hex');
      } else {
        v = Buffer.from(v);
      }
    } else if (typeof v === 'number') {
      v = exports.intToBuffer(v);
    } else if (v === null || v === undefined) {
      v = Buffer.allocUnsafe(0);
    } else if (BN.isBN(v)) {
      v = v.toArrayLike(Buffer);
    } else if (v.toArray) {
      // converts a BN to a Buffer
      v = Buffer.from(v.toArray());
    } else {
      throw new Error('invalid type');
    }
  }
  return v;
};

/**
 * Converts a `Buffer` to a `Number`
 * @param {Buffer} buf
 * @return {Number}
 * @throws If the input number exceeds 53 bits.
 */
exports.bufferToInt = function (buf) {
  return new BN(exports.toBuffer(buf)).toNumber();
};

/**
 * Converts a `Buffer` into a hex `String`
 * @param {Buffer} buf
 * @return {String}
 */
exports.bufferToHex = function (buf) {
  buf = exports.toBuffer(buf);
  return '0x' + buf.toString('hex');
};

/**
 * Interprets a `Buffer` as a signed integer and returns a `BN`. Assumes 256-bit numbers.
 * @param {Buffer} num
 * @return {BN}
 */
exports.fromSigned = function (num) {
  return new BN(num).fromTwos(256);
};

/**
 * Converts a `BN` to an unsigned integer and returns it as a `Buffer`. Assumes 256-bit numbers.
 * @param {BN} num
 * @return {Buffer}
 */
exports.toUnsigned = function (num) {
  return Buffer.from(num.toTwos(256).toArray());
};

/**
 * Creates Keccak hash of the input
 * @param {Buffer|Array|String|Number} a the input data
 * @param {Number} [bits=256] the Keccak width
 * @return {Buffer}
 */
exports.keccak = function (a, bits) {
  a = exports.toBuffer(a);
  if (!bits) bits = 256;

  return createKeccakHash('keccak' + bits).update(a).digest();
};

/**
 * Creates Keccak-256 hash of the input, alias for keccak(a, 256)
 * @param {Buffer|Array|String|Number} a the input data
 * @return {Buffer}
 */
exports.keccak256 = function (a) {
  return exports.keccak(a);
};

/**
 * Creates SHA-3 (Keccak) hash of the input [OBSOLETE]
 * @param {Buffer|Array|String|Number} a the input data
 * @param {Number} [bits=256] the SHA-3 width
 * @return {Buffer}
 */
exports.sha3 = exports.keccak;

/**
 * Creates SHA256 hash of the input
 * @param {Buffer|Array|String|Number} a the input data
 * @return {Buffer}
 */
exports.sha256 = function (a) {
  a = exports.toBuffer(a);
  return createHash('sha256').update(a).digest();
};

/**
 * Creates RIPEMD160 hash of the input
 * @param {Buffer|Array|String|Number} a the input data
 * @param {Boolean} padded whether it should be padded to 256 bits or not
 * @return {Buffer}
 */
exports.ripemd160 = function (a, padded) {
  a = exports.toBuffer(a);
  var hash = createHash('rmd160').update(a).digest();
  if (padded === true) {
    return exports.setLength(hash, 32);
  } else {
    return hash;
  }
};

/**
 * Creates SHA-3 hash of the RLP encoded version of the input
 * @param {Buffer|Array|String|Number} a the input data
 * @return {Buffer}
 */
exports.rlphash = function (a) {
  return exports.keccak(rlp.encode(a));
};

/**
 * Checks if the private key satisfies the rules of the curve secp256k1.
 * @param {Buffer} privateKey
 * @return {Boolean}
 */
exports.isValidPrivate = function (privateKey) {
  return secp256k1.privateKeyVerify(privateKey);
};

/**
 * Checks if the public key satisfies the rules of the curve secp256k1
 * and the requirements of Ethereum.
 * @param {Buffer} publicKey The two points of an uncompressed key, unless sanitize is enabled
 * @param {Boolean} [sanitize=false] Accept public keys in other formats
 * @return {Boolean}
 */
exports.isValidPublic = function (publicKey, sanitize) {
  if (publicKey.length === 64) {
    // Convert to SEC1 for secp256k1
    return secp256k1.publicKeyVerify(Buffer.concat([Buffer.from([4]), publicKey]));
  }

  if (!sanitize) {
    return false;
  }

  return secp256k1.publicKeyVerify(publicKey);
};

/**
 * Returns the ethereum address of a given public key.
 * Accepts "Ethereum public keys" and SEC1 encoded keys.
 * @param {Buffer} pubKey The two points of an uncompressed key, unless sanitize is enabled
 * @param {Boolean} [sanitize=false] Accept public keys in other formats
 * @return {Buffer}
 */
exports.pubToAddress = exports.publicToAddress = function (pubKey, sanitize) {
  pubKey = exports.toBuffer(pubKey);
  if (sanitize && pubKey.length !== 64) {
    pubKey = secp256k1.publicKeyConvert(pubKey, false).slice(1);
  }
  assert(pubKey.length === 64);
  // Only take the lower 160bits of the hash
  return exports.keccak(pubKey).slice(-20);
};

/**
 * Returns the ethereum public key of a given private key
 * @param {Buffer} privateKey A private key must be 256 bits wide
 * @return {Buffer}
 */
var privateToPublic = exports.privateToPublic = function (privateKey) {
  privateKey = exports.toBuffer(privateKey);
  // skip the type flag and use the X, Y points
  return secp256k1.publicKeyCreate(privateKey, false).slice(1);
};

/**
 * Converts a public key to the Ethereum format.
 * @param {Buffer} publicKey
 * @return {Buffer}
 */
exports.importPublic = function (publicKey) {
  publicKey = exports.toBuffer(publicKey);
  if (publicKey.length !== 64) {
    publicKey = secp256k1.publicKeyConvert(publicKey, false).slice(1);
  }
  return publicKey;
};

/**
 * ECDSA sign
 * @param {Buffer} msgHash
 * @param {Buffer} privateKey
 * @return {Object}
 */
exports.ecsign = function (msgHash, privateKey) {
  var sig = secp256k1.sign(msgHash, privateKey);

  var ret = {};
  ret.r = sig.signature.slice(0, 32);
  ret.s = sig.signature.slice(32, 64);
  ret.v = sig.recovery + 27;
  return ret;
};

/**
 * Returns the keccak-256 hash of `message`, prefixed with the header used by the `eth_sign` RPC call.
 * The output of this function can be fed into `ecsign` to produce the same signature as the `eth_sign`
 * call for a given `message`, or fed to `ecrecover` along with a signature to recover the public key
 * used to produce the signature.
 * @param message
 * @returns {Buffer} hash
 */
exports.hashPersonalMessage = function (message) {
  var prefix = exports.toBuffer('\x19Ethereum Signed Message:\n' + message.length.toString());
  return exports.keccak(Buffer.concat([prefix, message]));
};

/**
 * ECDSA public key recovery from signature
 * @param {Buffer} msgHash
 * @param {Number} v
 * @param {Buffer} r
 * @param {Buffer} s
 * @return {Buffer} publicKey
 */
exports.ecrecover = function (msgHash, v, r, s) {
  var signature = Buffer.concat([exports.setLength(r, 32), exports.setLength(s, 32)], 64);
  var recovery = v - 27;
  if (recovery !== 0 && recovery !== 1) {
    throw new Error('Invalid signature v value');
  }
  var senderPubKey = secp256k1.recover(msgHash, signature, recovery);
  return secp256k1.publicKeyConvert(senderPubKey, false).slice(1);
};

/**
 * Convert signature parameters into the format of `eth_sign` RPC method
 * @param {Number} v
 * @param {Buffer} r
 * @param {Buffer} s
 * @return {String} sig
 */
exports.toRpcSig = function (v, r, s) {
  // NOTE: with potential introduction of chainId this might need to be updated
  if (v !== 27 && v !== 28) {
    throw new Error('Invalid recovery id');
  }

  // geth (and the RPC eth_sign method) uses the 65 byte format used by Bitcoin
  return exports.bufferToHex(Buffer.concat([exports.setLengthLeft(r, 32), exports.setLengthLeft(s, 32), exports.toBuffer(v)]));
};

/**
 * Convert signature format of the `eth_sign` RPC method to signature parameters
 * NOTE: all because of a bug in geth: https://github.com/ethereum/go-ethereum/issues/2053
 * @param {String} sig
 * @return {Object}
 */
exports.fromRpcSig = function (sig) {
  sig = exports.toBuffer(sig);

  // NOTE: with potential introduction of chainId this might need to be updated
  if (sig.length !== 65) {
    throw new Error('Invalid signature length');
  }

  var v = sig[64];
  // support both versions of `eth_sign` responses
  if (v < 27) {
    v += 27;
  }

  return {
    v: v,
    r: sig.slice(0, 32),
    s: sig.slice(32, 64)
  };
};

/**
 * Returns the ethereum address of a given private key
 * @param {Buffer} privateKey A private key must be 256 bits wide
 * @return {Buffer}
 */
exports.privateToAddress = function (privateKey) {
  return exports.publicToAddress(privateToPublic(privateKey));
};

/**
  * Checks if a given address is a zero address
  * @method isZeroAddress
  * @param {String} address
  * @return {Boolean}
  */
exports.isZeroAddress = function (address) {
  var zeroAddress = exports.zeroAddress();
  return zeroAddress === exports.addHexPrefix(address);
};

/**
 * Generates an address of a newly created contract
 * @param {Buffer} from the address which is creating this new address
 * @param {Buffer} nonce the nonce of the from account
 * @return {Buffer}
 */
exports.generateAddress = function (from, nonce) {
  from = exports.toBuffer(from);
  nonce = new BN(nonce);

  if (nonce.isZero()) {
    // in RLP we want to encode null in the case of zero nonce
    // read the RLP documentation for an answer if you dare
    nonce = null;
  } else {
    nonce = Buffer.from(nonce.toArray());
  }

  // Only take the lower 160bits of the hash
  return exports.rlphash([from, nonce]).slice(-20);
};

/**
 * Returns true if the supplied address belongs to a precompiled account (Byzantium)
 * @param {Buffer|String} address
 * @return {Boolean}
 */
exports.isPrecompiled = function (address) {
  var a = exports.unpad(address);
  return a.length === 1 && a[0] >= 1 && a[0] <= 8;
};

/**
 * Adds "0x" to a given `String` if it does not already start with "0x"
 * @param {String} str
 * @return {String}
 */
exports.addHexPrefix = function (str) {
  if (typeof str !== 'string') {
    return str;
  }

  return exports.isHexPrefixed(str) ? str : '0x' + str;
};

/**
 * Validate ECDSA signature
 * @method isValidSignature
 * @param {Buffer} v
 * @param {Buffer} r
 * @param {Buffer} s
 * @param {Boolean} [homestead=true]
 * @return {Boolean}
 */

exports.isValidSignature = function (v, r, s, homestead) {
  if (r.length !== 32 || s.length !== 32) {
    return false;
  }

  if (v !== 27 && v !== 28) {
    return false;
  }

  r = new BN(r);
  s = new BN(s);

  if (r.isZero() || r.gt(SECP256K1_N) || s.isZero() || s.gt(SECP256K1_N)) {
    return false;
  }

  if (homestead === false && new BN(s).cmp(SECP256K1_N_DIV_2) === 1) {
    return false;
  }

  return true;
};

/**
 * Converts a `Buffer` or `Array` to JSON
 * @param {Buffer|Array} ba
 * @return {Array|String|null}
 */
exports.baToJSON = function (ba) {
  if (Buffer.isBuffer(ba)) {
    return '0x' + ba.toString('hex');
  } else if (ba instanceof Array) {
    var array = [];
    for (var i = 0; i < ba.length; i++) {
      array.push(exports.baToJSON(ba[i]));
    }
    return array;
  }
};

/**
 * Defines properties on a `Object`. It make the assumption that underlying data is binary.
 * @param {Object} self the `Object` to define properties on
 * @param {Array} fields an array fields to define. Fields can contain:
 * * `name` - the name of the properties
 * * `length` - the number of bytes the field can have
 * * `allowLess` - if the field can be less than the length
 * * `allowEmpty`
 * @param {*} data data to be validated against the definitions
 */
exports.defineProperties = function (self, fields, data) {
  self.raw = [];
  self._fields = [];

  // attach the `toJSON`
  self.toJSON = function (label) {
    if (label) {
      var obj = {};
      self._fields.forEach(function (field) {
        obj[field] = '0x' + self[field].toString('hex');
      });
      return obj;
    }
    return exports.baToJSON(this.raw);
  };

  self.serialize = function serialize() {
    return rlp.encode(self.raw);
  };

  fields.forEach(function (field, i) {
    self._fields.push(field.name);
    function getter() {
      return self.raw[i];
    }
    function setter(v) {
      v = exports.toBuffer(v);

      if (v.toString('hex') === '00' && !field.allowZero) {
        v = Buffer.allocUnsafe(0);
      }

      if (field.allowLess && field.length) {
        v = exports.stripZeros(v);
        assert(field.length >= v.length, 'The field ' + field.name + ' must not have more ' + field.length + ' bytes');
      } else if (!(field.allowZero && v.length === 0) && field.length) {
        assert(field.length === v.length, 'The field ' + field.name + ' must have byte length of ' + field.length);
      }

      self.raw[i] = v;
    }

    Object.defineProperty(self, field.name, {
      enumerable: true,
      configurable: true,
      get: getter,
      set: setter
    });

    if (field.default) {
      self[field.name] = field.default;
    }

    // attach alias
    if (field.alias) {
      Object.defineProperty(self, field.alias, {
        enumerable: false,
        configurable: true,
        set: setter,
        get: getter
      });
    }
  });

  // if the constuctor is passed data
  if (data) {
    if (typeof data === 'string') {
      data = Buffer.from(exports.stripHexPrefix(data), 'hex');
    }

    if (Buffer.isBuffer(data)) {
      data = rlp.decode(data);
    }

    if (Array.isArray(data)) {
      if (data.length > self._fields.length) {
        throw new Error('wrong number of fields in data');
      }

      // make sure all the items are buffers
      data.forEach(function (d, i) {
        self[self._fields[i]] = exports.toBuffer(d);
      });
    } else if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object') {
      var keys = Object.keys(data);
      fields.forEach(function (field) {
        if (keys.indexOf(field.name) !== -1) self[field.name] = data[field.name];
        if (keys.indexOf(field.alias) !== -1) self[field.alias] = data[field.alias];
      });
    } else {
      throw new Error('invalid data');
    }
  }
};

// x * hash(P)P
exports.xScalarHashP = function (x, P) {
  var hashPub = exports.sha3(P);
  var iP = secp256k1.publicKeyTweakMul(P, hashPub);
  var I = secp256k1.publicKeyTweakMul(iP, x);
  return I;
};

exports.waddressLength = 66 * 2;
exports.isValidWAddress = function (address) {
  return (/^0x[0-9a-fA-F]{132}$/i.test(address)
  );
};

exports.toChecksumOTAddress = function (address) {
  address = exports.stripHexPrefix(address).toLowerCase();
  if (address.length !== exports.waddressLength) {
    return '';
  }
  var abx = address.slice(2, 66) + address.slice(68);
  var Cabx = '';
  var hash = exports.sha3(address, 512).toString('hex');

  for (var i = 0; i < abx.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      Cabx += abx[i].toUpperCase();
    } else {
      Cabx += abx[i];
    }
  }

  return '0x' + address.slice(0, 2) + Cabx.slice(0, 64) + address.slice(66, 68) + Cabx.slice(64);
};

exports.isValidChecksumOTAddress = function (address) {
  return exports.isValidWAddress(address) && exports.toChecksumOTAddress(address) === address;
};
exports.getDataForSendWanCoin = function (fromWaddr) {
  if (!exports.isValidChecksumOTAddress(fromWaddr)) {
    return '';
  }
  var Pubkey = exports.stripHexPrefix(fromWaddr).toLowerCase();
  return '0x00' + Pubkey;
};
exports.verifyRinSign = function (ringArgs) {
  var sumC = new BN('0');
  for (var i = 0; i < ringArgs.w.length; i++) {
    sumC = sumC.add(new BN(ringArgs.w[i]));
  }
  sumC = sumC.umod(SECP256K1_N);
  console.log('all  sum: ', sumC.toBuffer('be', 32).toString('hex'));
  var h = createKeccakHash('keccak256');
  h.update(ringArgs.m);
  for (var _i = 0; _i < ringArgs.w.length; _i++) {
    var Li = secp256k1.publicKeyCreate(ringArgs.q[_i], false); // [qi]G
    var tP = secp256k1.publicKeyTweakMul(ringArgs.PubKeys[_i], ringArgs.w[_i]); // [wi]Pi
    Li = secp256k1.publicKeyCombine([Li, tP], false); // [qi]G + [wi]Pi
    h.update(Li);
  }
  for (var _i2 = 0; _i2 < ringArgs.q.length; _i2++) {
    var Ric = exports.xScalarHashP(ringArgs.q[_i2], ringArgs.PubKeys[_i2]);
    var Ri = secp256k1.publicKeyConvert(Ric, false);
    var wiI = secp256k1.publicKeyTweakMul(ringArgs.I, ringArgs.w[_i2]);
    Ri = secp256k1.publicKeyCombine([Ri, wiI], false);
    h.update(Ri);
  }
  var hash = h.digest();
  console.log('all hash: ', hash.toString('hex'));
  return hash.toString('hex') === sumC.toBuffer('be', 32).toString('hex');
};
exports.getRingSign = function (m, otaSk, otaPubK, ringPubKs) {
  var rklen = ringPubKs.length;
  var s = Math.floor(Math.random() * (rklen + 1));
  ringPubKs.splice(s, 0, otaPubK);

  var Ic = exports.xScalarHashP(otaSk, otaPubK); // otaSk * hash(otaPubK)otaPubK
  var I = secp256k1.publicKeyConvert(Ic, false);
  var q = [];
  var w = [];
  var sumC = new BN('0');
  var h = createKeccakHash('keccak256');
  h.update(m);
  for (var i = 0; i < rklen + 1; i++) {
    q.push(_generatePrivateKey());
    w.push(_generatePrivateKey());
    var Li = secp256k1.publicKeyCreate(q[i], false); // [qi]G
    if (i !== s) {
      var tP = secp256k1.publicKeyTweakMul(ringPubKs[i], w[i]); // [wi]Pi
      Li = secp256k1.publicKeyCombine([Li, tP], false); // [qi]G + [wi]Pi
      sumC = sumC.add(new BN(w[i]));
      sumC = sumC.umod(SECP256K1_N);
    }
    h.update(Li);
  }
  for (var _i3 = 0; _i3 < rklen + 1; _i3++) {
    var Ric = exports.xScalarHashP(q[_i3], ringPubKs[_i3]);
    var Ri = secp256k1.publicKeyConvert(Ric, false);
    if (_i3 !== s) {
      var wiI = secp256k1.publicKeyTweakMul(I, w[_i3]);
      Ri = secp256k1.publicKeyCombine([Ri, wiI], false);
    }
    h.update(Ri);
  }
  var cd = h.digest('hex');
  var c = new BN(cd, 16).umod(SECP256K1_N);
  var cs = c.sub(sumC).umod(SECP256K1_N);

  var Qs = new BN(q[s]);
  var bnx = new BN(otaSk).umod(SECP256K1_N);
  var csx = cs.mul(bnx).umod(SECP256K1_N); // ;
  var rs = Qs.sub(csx).umod(SECP256K1_N);
  w[s] = cs.toBuffer('be', 32);
  q[s] = rs.toBuffer('be', 32);

  return {
    q: q,
    w: w,
    PubKeys: ringPubKs,
    I: I,
    m: m
  };
};

/**
 * convert waddress to raw
 * @param {String} fromWaddr
 * @return {Buffer}
 */
exports.convertWaddrtoRaw = function (fromWaddr) {
  var address = exports.stripHexPrefix(fromWaddr).toLowerCase();
  var pubKeyA = secp256k1.publicKeyConvert(new Buffer(address.slice(0, 66), 'hex'), false);
  var pubKeyB = secp256k1.publicKeyConvert(new Buffer(address.slice(66), 'hex'), false);
  var PubKey = secp256k1.publicKeyConvert(pubKeyA, false).toString('hex').slice(2) + secp256k1.publicKeyConvert(pubKeyB, false).toString('hex').slice(2);
  return PubKey;
};

/**
 * convert buffer to waddress
 * @param {Buffer} fromRawaddr
 * @return {String}
 */
exports.convertRawtoWaddr = function (fromRawaddr) {
  var addr = exports.recoverPubkeyFromRaw(fromRawaddr);
  var pubKeyA = addr.A;
  var pubKeyB = addr.B;
  var PubKey = secp256k1.publicKeyConvert(pubKeyA, true).toString('hex') + secp256k1.publicKeyConvert(pubKeyB, true).toString('hex');
  return exports.toChecksumOTAddress(PubKey);
};
exports.generateWaddrFromPriv = function (privA, privB) {
  var pubkeyA = secp256k1.publicKeyCreate(privA, true);
  var pubkeyB = secp256k1.publicKeyCreate(privB, true);
  return exports.convertPubKeytoWaddr(pubkeyA, pubkeyB);
};
exports.convertPubKeytoWaddr = function (pubKeyA, pubKeyB) {
  var PubKey = secp256k1.publicKeyConvert(pubKeyA, true).toString('hex') + secp256k1.publicKeyConvert(pubKeyB, true).toString('hex');
  return exports.toChecksumOTAddress(PubKey);
};
exports.generateA1 = function (RPrivateKeyDBytes, pubKeyA, pubKeyB) {
  var A1 = secp256k1.publicKeyTweakMul(pubKeyB, RPrivateKeyDBytes, false);
  var A1Bytes = exports.sha3(A1);
  A1 = secp256k1.publicKeyTweakAdd(pubKeyA, A1Bytes, false);
  return A1;
};

/**
 * Recover public key from waddress
 * @param {String} fromWaddr
 * @return {Object}
 */
exports.recoverPubkeyFromWaddress = function (fromWaddr) {
  var address = exports.stripHexPrefix(fromWaddr).toLowerCase();
  var pubKeyA = secp256k1.publicKeyConvert(new Buffer(address.slice(0, 66), 'hex'), false);
  var pubKeyB = secp256k1.publicKeyConvert(new Buffer(address.slice(66), 'hex'), false);
  return { A: pubKeyA, B: pubKeyB };
};

/**
 * convert public key from buffer
 * @param {Buffer} fromRaw
 * @return {String}
 */
exports.recoverPubkeyFromRaw = function (fromRaw) {
  var rawA = '04' + fromRaw.slice(0, 128);
  var rawB = '04' + fromRaw.slice(128);
  var pubKeyA = secp256k1.publicKeyConvert(new Buffer(rawA, 'hex'), false);
  var pubKeyB = secp256k1.publicKeyConvert(new Buffer(rawB, 'hex'), false);
  return { A: pubKeyA, B: pubKeyB };
};

/**
 * Generate OTA Waddress from Waddress
 * @param {String} fromWaddr
 * @return {String}
 */
exports.generateOTAWaddress = function (fromWaddr) {
  var PubKey = exports.recoverPubkeyFromWaddress(fromWaddr);
  var pubKeyA = PubKey.A;
  var pubKeyB = PubKey.B;
  var RPrivateKey = _generatePrivateKey();
  var A1 = exports.generateA1(RPrivateKey, pubKeyA, pubKeyB);
  var S1 = secp256k1.publicKeyCreate(new Buffer(RPrivateKey, 'hex'), false);
  var OTAPubKey = secp256k1.publicKeyConvert(A1, true).toString('hex') + secp256k1.publicKeyConvert(S1, true).toString('hex');
  return exports.toChecksumOTAddress(OTAPubKey);
};

exports.otaHash = function () {
  var item;
  if (arguments.length < 1) {
    throw Error('invalid parameters');
  }
  var buf = new Buffer([]);
  for (var i = 0; i < arguments.length; i++) {
    item = exports.toBuffer(arguments[i]);
    buf = Buffer.concat([buf, item]);
  }
  return exports.sha3(buf);
};

// strstrPrivateKey shouldn't have 0x prefix
exports.otaSign = function (hashSrc, strPrivateKey) {
  var privateKey = new Buffer(strPrivateKey, 'hex');
  return exports.ecsign(hashSrc, privateKey);
};

exports.ascii_to_hexa = function (str) {
  var arr1 = [];
  for (var n = 0, l = str.length; n < l; n++) {
    var hex = Number(str.charCodeAt(n)).toString(16);
    arr1.push(hex);
  }
  return arr1.join('');
};

// convert number to bytes32 for compatible with contract evm hash implements
// TODO: validate input
exports.numberToBytes32 = function (input) {
  if (!input) {
    return '';
  }
  var inputStr = input.toString();
  var a2hStr = exports.ascii_to_hexa(inputStr);
  var padding = '';
  for (var i = 0; i < 64 - a2hStr.length; i++) {
    padding += '0';
  }
  return '0x' + a2hStr + padding;
};

/**
 * get public key string from private key string
 * @param private key string
 * @return {String|null}
 */
exports.publicKeyFromPrivateKey = function (privateKey) {
  if (!privateKey.startsWith('0x')) {
    privateKey = '0x' + privateKey;
  }
  return exports.bufferToHex(exports.privateToPublic(privateKey), 'hex');
};

function _generatePrivateKey() {
  var randomBuf = crypto.randomBytes(32);
  if (secp256k1.privateKeyVerify(randomBuf)) {
    return randomBuf;
  } else {
    return _generatePrivateKey();
  }
}

function _generateA1(RPrivateKeyDBytes, pubKeyA, pubKeyB) {
  var A1 = secp256k1.publicKeyTweakMul(pubKeyA, RPrivateKeyDBytes, false);
  var A1Bytes = exports.sha3(A1);
  A1 = secp256k1.publicKeyTweakAdd(pubKeyB, A1Bytes, false);
  return A1;
}

function _generateOTAPublicKey(pubKeyA, pubKeyB) {
  var RPrivateKey = _generatePrivateKey();
  var A1 = _generateA1(RPrivateKey, pubKeyA, pubKeyB);
  return {
    OtaA1: exports.bufferToHex(A1).slice(4),
    OtaS1: exports.bufferToHex(exports.privateToPublic(RPrivateKey)).slice(2)
  };
}

// input is 128 or 130 byte
function _utilPubkey2SecpFormat(utilPubKeyStr) {
  if (utilPubKeyStr.startsWith('0x')) {
    utilPubKeyStr = utilPubKeyStr.slice(2);
  }
  utilPubKeyStr = '04' + utilPubKeyStr;
  return secp256k1.publicKeyConvert(new Buffer(utilPubKeyStr, 'hex'));
}

exports.pubkeyStrCompressed = function (pubStr) {
  var buf = _utilPubkey2SecpFormat(pubStr);
  return exports.bufferToHex(buf);
};

exports.generateOTAPublicKey = function (A, B) {
  var pubKeyA = _utilPubkey2SecpFormat(A);
  var pubKeyB = _utilPubkey2SecpFormat(B);
  return _generateOTAPublicKey(pubKeyA, pubKeyB);
};

function _privateKeyStr2Buf(s) {
  if (s.startsWith('0x')) {
    s = s.slice(2);
  }
  return new Buffer(s, 'hex');
}

exports.computeOTAPrivateKey = function (A, S, a, b) {
  var otaPubS1 = _utilPubkey2SecpFormat(S);
  var privatekeyA = _privateKeyStr2Buf(a);
  var privatekeyB = _privateKeyStr2Buf(b);
  var pub = secp256k1.publicKeyTweakMul(otaPubS1, privatekeyB, false);
  var k = exports.sha3(pub);
  k = secp256k1.privateKeyTweakAdd(k, privatekeyA);
  return k;
};

/**
 * Checks if the address is a valid. Accepts checksummed addresses too
 * @param {Buffer} waddr
 * @param {Buffer} bufa
 * @param {Buffer} bufb
 * @return {Buffer}
 */
exports.computeWaddrPrivateKey = function (waddr, bufa, bufb) {
  /*
  otaPubS1 is secpFormat
  bufa, bufb is privatekey Buffer.
   */
  var ota = exports.recoverPubkeyFromWaddress(waddr);
  var pub = secp256k1.publicKeyTweakMul(ota.B, bufb, false);
  var k = exports.sha3(pub);
  k = secp256k1.privateKeyTweakAdd(k, bufa);
  return k;
};

/**
 * Checks if the address is a valid. Accepts checksummed addresses too
 * @param {String} address
 * @return {Boolean}
 */
exports.isValidAddress = function (address) {
  return (/^0x[0-9a-fA-F]{40}$/i.test(address)
  );
};

/**
 * Returns a checksummed address
 * @param {String} address
 * @return {String}
 */

exports.toChecksumAddress = function (address) {
  address = exports.stripHexPrefix(address).toLowerCase();
  var hash = exports.sha3(address).toString('hex');
  var ret = '0x';

  for (var i = 0; i < address.length; i++) {
    if (parseInt(hash[i], 16) < 8) {
      ret += address[i].toUpperCase();
    } else {
      ret += address[i];
    }
  }

  return ret;
};

/**
 * Checks if the address is a valid checksummed address
 * @param {Buffer} address
 * @return {Boolean}
 */
exports.isValidChecksumAddress = function (address) {
  return exports.isValidAddress(address) && exports.toChecksumAddress(address) === address;
};

exports.coinSCAbi = [{ 'constant': false, 'type': 'function', 'stateMutability': 'nonpayable', 'inputs': [{ 'name': 'OtaAddr', 'type': 'string' }, { 'name': 'Value', 'type': 'uint256' }], 'name': 'buyCoinNote', 'outputs': [{ 'name': 'OtaAddr', 'type': 'string' }, { 'name': 'Value', 'type': 'uint256' }] }, { 'constant': false, 'type': 'function', 'inputs': [{ 'name': 'RingSignedData', 'type': 'string' }, { 'name': 'Value', 'type': 'uint256' }], 'name': 'refundCoin', 'outputs': [{ 'name': 'RingSignedData', 'type': 'string' }, { 'name': 'Value', 'type': 'uint256' }] }, { 'constant': false, 'inputs': [], 'name': 'getCoins', 'outputs': [{ 'name': 'Value', 'type': 'uint256' }] }];
exports.stampSCAbi = [{ 'constant': false, 'type': 'function', 'stateMutability': 'nonpayable', 'inputs': [{ 'name': 'OtaAddr', 'type': 'string' }, { 'name': 'Value', 'type': 'uint256' }], 'name': 'buyStamp', 'outputs': [{ 'name': 'OtaAddr', 'type': 'string' }, { 'name': 'Value', 'type': 'uint256' }] }, { 'constant': false, 'type': 'function', 'inputs': [{ 'name': 'RingSignedData', 'type': 'string' }, { 'name': 'Value', 'type': 'uint256' }], 'name': 'refundCoin', 'outputs': [{ 'name': 'RingSignedData', 'type': 'string' }, { 'name': 'Value', 'type': 'uint256' }] }, { 'constant': false, 'type': 'function', 'stateMutability': 'nonpayable', 'inputs': [], 'name': 'getCoins', 'outputs': [{ 'name': 'Value', 'type': 'uint256' }] }];

exports.contractCoinAddress = '0x0000000000000000000000000000000000000064';
exports.contractStampAddress = '0x00000000000000000000000000000000000000c8';