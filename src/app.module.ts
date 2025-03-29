import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products/products.service';
import { ProductsController } from './products/products.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { ProductsModule } from './products/products.module';

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
    }),
    ProductsModule, // <-- Importa ProductsModule (contiene TypeOrm.forFeature)
    SeedModule,     // <-- Importa SeedModule (que a su vez importa ProductsModule)
    CommonModule,
  ],
  // Elimina providers y controllers que pertenecen a otros módulos
})
export class AppModule {}