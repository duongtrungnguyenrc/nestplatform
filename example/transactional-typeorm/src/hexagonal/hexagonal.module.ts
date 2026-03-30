import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './core/domain/user.entity';
import { UserService } from './core/application/user.service';
import { USER_REPOSITORY } from './core/ports/user.repository.interface';
import { TypeOrmUserRepository } from './infrastructure/typeorm.user.repository';
import { HexagonalController } from './hexagonal.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [HexagonalController],
  providers: [
    UserService,
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
  ],
  exports: [UserService],
})
export class HexagonalModule {}
