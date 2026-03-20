import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";

import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port: number = 3000;

  await app.listen(port);
  Logger.log(`🚀 Rest client example app running on http://localhost:${port}`);
  Logger.log(`📡 Make sure json-server is running: npm run start:mock`);
}

bootstrap();
