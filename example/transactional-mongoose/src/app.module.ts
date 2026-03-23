import { Module } from "@nestjs/common";
import { MongooseModule, getConnectionToken } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { TransactionalModule } from "@nestplatform/transactional";
import { MongooseTransactionAdapter } from "@nestplatform/transactional-mongoose";
import { Order, OrderSchema } from "./order.schema";
import { OrderService } from "./order.service";
import { OrderController } from "./order.controller";
import { HexagonalModule } from "./hexagonal/hexagonal.module";

@Module({
  imports: [
    MongooseModule.forRoot("mongodb://localhost:27017/mongo-local"),
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    HexagonalModule,
    TransactionalModule.registerAsync({
      inject: [getConnectionToken()],
      useFactory: (connection: Connection) => ({
        adapters: new MongooseTransactionAdapter(connection),
      }),
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class AppModule {}
