import { Document } from "mongoose";
export declare class Order extends Document {
  productName: string;
  amount: number;
  status: string;
}
export declare const OrderSchema: import("mongoose").Schema<
  Order,
  import("mongoose").Model<
    Order,
    any,
    any,
    any,
    Document<unknown, any, Order, any, {}> &
      Order &
      Required<{
        _id: import("mongoose").Types.ObjectId;
      }> & {
        __v: number;
      },
    any
  >,
  {},
  {},
  {},
  {},
  import("mongoose").DefaultSchemaOptions,
  Order,
  Document<unknown, {}, import("mongoose").FlatRecord<Order>, {}, import("mongoose").DefaultSchemaOptions> &
    import("mongoose").FlatRecord<Order> &
    Required<{
      _id: import("mongoose").Types.ObjectId;
    }> & {
      __v: number;
    }
>;
