import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfigAsync: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
    return {
      type: 'postgres',
      url: configService.get<string>('database.url'),
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production', // Evita sincronizar en producción
      ssl: {
        rejectUnauthorized: false, // Obligatorio para conectarse a Supabase
      },
    };
  },
};
