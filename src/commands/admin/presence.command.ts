import { InjectRepository } from '@nestjs/typeorm';
import { format } from 'date-fns';
import { Client, Message, MessageAttachment } from 'discord.js';
import { In, Repository } from 'typeorm';

import { UserEntity } from '../../data/entities/user.entity';
import { DiscordService } from '../../services/discord.service';
import { Command } from '../command';

export class PresenceCommand extends Command {
  readonly name = 'presence';
  readonly channelType = 'text';
  readonly adminOnly = true;

  constructor(
    private readonly discordService: DiscordService,
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
    const vocalList = this.discordService.listVocalMembersFlatten(
      message.guild,
      channelId === 'global' ? null : channelId,
    );

    const memberLoginsMap: [
      id: string,
      login: string,
    ][] = await this.userRepository
      .find({
        discordId: In(vocalList.map((entry) => entry[2].id)),
      })
      .then((userEntities) =>
        userEntities.map(
          (userEntity) => [userEntity.discordId, userEntity.microsoftLogin],
          [],
        ),
      );

    const csvData = [
      ['channel_id', 'channel_name', 'login'],
      ...memberLoginsMap.map((memberLogin) => {
        const foundVocalListEntry = vocalList.find(
          (entry) => entry[2].id === memberLogin[0],
        );
        return [foundVocalListEntry[0], foundVocalListEntry[1], memberLogin[1]];
      }),
    ]
      .map((line) => line.join(','))
      .join('\n');

    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');

    await message.reply(
      new MessageAttachment(
        Buffer.from(csvData, 'utf8'),
        `presence_${timestamp}_${channelId}.csv`,
      ),
    );

    const memberDelta = flatVocalList.length - memberLoginsMap.length;
    if (memberDelta > 0) {
      await message.reply(
        `${memberDelta} personnes sont absentes du rapport, n'étant pas certifiées.`,
      );
    }

    return true;
  }
}
