import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./core/domain/user.entity";
import { UserService } from "./core/application/user.service";
import { USER_REPOSITORY } from "./core/ports/user.repository.interface";
import { MongooseUserRepository } from "./infrastructure/mongoose.user.repository";
import { HexagonalController } from "./hexagonal.controller";

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [HexagonalController],
  providers: [
    UserService,
    {
      provide: USER_REPOSITORY,
      useClass: MongooseUserRepository,
    },
  ],
  exports: [UserService],
})
export class HexagonalModule {}
