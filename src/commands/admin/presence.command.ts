import { InjectRepository } from '@nestjs/typeorm';
import { format } from 'date-fns';
import { Client, Message, MessageAttachment } from 'discord.js';
import { In, Repository } from 'typeorm';

import { UserEntity } from '../../data/entities/user.entity';
import { Command } from '../command';

export class PresenceCommand extends Command {
  readonly name = 'presence';
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
    if (args.length !== 1) {
      await message.reply(`Usage : !presence <channel id>`);
      return false;
    }

    const channelId = args[0];
    const channels =
      channelId === 'global'
        ? message.guild.channels.cache
            .filter((channel) => channel.type === 'voice')
            .array()
        : [message.guild.channels.resolve(channelId)];

    const memberIds = channels.reduce((acc: string[], current) => {
      acc.push(...current.members.mapValues((member) => member.id).array());
      return acc;
    }, []);

    const memberLogins = await this.userRepository
      .find({
        discordId: In(memberIds),
      })
      .then((userEntities) =>
        userEntities.map((userEntity) => userEntity.microsoftLogin),
      );

    const csvData = [['login'], ...memberLogins.map((login) => [login])]
      .map((line) => line.join(','))
      .join('\n');

    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');

    await message.reply(
      new MessageAttachment(
        Buffer.from(csvData, 'utf8'),
        `presence_${timestamp}_${channelId}.csv`,
      ),
    );

    return true;
  }
}
