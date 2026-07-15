"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemoModule = void 0;
const common_1 = require("@nestjs/common");
const home_controller_1 = require("./home.controller");
const docs_controller_1 = require("./docs.controller");
const events_store_1 = require("./events.store");
let DemoModule = class DemoModule {
};
exports.DemoModule = DemoModule;
exports.DemoModule = DemoModule = __decorate([
    (0, common_1.Module)({
        controllers: [home_controller_1.HomeController, docs_controller_1.DocsController],
        providers: [events_store_1.EventsStore],
    })
], DemoModule);
//# sourceMappingURL=demo.module.js.map