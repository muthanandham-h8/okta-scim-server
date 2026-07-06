"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatchOpDto = exports.PatchOperationDto = exports.UpdateScimUserDto = exports.CreateScimUserDto = exports.ScimEmailDto = exports.ScimNameDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class ScimNameDto {
}
exports.ScimNameDto = ScimNameDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScimNameDto.prototype, "givenName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScimNameDto.prototype, "familyName", void 0);
class ScimEmailDto {
}
exports.ScimEmailDto = ScimEmailDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScimEmailDto.prototype, "value", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ScimEmailDto.prototype, "primary", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScimEmailDto.prototype, "type", void 0);
class CreateScimUserDto {
}
exports.CreateScimUserDto = CreateScimUserDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateScimUserDto.prototype, "schemas", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateScimUserDto.prototype, "userName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateScimUserDto.prototype, "externalId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ScimNameDto),
    __metadata("design:type", ScimNameDto)
], CreateScimUserDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ScimEmailDto),
    __metadata("design:type", Array)
], CreateScimUserDto.prototype, "emails", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateScimUserDto.prototype, "active", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateScimUserDto.prototype, "password", void 0);
class UpdateScimUserDto extends CreateScimUserDto {
}
exports.UpdateScimUserDto = UpdateScimUserDto;
class PatchOperationDto {
}
exports.PatchOperationDto = PatchOperationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PatchOperationDto.prototype, "op", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PatchOperationDto.prototype, "path", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], PatchOperationDto.prototype, "value", void 0);
class PatchOpDto {
}
exports.PatchOpDto = PatchOpDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], PatchOpDto.prototype, "schemas", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PatchOperationDto),
    __metadata("design:type", Array)
], PatchOpDto.prototype, "Operations", void 0);
//# sourceMappingURL=user.dto.js.map