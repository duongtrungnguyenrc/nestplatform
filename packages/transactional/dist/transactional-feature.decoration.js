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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionalFeatureDecoration = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestplatform/common");
const transactional_constant_1 = require("./transactional.constant");
const types_1 = require("./types");
const LOGGING_CONTEXT = "TransactionalModule";
let TransactionalFeatureDecoration = class TransactionalFeatureDecoration extends common_2.FeatureDecoration {
    constructor(adapters) {
        super();
        this.adapters = adapters;
    }
    wrapMethodWithTransaction(instance, methodName, originalMethod, options) {
        const adapterKey = options.adapter || transactional_constant_1.DEFAULT_TRANSACTION_ADAPTER;
        const fallbackAdapter = Object.values(this.adapters)[0];
        const adapter = this.adapters[adapterKey] || fallbackAdapter;
        if (!adapter) {
            if (options.logging) {
                common_1.Logger.warn(`Transaction adapter "${adapterKey}" not found. Skip wrapping for method ${methodName}.`, LOGGING_CONTEXT);
            }
            return;
        }
        instance[methodName] = async (...args) => {
            const methodString = (0, common_2.stringifyMethod)(methodName, ...args);
            if (options.logging) {
                common_1.Logger.log(`Starting transaction for \`${methodString}\` [${options.propagation || types_1.TransactionPropagation.REQUIRED}]`, LOGGING_CONTEXT);
            }
            try {
                const proxiedInstance = adapter.proxyInstance?.(instance);
                const result = await adapter.execute(() => originalMethod.apply(proxiedInstance || instance, args), {
                    propagation: options.propagation || types_1.TransactionPropagation.REQUIRED,
                    isolation: options.isolation,
                    rollbackOnError: options.rollbackOnError,
                });
                if (options.logging) {
                    common_1.Logger.log(`Transaction committed for \`${methodString}\``, LOGGING_CONTEXT);
                }
                return result;
            }
            catch (error) {
                if (options.logging) {
                    common_1.Logger.error(`Transaction rolled back for \`${methodString}\`: ${error}`, LOGGING_CONTEXT);
                }
                throw error;
            }
        };
    }
};
exports.TransactionalFeatureDecoration = TransactionalFeatureDecoration;
exports.TransactionalFeatureDecoration = TransactionalFeatureDecoration = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(transactional_constant_1.TRANSACTION_ADAPTERS)),
    __metadata("design:paramtypes", [Object])
], TransactionalFeatureDecoration);
//# sourceMappingURL=transactional-feature.decoration.js.map