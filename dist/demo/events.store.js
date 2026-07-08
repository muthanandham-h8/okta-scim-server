"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsStore = void 0;
const common_1 = require("@nestjs/common");
let EventsStore = class EventsStore {
    constructor() {
        this.events = [];
        this.seq = 0;
        this.cap = 300;
    }
    add(e) {
        const evt = Object.assign(Object.assign({}, e), { seq: ++this.seq });
        this.events.push(evt);
        if (this.events.length > this.cap) {
            this.events.splice(0, this.events.length - this.cap);
        }
        return evt;
    }
    list() {
        return this.events;
    }
    clear() {
        this.events = [];
    }
};
exports.EventsStore = EventsStore;
exports.EventsStore = EventsStore = __decorate([
    (0, common_1.Injectable)()
], EventsStore);
//# sourceMappingURL=events.store.js.map