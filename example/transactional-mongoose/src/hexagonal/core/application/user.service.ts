import { Inject, Injectable } from "@nestjs/common";
import { Transactional } from "@nestplatform/transactional";
import { USER_REPOSITORY } from "../ports/user.repository.interface";
import type { IUserRepository } from "../ports/user.repository.interface";
import { User } from "../domain/user.entity";

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  @Transactional()
  async createUser(name: string, email: string): Promise<User> {
    const savedUser = await this.userRepository.create(name, email);

    // Demonstration of rollback if we throw an error (uncomment to test rollback)
    if (email === "error@test.com") {
      throw new Error("Simulated error to rollback transaction in Hexagonal Architecture Mongoose!");
    }

    return savedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
