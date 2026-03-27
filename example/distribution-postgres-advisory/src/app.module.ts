import { Module } from "@nestjs/common";
import { DistributionLockModule } from "@nestplatform/distribution-lock";
import { PgLockModule, PgLockService } from "@nestplatform/distribution-postgres-advisory";
import { LockController } from "./lock.controller";
import { LockService } from "./lock.service";

@Module({
  imports: [
    PgLockModule.register({
      connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres",
    }),
    DistributionLockModule.registerAsync({
      inject: [PgLockService],
      useFactory: (pgLock: PgLockService) => ({
        providers: pgLock,
      }),
    }),
  ],
  controllers: [LockController],
  providers: [LockService],
})
export class AppModule {}
