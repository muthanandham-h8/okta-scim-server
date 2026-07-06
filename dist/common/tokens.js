"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
const crypto_1 = require("crypto");
function generateToken(prefix) {
    return `${prefix}_${(0, crypto_1.randomBytes)(32).toString('base64url')}`;
}
//# sourceMappingURL=tokens.js.map