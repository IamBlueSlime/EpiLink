import { Client, Message } from 'discord.js';
import { In, Repository } from 'typeorm';

import { Configuration } from '../configuration';
import { UserEntity } from '../entities/user.entity';
import { DiscordService } from '../services/discord.service';
import { Command } from './command';

export class SyncCommand extends Command {
  readonly channelType = 'text';
  readonly adminOnly = true;

  constructor(
    private readonly configuration: Configuration,
    private readonly discordService: DiscordService,
    private readonly userRepository: Repository<UserEntity>,
  ) {
    super();
  }

  async handle(
    client: Client,
    message: Message,
    args: string[],
  ): Promise<boolean> {
    if (args.length !== 0) {
      await message.reply(`Usage : !sync`);
      return false;
    }

    const guild = message.guild;
    const guildMembers = await guild.members.fetch();
    const databaseDiscordIds = await this.userRepository
      .find({
        discordId: In(guildMembers.map((guildMember) => guildMember.id)),
      })
      .then((userEntities) =>
        userEntities.map((userEntity) => userEntity.discordId),
      );

    const alreadyWithRole = guildMembers.filter((guildMember) =>
      guildMember.roles.cache.has(
        this.discordService.getServerConfigForGuild(guild).certifiedRoleId,
      ),
    );
    const shouldNotHaveMembers = alreadyWithRole.filter(
      (guildMember) => !databaseDiscordIds.includes(guildMember.id),
    );
    const shouldHaveMembers = guildMembers
      .filter((guildMember) => !alreadyWithRole.has(guildMember.id))
      .filter((guildMember) => databaseDiscordIds.includes(guildMember.id));

    const lines = [
      `${guildMembers.size} utilisateurs sur le serveur.`,
      `${databaseDiscordIds.length} utilisateurs connectés en base de données.`,
      `${alreadyWithRole.size} utilisateurs avec le rôle Certifié.`,
      `${shouldNotHaveMembers.size} utilisateurs de devraient pas avoir le rôle Certifié.`,
      `${shouldHaveMembers.size} utilisateurs devraient avoir le rôle Certifié.`,
    ];

    await message.reply(lines.join('\n'));

    if (shouldNotHaveMembers.size > 0) {
      await message.reply(
        `Retrait du rôle Certifié aux utilisateurs non connectés...`,
      );
      await Promise.all(
        shouldNotHaveMembers.map((guildMember) =>
          this.discordService.removeCertifiedRoleTo(guild, guildMember),
        ),
      );
    }

    if (shouldHaveMembers.size > 0) {
      await message.reply(
        'Ajout du rôle Certifié aux utilisateurs connectés...',
      );
      await Promise.all(
        shouldHaveMembers.map((guildMember) =>
          this.discordService.addCertifiedRoleTo(guild, guildMember),
        ),
      );
    }

    return true;
  }
}
