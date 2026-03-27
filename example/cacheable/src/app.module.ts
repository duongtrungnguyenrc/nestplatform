import { Module } from "@nestjs/common";
import { CacheableModule } from "@nestplatform/cacheable";
import { ProductService } from "./product.service";
import { ProductController } from "./product.controller";
import { ConfigModule, ConfigService } from "@nestjs/config";
import KeyvPostgres from "@keyv/postgres";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    CacheableModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.getOrThrow<string>("DB_HOST");
        const port = configService.getOrThrow<number>("DB_PORT");
        const user = configService.getOrThrow<string>("DB_USERNAME");
        const pass = configService.getOrThrow<string>("DB_PASSWORD");
        const db = configService.getOrThrow<string>("DB_DATABASE");

        return {
          ttl: 6000 * 5,
          isGlobal: true,
          stores: [
            new KeyvPostgres({
              uri: `postgresql://${user}:${pass}@${host}:${port}/${db}`,
              schema: "public",
              table: "cache",
            }),
          ],
        };
      },
    }),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class AppModule {}
