import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { CatalogService } from './catalog.service';
import { CategoriesController } from './categories.controller';
import { ProductsController } from './products.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [CategoriesController, ProductsController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
