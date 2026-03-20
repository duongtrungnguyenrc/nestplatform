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
exports.OrderController = void 0;
const common_1 = require("@nestjs/common");
const order_service_1 = require("./order.service");
let OrderController = class OrderController {
    constructor(orderService) {
        this.orderService = orderService;
    }
    async createOrder(productName, amount) {
        return this.orderService.createOrder(productName, amount);
    }
    async createOrderRequiresNew(productName, amount) {
        return this.orderService.createOrderRequiresNew(productName, amount);
    }
    async createOrderWithRollback(productName, amount) {
        return this.orderService.createOrderWithRollback(productName, amount);
    }
    async createOrderWithConditionalRollback(productName, amount, shouldTypeMatch) {
        return this.orderService.createOrderWithConditionalRollback(productName, amount, shouldTypeMatch);
    }
    async createOrderDeclarative(productName, amount) {
        return this.orderService.createOrderDeclarative(productName, amount);
    }
    async createAuditLog(orderId, action) {
        return this.orderService.createAuditLog(orderId, action);
    }
    async adjustOrderAmount(orderId, adjustment) {
        return this.orderService.adjustOrderAmount(orderId, adjustment);
    }
};
exports.OrderController = OrderController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)('productName')),
    __param(1, (0, common_1.Body)('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Post)('requires-new'),
    __param(0, (0, common_1.Body)('productName')),
    __param(1, (0, common_1.Body)('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "createOrderRequiresNew", null);
__decorate([
    (0, common_1.Post)('rollback'),
    __param(0, (0, common_1.Body)('productName')),
    __param(1, (0, common_1.Body)('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "createOrderWithRollback", null);
__decorate([
    (0, common_1.Post)('conditional-rollback'),
    __param(0, (0, common_1.Body)('productName')),
    __param(1, (0, common_1.Body)('amount')),
    __param(2, (0, common_1.Body)('shouldTypeMatch')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Boolean]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "createOrderWithConditionalRollback", null);
__decorate([
    (0, common_1.Post)('create-declarative'),
    __param(0, (0, common_1.Body)('productName')),
    __param(1, (0, common_1.Body)('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "createOrderDeclarative", null);
__decorate([
    (0, common_1.Post)('audit'),
    __param(0, (0, common_1.Body)('orderId')),
    __param(1, (0, common_1.Body)('action')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "createAuditLog", null);
__decorate([
    (0, common_1.Post)('adjust'),
    __param(0, (0, common_1.Body)('orderId')),
    __param(1, (0, common_1.Body)('adjustment')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "adjustOrderAmount", null);
exports.OrderController = OrderController = __decorate([
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [order_service_1.OrderService])
], OrderController);
//# sourceMappingURL=order.controller.js.map