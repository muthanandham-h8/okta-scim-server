"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ScimExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScimExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const scim_constants_1 = require("./scim.constants");
let ScimExceptionFilter = ScimExceptionFilter_1 = class ScimExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(ScimExceptionFilter_1.name);
    }
    catch(exception, host) {
        const res = host.switchToHttp().getResponse();
        const { status, detail, scimType } = this.toScimError(exception);
        res
            .status(status)
            .type('application/scim+json')
            .json(Object.assign(Object.assign({ schemas: [scim_constants_1.SCIM_ERROR_SCHEMA], status: String(status) }, (scimType ? { scimType } : {})), { detail }));
    }
    toScimError(exception) {
        var _a;
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const body = exception.getResponse();
            const rawDetail = typeof body === 'string'
                ? body
                : ((_a = body.message) !== null && _a !== void 0 ? _a : exception.message);
            const detail = Array.isArray(rawDetail) ? rawDetail.join(', ') : String(rawDetail);
            const scimType = status === common_1.HttpStatus.CONFLICT ? 'uniqueness' : undefined;
            return { status, detail, scimType };
        }
        if (exception instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            return this.mapPrismaError(exception);
        }
        this.logger.error(`Unhandled exception: ${exception instanceof Error ? exception.stack : String(exception)}`);
        return {
            status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            detail: 'Internal server error',
        };
    }
    mapPrismaError(exception) {
        switch (exception.code) {
            case 'P2002':
                return {
                    status: common_1.HttpStatus.CONFLICT,
                    detail: 'A resource with the same unique attribute already exists',
                    scimType: 'uniqueness',
                };
            case 'P2025':
                return { status: common_1.HttpStatus.NOT_FOUND, detail: 'Resource not found' };
            case 'P2023':
                return { status: common_1.HttpStatus.NOT_FOUND, detail: 'Resource not found' };
            case 'P2003':
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    detail: 'Referenced resource does not exist',
                    scimType: 'invalidValue',
                };
            default:
                this.logger.error(`Unmapped Prisma error ${exception.code}: ${exception.message}`);
                return {
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    detail: 'Internal server error',
                };
        }
    }
};
exports.ScimExceptionFilter = ScimExceptionFilter;
exports.ScimExceptionFilter = ScimExceptionFilter = ScimExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], ScimExceptionFilter);
//# sourceMappingURL=scim-exception.filter.js.map