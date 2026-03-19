"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("typeorm");
const transactional_1 = require("@nestplatform/transactional");
const transactional_typeorm_1 = require("@nestplatform/transactional-typeorm");
const order_service_1 = require("./order.service");
const order_controller_1 = require("./order.controller");
const order_entity_1 = require("./order.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.getOrThrow('DB_HOST'),
                    port: configService.getOrThrow('DB_PORT'),
                    username: configService.getOrThrow('DB_USERNAME'),
                    password: configService.getOrThrow('DB_PASSWORD'),
                    database: configService.getOrThrow('DB_DATABASE'),
                    entities: [order_entity_1.Order],
                    logging: true,
                    synchronize: true,
                }),
            }),
            typeorm_1.TypeOrmModule.forFeature([order_entity_1.Order]),
            transactional_1.TransactionalModule.registerAsync({
                inject: [typeorm_2.DataSource],
                useFactory: (dataSource) => ({
                    adapters: new transactional_typeorm_1.TypeOrmTransactionAdapter(dataSource),
                    logging: true,
                }),
            }),
        ],
        controllers: [order_controller_1.OrderController],
        providers: [order_service_1.OrderService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map