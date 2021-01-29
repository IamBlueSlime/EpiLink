import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client, Intents } from 'discord.js';

import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config.module';
import { Configuration } from './configuration';
import { AppController } from './controllers/app.controller';
import { UserEntity } from './entities/user.entity';
import { AddUserEntity1609932504067 } from './migrations/1609932504067-add-user-entity';
import { DiscordService } from './services/discord.service';
import { TokenService } from './services/token.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configuration: Configuration) => ({
        type: 'postgres',
        host: configuration.databaseHost,
        port: configuration.databasePort,
        username: configuration.databaseUsername,
        password: configuration.databasePassword,
        database: configuration.databaseName,
        entities: [UserEntity],
        synchronize: false,
        migrationsRun: true,
        migrationsTransactionMode: 'all',
        migrations: [AddUserEntity1609932504067],
      }),
      inject: [Configuration],
    }),
    TypeOrmModule.forFeature([UserEntity]),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    DiscordService,
    TokenService,
    {
      provide: Client,
      useFactory: async (configuration: Configuration) => {
        const intents = new Intents([Intents.NON_PRIVILEGED, 'GUILD_MEMBERS']);
        const client = new Client({ ws: { intents } });

        await client.login(configuration.discordToken);
        return client;
      },
      inject: [Configuration],
    },
  ],
})
export class AppModule {}
