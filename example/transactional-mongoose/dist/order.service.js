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
var OrderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const order_schema_1 = require("./order.schema");
const transactional_1 = require("@nestplatform/transactional");
let OrderService = OrderService_1 = class OrderService {
    constructor(orderModel, eventPublisher) {
        this.orderModel = orderModel;
        this.eventPublisher = eventPublisher;
        this.logger = new common_1.Logger(OrderService_1.name);
    }
    async createOrder(productName, amount) {
        this.logger.log(`Creating order for ${productName}`);
        const order = new this.orderModel({ productName, amount });
        return order.save();
    }
    async createOrderWithEvent(productName, amount) {
        this.logger.log(`Creating order (with event) for ${productName}`);
        const order = new this.orderModel({ productName, amount });
        const savedOrder = await order.save();
        await this.eventPublisher.publish('order.created', savedOrder);
        return savedOrder;
    }
    async createOrderRequiresNew(productName, amount) {
        this.logger.log(`Creating order (REQUIRES_NEW) for ${productName}`);
        const order = new this.orderModel({ productName, amount, status: 'requires_new' });
        return order.save();
    }
    async createOrderWithRollback(productName, amount) {
        this.logger.log(`Creating order (will rollback) for ${productName}`);
        const order = new this.orderModel({ productName, amount, status: 'should_rollback' });
        await order.save();
        throw new Error('Forced rollback for testing');
    }
    async createOrderWithConditionalRollback(productName, amount, shouldTypeMatch) {
        this.logger.log(`Creating order (conditional rollback) for ${productName}`);
        const order = new this.orderModel({ productName, amount, status: 'conditional_rollback' });
        await order.save();
        if (shouldTypeMatch) {
            const error = new Error('Business Error');
            error.name = 'BusinessException';
            throw error;
        }
        else {
            throw new Error('Other Error (should NOT rollback)');
        }
    }
    async createOrderDeclarative(productName, amount) {
        this.logger.log(`Creating order (declarative event) for ${productName}`);
        const order = new this.orderModel({ productName, amount, status: 'declarative' });
        return order.save();
    }
    async createAuditLog(orderId, action) {
        this.logger.log(`Audit: ${action} on order ${orderId}`);
    }
    async adjustOrderAmount(orderId, adjustment) {
        this.logger.log(`Adjusting order ${orderId} amount by ${adjustment}`);
        await this.orderModel.findByIdAndUpdate(orderId, { $inc: { amount: adjustment } });
    }
    async onOrderCreated(order) {
        this.logger.log(`[EVENT] Order ${order._id} committed! Sending confirmation email...`);
    }
    async onOrderFailed(order) {
        this.logger.warn(`[EVENT] Order ${order._id} failed! Notifying support...`);
    }
};
exports.OrderService = OrderService;
__decorate([
    (0, transactional_1.Transactional)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], OrderService.prototype, "createOrder", null);
__decorate([
    (0, transactional_1.Transactional)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], OrderService.prototype, "createOrderWithEvent", null);
__decorate([
    (0, transactional_1.Transactional)({ propagation: transactional_1.TransactionPropagation.REQUIRES_NEW }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], OrderService.prototype, "createOrderRequiresNew", null);
__decorate([
    (0, transactional_1.Transactional)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], OrderService.prototype, "createOrderWithRollback", null);
__decorate([
    (0, transactional_1.Transactional)({ rollbackOnError: 'BusinessException' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Boolean]),
    __metadata("design:returntype", Promise)
], OrderService.prototype, "createOrderWithConditionalRollback", null);
__decorate([
    (0, transactional_1.TransactionalEvent)('order.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], OrderService.prototype, "createOrderDeclarative", null);
__decorate([
    (0, transactional_1.Transactional)({ propagation: transactional_1.TransactionPropagation.REQUIRES_NEW }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrderService.prototype, "createAuditLog", null);
__decorate([
    (0, transactional_1.Transactional)({ propagation: transactional_1.TransactionPropagation.NESTED }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], OrderService.prototype, "adjustOrderAmount", null);
__decorate([
    (0, transactional_1.TransactionalEventListener)('order.created', { phase: transactional_1.TransactionPhase.AFTER_COMMIT }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_schema_1.Order]),
    __metadata("design:returntype", Promise)
], OrderService.prototype, "onOrderCreated", null);
__decorate([
    (0, transactional_1.TransactionalEventListener)('order.created', { phase: transactional_1.TransactionPhase.AFTER_ROLLBACK }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_schema_1.Order]),
    __metadata("design:returntype", Promise)
], OrderService.prototype, "onOrderFailed", null);
exports.OrderService = OrderService = OrderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        transactional_1.TransactionalEventPublisher])
], OrderService);
//# sourceMappingURL=order.service.js.map