import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../core/domain/user.entity";
import { IUserRepository } from "../core/ports/user.repository.interface";

@Injectable()
export class MongooseUserRepository implements IUserRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async create(name: string, email: string): Promise<User> {
    const createdUsers = await this.userModel.create([{ name, email }]);
    return createdUsers[0]; // Mongoose save array returns array
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
