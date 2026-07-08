"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestLoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const REDACT_KEYS = new Set(['password', 'client_secret', 'secret', 'authorization']);
function redact(value) {
    if (Array.isArray(value))
        return value.map(redact);
    if (value && typeof value === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            out[k] = REDACT_KEYS.has(k.toLowerCase()) ? '***' : redact(v);
        }
        return out;
    }
    return value;
}
let RequestLoggingInterceptor = class RequestLoggingInterceptor {
    constructor() {
        this.logger = new common_1.Logger('HTTP');
    }
    intercept(context, next) {
        var _a, _b;
        const req = context.switchToHttp().getRequest();
        const res = context.switchToHttp().getResponse();
        const { method, originalUrl } = req;
        const started = Date.now();
        const auth = req.auth;
        const actor = (_b = (_a = req.oauthClientId) !== null && _a !== void 0 ? _a : auth === null || auth === void 0 ? void 0 : auth.azp) !== null && _b !== void 0 ? _b : 'anonymous';
        const hasBody = req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0;
        const bodyStr = hasBody ? ` body=${JSON.stringify(redact(req.body))}` : '';
        this.logger.log(`--> ${method} ${originalUrl} | client=${actor}${bodyStr}`);
        return next.handle().pipe((0, operators_1.tap)(() => {
            this.logger.log(`<-- ${method} ${originalUrl} ${res.statusCode} (${Date.now() - started}ms)`);
        }), (0, operators_1.catchError)((err) => {
            var _a, _b, _c, _d;
            const status = (_c = (_a = err === null || err === void 0 ? void 0 : err.status) !== null && _a !== void 0 ? _a : (_b = err === null || err === void 0 ? void 0 : err.getStatus) === null || _b === void 0 ? void 0 : _b.call(err)) !== null && _c !== void 0 ? _c : 500;
            const message = (_d = err === null || err === void 0 ? void 0 : err.message) !== null && _d !== void 0 ? _d : String(err);
            this.logger.warn(`<-- ${method} ${originalUrl} ${status} (${Date.now() - started}ms) | error: ${message}`);
            return (0, rxjs_1.throwError)(() => err);
        }));
    }
};
exports.RequestLoggingInterceptor = RequestLoggingInterceptor;
exports.RequestLoggingInterceptor = RequestLoggingInterceptor = __decorate([
    (0, common_1.Injectable)()
], RequestLoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map