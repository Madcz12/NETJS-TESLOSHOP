import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]) // Clave Registra los repositorios
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService, TypeOrmModule], // Exporta si otros modulos (Como SeedModule) lo necesitan
})
export class ProductsModule {}
