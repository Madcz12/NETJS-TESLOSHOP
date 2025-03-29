import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [ProductsModule],
  controllers: [SeedController],
  providers: [SeedService],
  // todo lo que llegue la palabra module va en los imports

})
export class SeedModule {}
