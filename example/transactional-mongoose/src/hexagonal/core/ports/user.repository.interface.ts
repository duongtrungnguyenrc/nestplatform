import { User } from "../domain/user.entity";

export const USER_REPOSITORY = "USER_REPOSITORY";

export interface IUserRepository {
  create(name: string, email: string): Promise<User>;
  findAll(): Promise<User[]>;
}
