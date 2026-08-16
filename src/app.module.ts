import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envConfig, typeOrmConfigAsync } from './config';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
