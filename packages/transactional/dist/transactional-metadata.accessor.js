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
exports.TransactionalMetadataAccessor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const common_2 = require("@nestplatform/common");
const transactional_constant_1 = require("./transactional.constant");
let TransactionalMetadataAccessor = class TransactionalMetadataAccessor extends common_2.MetadataAccessor {
    constructor(reflector) {
        super();
        this.reflector = reflector;
    }
    getTransactionalMetadata(target) {
        return this.getMetadata(transactional_constant_1.TRANSACTIONAL_METADATA, target);
    }
    getNoTransactionalMetadata(target) {
        return this.getMetadata(transactional_constant_1.NO_TRANSACTIONAL_METADATA, target);
    }
};
exports.TransactionalMetadataAccessor = TransactionalMetadataAccessor;
exports.TransactionalMetadataAccessor = TransactionalMetadataAccessor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], TransactionalMetadataAccessor);
//# sourceMappingURL=transactional-metadata.accessor.js.map