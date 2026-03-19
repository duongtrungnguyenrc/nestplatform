"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TransactionalEventPublisher_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionalEventPublisher = void 0;
const common_1 = require("@nestjs/common");
const transaction_context_1 = require("./transaction-context");
const types_1 = require("./types");
let TransactionalEventPublisher = TransactionalEventPublisher_1 = class TransactionalEventPublisher {
    constructor() {
        this.listeners = new Map();
        this.logger = new common_1.Logger(TransactionalEventPublisher_1.name);
    }
    registerListener(metadata) {
        const eventListeners = this.listeners.get(metadata.event) || [];
        eventListeners.push(metadata);
        this.listeners.set(metadata.event, eventListeners);
    }
    async publish(event, payload) {
        const eventListeners = this.listeners.get(event);
        if (!eventListeners)
            return;
        const store = transaction_context_1.TransactionContext.getStore();
        for (const listener of eventListeners) {
            if (!store) {
                if (listener.fallbackExecution !== false) {
                    await this.executeListener(listener, payload);
                }
                continue;
            }
            const phase = listener.phase || types_1.TransactionPhase.AFTER_COMMIT;
            const self = this;
            transaction_context_1.TransactionContext.addSynchronization({
                async beforeCommit() {
                    if (phase === types_1.TransactionPhase.BEFORE_COMMIT) {
                        await self.executeListener(listener, payload);
                    }
                },
                async afterCommit() {
                    if (phase === types_1.TransactionPhase.AFTER_COMMIT) {
                        await self.executeListener(listener, payload);
                    }
                },
                async afterRollback() {
                    if (phase === types_1.TransactionPhase.AFTER_ROLLBACK) {
                        await self.executeListener(listener, payload);
                    }
                },
                async afterCompletion() {
                    if (phase === types_1.TransactionPhase.AFTER_COMPLETION) {
                        await self.executeListener(listener, payload);
                    }
                },
            });
        }
    }
    async executeListener(listener, payload) {
        try {
            await listener.callback(payload);
        }
        catch (error) {
            this.logger.error(`Error in transactional event listener for event "${listener.event}": ${error}`);
        }
    }
};
exports.TransactionalEventPublisher = TransactionalEventPublisher;
exports.TransactionalEventPublisher = TransactionalEventPublisher = TransactionalEventPublisher_1 = __decorate([
    (0, common_1.Injectable)()
], TransactionalEventPublisher);
//# sourceMappingURL=transactional-event.publisher.js.map