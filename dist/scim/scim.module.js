"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScimModule = void 0;
const common_1 = require("@nestjs/common");
const users_controller_1 = require("./users/users.controller");
const users_service_1 = require("./users/users.service");
const groups_controller_1 = require("./groups/groups.controller");
const groups_service_1 = require("./groups/groups.service");
const discovery_controller_1 = require("./discovery/discovery.controller");
let ScimModule = class ScimModule {
};
exports.ScimModule = ScimModule;
exports.ScimModule = ScimModule = __decorate([
    (0, common_1.Module)({
        controllers: [users_controller_1.UsersController, groups_controller_1.GroupsController, discovery_controller_1.DiscoveryController],
        providers: [users_service_1.UsersService, groups_service_1.GroupsService],
    })
], ScimModule);
//# sourceMappingURL=scim.module.js.map