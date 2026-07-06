"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScimExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const scim_constants_1 = require("./scim.constants");
let ScimExceptionFilter = class ScimExceptionFilter {
    catch(exception, host) {
        var _a;
        const ctx = host.switchToHttp();
        const res = ctx.getResponse();
        const status = exception.getStatus();
        const body = exception.getResponse();
        const detail = typeof body === 'string'
            ? body
            : ((_a = body.message) !== null && _a !== void 0 ? _a : exception.message);
        res
            .status(status)
            .type('application/scim+json')
            .json({
            schemas: [scim_constants_1.SCIM_ERROR_SCHEMA],
            status: String(status || common_1.HttpStatus.INTERNAL_SERVER_ERROR),
            detail: Array.isArray(detail) ? detail.join(', ') : String(detail),
        });
    }
};
exports.ScimExceptionFilter = ScimExceptionFilter;
exports.ScimExceptionFilter = ScimExceptionFilter = __decorate([
    (0, common_1.Catch)(common_1.HttpException)
], ScimExceptionFilter);
//# sourceMappingURL=scim-exception.filter.js.map