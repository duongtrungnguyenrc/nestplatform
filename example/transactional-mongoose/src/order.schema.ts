import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: "pending" })
  status: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
