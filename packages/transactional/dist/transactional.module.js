"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TransactionalModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionalModule = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestplatform/common");
const providers_1 = require("./providers");
const transactional_metadata_explorer_1 = require("./transactional-metadata.explorer");
const transactional_feature_decoration_1 = require("./transactional-feature.decoration");
const transactional_metadata_accessor_1 = require("./transactional-metadata.accessor");
const transactional_event_publisher_1 = require("./transactional-event.publisher");
let TransactionalModule = TransactionalModule_1 = class TransactionalModule extends common_2.ConfigurableModule {
    static register(config) {
        return super.config(config, {
            global: true,
            module: TransactionalModule_1,
            imports: [common_2.FeatureExplorerModule],
            providers: [
                (0, providers_1.TransactionAdapterProvider)(config),
                transactional_metadata_explorer_1.TransactionalMetadataExplorer,
                transactional_metadata_accessor_1.TransactionalMetadataAccessor,
                transactional_feature_decoration_1.TransactionalFeatureDecoration,
                transactional_event_publisher_1.TransactionalEventPublisher,
            ],
            exports: [transactional_event_publisher_1.TransactionalEventPublisher],
        });
    }
    static registerAsync(config) {
        return super.config(config, {
            global: true,
            module: TransactionalModule_1,
            imports: [common_2.FeatureExplorerModule],
            providers: [
                (0, providers_1.TransactionAdapterAsyncProvider)(config),
                transactional_metadata_explorer_1.TransactionalMetadataExplorer,
                transactional_metadata_accessor_1.TransactionalMetadataAccessor,
                transactional_feature_decoration_1.TransactionalFeatureDecoration,
                transactional_event_publisher_1.TransactionalEventPublisher,
            ],
            exports: [transactional_event_publisher_1.TransactionalEventPublisher],
        });
    }
};
exports.TransactionalModule = TransactionalModule;
exports.TransactionalModule = TransactionalModule = TransactionalModule_1 = __decorate([
    (0, common_1.Module)({})
], TransactionalModule);
//# sourceMappingURL=transactional.module.js.map