import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import mongoose from "mongoose";

async function bootstrap() {
  mongoose.set("debug", true);
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
