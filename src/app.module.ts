import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envConfig } from './config';
import { DatabaseModule } from './database/database.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { SalesModule } from './modules/sales/sales.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { UsersModule } from './modules/users/users.module';
import { VendorsModule } from './modules/vendors/vendors.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [envConfig] }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    CatalogModule,
    PromotionsModule,
    SalesModule,
    UploadsModule,
    SubscriptionsModule,
    VendorsModule,
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
