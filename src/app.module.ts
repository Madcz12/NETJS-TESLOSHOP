import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './products/entities/product.entity';
import { ProductsService } from './products/products.service';
import { ProductsController } from './products/products.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { CommonModule } from './common/common.module';


@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [join(process.cwd(), 'dist/**/*.entity.js')],
        synchronize: true,
      }),
/*       type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'TesloDB',
      entities: [Product],
      synchronize: true, */
    }),
    TypeOrmModule.forFeature([Product]),
    CommonModule,
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class AppModule {}
