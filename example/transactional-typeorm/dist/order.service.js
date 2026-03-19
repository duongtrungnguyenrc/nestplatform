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
exports.OrderService = exports.BusinessException = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transactional_1 = require("@nestplatform/transactional");
const order_entity_1 = require("./order.entity");
class BusinessException extends Error {
    constructor(message) {
        super(message);
        this.name = 'BusinessException';
    }
}
exports.BusinessException = BusinessException;
let OrderService = OrderService_1 = class OrderService {
    orderRepo;
    eventPublisher;
    logger = new common_1.Logger(OrderService_1.name);
    constructor(orderRepo, eventPublisher) {
        this.orderRepo = orderRepo;
        this.eventPublisher = eventPublisher;
    }
    async createOrderWithEvent(productName, amount) {
        this.logger.log(`Creating order (with event) for ${productName}`);
        const order = this.orderRepo.create({
            productName,
            amount,
            status: 'pending',
        });
        const savedOrder = await this.orderRepo.save(order);
        await this.eventPublisher.publish('order.created', savedOrder);
        return savedOrder;
    }
    async createOrderDeclarative(productName, amount) {
        this.logger.log(`Creating order (declarative event) for ${productName}`);
        const order = this.orderRepo.create({
            productName,
            amount,
            status: 'pending',
        });
        return this.orderRepo.save(order);
    }
    async onOrderCreated(order) {
        this.logger.log(`[EVENT] Order ${order.id} committed! Sending confirmation email...`);
    }
    async onOrderFailed(order) {
        this.logger.warn(`[EVENT] Order ${order.id} failed! Notifying support...`);
    }
    async processWithConditionalRollback() {
        await this.orderRepo.save({
            productName: 'Temp',
            amount: 10,
            status: 'processing',
        });
        throw new BusinessException('Test Error');
    }
    async createOrder(productName, amount) {
        this.logger.log(`Creating order for ${productName}`);
        const order = this.orderRepo.create({
            productName,
            amount,
            status: 'pending',
        });
        const savedOrder = await this.orderRepo.save(order);
        await this.updateOrderStatus(savedOrder.id, 'confirmed');
        return savedOrder;
    }
    async updateOrderStatus(orderId, status) {
        this.logger.log(`Updating order ${orderId} status to ${status}`);
        await this.orderRepo.update(orderId, { status });
    }
    async createAuditLog(orderId, action) {
        this.logger.log(`Audit: ${action} on order ${orderId}`);
        await this.orderRepo.query('INSERT INTO audit_logs (order_id, action) VALUES ($1, $2)', [orderId, action]);
    }
    async findById(id) {
        return this.orderRepo.findOne({ where: { id } });
    }
    async findAll() {
        return this.orderRepo.find();
    }
    async adjustOrderAmount(orderId, adjustment) {
        this.logger.log(`Adjusting order ${orderId} amount by ${adjustment}`);
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order) {
            throw new Error(`Order ${orderId} not found`);
        }
        await this.orderRepo.update(orderId, {
            amount: order.amount + adjustment,
        });
    }
};
exports.OrderService = OrderService;
__decorate([
    (0, transactional_1.TransactionalEvent)('order.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], OrderService.prototype, "createOrderDeclarative", null);
__decorate([
    (0, transactional_1.TransactionalEventListener)('order.created', {
        phase: transactional_1.TransactionPhase.AFTER_COMMIT,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_entity_1.Order]),
    __metadata("design:returntype", Promise)
], OrderService.prototype, "onOrderCreated", null);
__decorate([
    (0, transactional_1.TransactionalEventListener)('order.created', {
        phase: transactional_1.TransactionPhase.AFTER_ROLLBACK,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_entity_1.Order]),
    __metadata("design:returntype", Promise)
], OrderService.prototype, "onOrderFailed", null);
__decorate([
    (0, transactional_1.Transactional)({ rollbackOnError: 'BusinessException' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrderService.prototype, "processWithConditionalRollback", null);
__decorate([
    (0, transactional_1.Transactional)({ propagation: transactional_1.TransactionPropagation.REQUIRES_NEW }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrderService.prototype, "createAuditLog", null);
__decorate([
    (0, transactional_1.NoTransactional)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderService.prototype, "findById", null);
__decorate([
    (0, transactional_1.NoTransactional)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrderService.prototype, "findAll", null);
__decorate([
    (0, transactional_1.Transactional)({ propagation: transactional_1.TransactionPropagation.NESTED }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], OrderService.prototype, "adjustOrderAmount", null);
exports.OrderService = OrderService = OrderService_1 = __decorate([
    (0, transactional_1.Transactional)(),
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        transactional_1.TransactionalEventPublisher])
], OrderService);
//# sourceMappingURL=order.service.js.map