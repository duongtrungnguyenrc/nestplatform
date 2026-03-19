import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { TransactionalModule } from '@nestplatform/transactional';
import { TypeOrmTransactionAdapter } from '@nestplatform/transactional-typeorm';

import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './order.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: configService.getOrThrow<number>('DB_PORT'),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_DATABASE'),
        entities: [Order],
        logging: true,
        synchronize: true, // Only for development
      }),
    }),

    TypeOrmModule.forFeature([Order]),

    // Register Transactional Module with TypeORM adapter
    TransactionalModule.registerAsync({
      inject: [DataSource],
      useFactory: (dataSource: DataSource) => ({
        adapters: new TypeOrmTransactionAdapter(dataSource),
        logging: true,
      }),
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class AppModule {}
