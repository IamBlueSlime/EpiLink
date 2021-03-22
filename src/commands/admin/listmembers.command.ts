import { InjectRepository } from '@nestjs/typeorm';
import { format } from 'date-fns';
import { Client, Message, MessageAttachment } from 'discord.js';
import { In, Repository } from 'typeorm';

import { UserEntity } from '../../data/entities/user.entity';
import { Command } from '../command';

export class ListMembersCommand extends Command {
  readonly name = 'listmembers';
  readonly channelType = 'text';
  readonly adminOnly = true;

  constructor(
    @InjectRepository(UserEntity)
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
      await message.reply(`Usage : !listmembers`);
      return false;
    }

    await message.react('⌛');

    const guild = message.guild;
    const guildMembers = await guild.members.fetch();
    const databaseEntities = await this.userRepository.find({
      discordId: In(guildMembers.map((guildMember) => guildMember.id)),
    });

    const csvData = [
      ['discord_id', 'discord_name', 'microsoft_login', 'roles'],
      ...guildMembers.map((member) => {
        const databaseEntity = databaseEntities.find(
          (entity) => entity.discordId === member.id,
        );
        return [
          member.id,
          member.nickname,
          databaseEntity ? databaseEntity.microsoftLogin : 'N/A',
          member.roles.cache
            .mapValues((role) => role.name)
            .array()
            .join(', '),
        ];
      }),
    ]
      .map((line) => line.join(','))
      .join('\n');

    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');

    await message.reply(
      new MessageAttachment(
        Buffer.from(csvData, 'utf8'),
        `members_${timestamp}.csv`,
      ),
    );

    return true;
  }
}
