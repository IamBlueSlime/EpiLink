import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client, Guild, GuildMember, Message, User } from 'discord.js';
import { Repository } from 'typeorm';

import { CommandService } from '../commands/command.service';
import { Configuration, DataConfiguration } from '../configuration';
import { UserEntity } from '../data/entities/user.entity';
import { TokenPayload } from './token.service';

@Injectable()
export class DiscordService {
  constructor(
    private readonly client: Client,
    private readonly configuration: Configuration,
    private readonly dataConfiguration: DataConfiguration,
    private readonly commandService: CommandService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    client.on('guildMemberAdd', (guildMember) => {
      void this.onGuildMemberAdd(guildMember);
    });

    client.on('message', (message) => {
      void this.onMessage(message);
    });
  }

  private onGuildMemberAdd(guildMember: GuildMember) {
    const guild = guildMember.guild;

    return this.userRepository
      .findOne({
        discordId: guildMember.id,
      })
      .then(async (user) => {
        if (user) {
          await this.addCertifiedRoleTo(guild, guildMember);
          await guildMember.send(`
            Vous avez été automatiquement certifié sur le serveur ${guild.name}
            parce que vous avez déjà vérifié votre identité. Vous êtes connecté
            en tant que ${user.microsoftLogin}.
          `);
        } else {
          await guildMember.send(`
            Bienvenue sur le serveur ${guild.name}. Votre compte Discord n'a pas
            encore été lié à votre compte Microsoft Epitech. Rendez-vous sur
            ${this.configuration.publicHost}/link pour lier votre compte.
          `);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }

  private async onMessage(message: Message): Promise<void> {
    if (message.author.id === this.client.user.id) return;
    const args = message.content.split(' ');

    if (!args[0].startsWith('!')) return;

    const commandName = args[0].substr(1);
    args.shift();

    const command = this.commandService.commands[commandName];

    try {
      this.getServerConfigForGuild(message.guild);
    } catch (err) {
      await message.react('✍️').then(() => message.react('❌'));
      return;
    }

    if (
      command &&
      command.channelType === message.channel.type &&
      (!command.adminOnly ||
        this.isUserAdministrator(message.guild, message.member))
    ) {
      if (await command.handle(this.client, message, args))
        await message.react('👌');
      else await message.react('🤔');
    }
  }

  async setUserDiscordId(
    token: TokenPayload,
    discordId: string,
  ): Promise<void> {
    return this.userRepository
      .findOne({
        microsoftId: token.microsoftId,
        microsoftLogin: token.microsoftLogin,
      })
      .then(async (userEntity) => {
        if (!userEntity) throw new Error('User not found');

        if (userEntity.discordId) {
          await this.removeCertifiedRoleEverywhere(userEntity.discordId);
        }

        userEntity.discordId = discordId;
        await this.userRepository.save(userEntity);
      });
  }

  async addCertifiedRoleEverywhereTo(user: User): Promise<void> {
    await Promise.all(
      this.dataConfiguration.servers.map(async (serverConfig) => {
        const guild = this.client.guilds.cache.get(serverConfig.id);
        return guild.members
          .fetch(user)
          .then((guildMember) =>
            guildMember.roles.add(serverConfig.certifiedRoleId),
          )
          .catch(() => {});
      }),
    );
  }

  async addCertifiedRoleTo(
    guild: Guild,
    guildMember: GuildMember,
  ): Promise<void> {
    const serverConfig = this.getServerConfigForGuild(guild);
    await guildMember.roles.add(serverConfig.certifiedRoleId);
  }

  async removeCertifiedRoleEverywhere(discordId: string): Promise<void> {
    await Promise.all(
      this.dataConfiguration.servers.map(async (serverConfig) => {
        const guild = this.client.guilds.cache.get(serverConfig.id);
        return this.client.users
          .fetch(discordId)
          .then((user) => guild.members.fetch(user))
          .then((guildMember) =>
            guildMember.roles.remove(serverConfig.certifiedRoleId),
          )
          .catch(() => {});
      }),
    );
  }

  async removeCertifiedRoleTo(
    guild: Guild,
    guildMember: GuildMember,
  ): Promise<void> {
    const serverConfig = this.getServerConfigForGuild(guild);
    await guildMember.roles.remove(serverConfig.certifiedRoleId);
  }

  listVocalMembers(
    guild: Guild,
    channelId?: string | null,
  ): [string, string, GuildMember[]][] {
    const channels = channelId
      ? [guild.channels.resolve(channelId)]
      : guild.channels.cache
          .filter((channel) => channel.type === 'voice')
          .array();

    return channels.map((channel) => {
      return [channel.id, channel.name, channel.members.array()];
    });
  }

  isUserAdministrator(guild: Guild, guildMember: GuildMember): boolean {
    const serverConfig = this.getServerConfigForGuild(guild);

    if (guildMember.id in this.dataConfiguration.admins) return true;

    return serverConfig.adminRoleIds.some((roleId) =>
      guildMember.roles.cache.has(roleId),
    );
  }

  getServerConfigForGuild(guild: Guild): DataConfiguration['servers'][0] {
    const found = this.dataConfiguration.servers.find(
      (server) => server.id === guild.id,
    );

    if (!found)
      throw new Error('This server is not registered to be used with EpiLink');

    return found;
  }
}
