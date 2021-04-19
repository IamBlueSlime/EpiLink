import { ConfidentialClientApplication } from '@azure/msal-node';
import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client, Intents } from 'discord.js';

import { ListMembersCommand } from './commands/admin/listmembers.command';
import { ManCommand } from './commands/admin/man.command';
import { PresenceCommand } from './commands/admin/presence.command';
import { SyncCommand } from './commands/admin/sync.command';
import { VocalTimeCommand } from './commands/admin/vocaltime.command';
import { WhoIsCommand } from './commands/admin/whois.command';
import { CommandService } from './commands/command.service';
import { AuthCommand } from './commands/user/auth.command';
import { ConfigModule } from './config.module';
import { Configuration } from './configuration';
import { AppController } from './controllers/app.controller';
import { UserEntity } from './data/entities/user.entity';
import { AddUserEntity1609932504067 } from './data/migrations/1609932504067-add-user-entity';
import { AddVocalTimeToUser1614005249396 } from './data/migrations/1614005249396-add-vocal-time-to-user';
import { AuthService } from './services/auth.service';
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
        migrations: [
          AddUserEntity1609932504067,
          AddVocalTimeToUser1614005249396,
        ],
      }),
      inject: [Configuration],
    }),
    TypeOrmModule.forFeature([UserEntity]),
    DiscoveryModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AuthService,
    DiscordService,
    TokenService,
    {
      provide: ConfidentialClientApplication,
      useFactory: (configuration: Configuration) =>
        new ConfidentialClientApplication({
          auth: {
            authority: `https://login.microsoftonline.com/${configuration.azureAdTenant}`,
            clientId: configuration.azureAdClientId,
            clientSecret: configuration.azureAdClientSecret,
          },
        }),
      inject: [Configuration],
    },
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
    CommandService,
    AuthCommand,
    ListMembersCommand,
    ManCommand,
    PresenceCommand,
    SyncCommand,
    VocalTimeCommand,
    WhoIsCommand,
  ],
})
export class AppModule {}
