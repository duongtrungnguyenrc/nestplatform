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
exports.TransactionalMetadataExplorer = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestplatform/common");
const transactional_feature_decoration_1 = require("./transactional-feature.decoration");
const transactional_metadata_accessor_1 = require("./transactional-metadata.accessor");
const transactional_event_publisher_1 = require("./transactional-event.publisher");
let TransactionalMetadataExplorer = class TransactionalMetadataExplorer {
    constructor(metadataAccessor, featureDecoration, eventPublisher) {
        this.metadataAccessor = metadataAccessor;
        this.featureDecoration = featureDecoration;
        this.eventPublisher = eventPublisher;
        this.classLevelOptions = new Map();
    }
    onProvider(ctx) {
        const { metatype } = ctx;
        const classOptions = this.metadataAccessor.getTransactionalMetadata(metatype);
        if (classOptions) {
            this.classLevelOptions.set(metatype, classOptions);
        }
    }
    onMethod(ctx) {
        const { instance, methodName, methodRef, metatype } = ctx;
        const listenerMetadata = this.metadataAccessor.getEventListenerMetadata(methodRef);
        if (listenerMetadata) {
            this.eventPublisher.registerListener({
                ...listenerMetadata,
                callback: (payload) => methodRef.apply(instance, [payload]),
            });
        }
        const isExcluded = this.metadataAccessor.getNoTransactionalMetadata(methodRef);
        if (isExcluded)
            return;
        const methodOptions = this.metadataAccessor.getTransactionalMetadata(methodRef);
        const classOptions = this.classLevelOptions.get(metatype);
        const resolvedOptions = methodOptions ? { ...classOptions, ...methodOptions } : classOptions;
        const eventMetadata = this.metadataAccessor.getTransactionalEventMetadata(methodRef);
        if (eventMetadata) {
            const eventPublisher = this.eventPublisher;
            const originalMethod = methodRef;
            const wrappedWithEvent = async function (...args) {
                const result = await originalMethod.apply(this, args);
                const payload = eventMetadata.payload ? eventMetadata.payload(result) : result;
                await eventPublisher.publish(eventMetadata.event, payload);
                return result;
            };
            if (resolvedOptions) {
                this.featureDecoration.wrapMethodWithTransaction(instance, methodName, wrappedWithEvent, resolvedOptions);
            }
            else {
                instance[methodName] = wrappedWithEvent;
            }
        }
        else if (resolvedOptions) {
            this.featureDecoration.wrapMethodWithTransaction(instance, methodName, methodRef, resolvedOptions);
        }
    }
};
exports.TransactionalMetadataExplorer = TransactionalMetadataExplorer;
exports.TransactionalMetadataExplorer = TransactionalMetadataExplorer = __decorate([
    (0, common_1.Injectable)(),
    (0, common_2.FeatureExplorer)(),
    __metadata("design:paramtypes", [transactional_metadata_accessor_1.TransactionalMetadataAccessor,
        transactional_feature_decoration_1.TransactionalFeatureDecoration,
        transactional_event_publisher_1.TransactionalEventPublisher])
], TransactionalMetadataExplorer);
//# sourceMappingURL=transactional-metadata.explorer.js.map