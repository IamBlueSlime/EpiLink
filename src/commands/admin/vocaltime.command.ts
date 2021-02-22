import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { format, subDays } from 'date-fns';
import { Client, Message, MessageAttachment, TextChannel } from 'discord.js';
import { In, Repository } from 'typeorm';

import { UserEntity } from '../../data/entities/user.entity';
import { DiscordService } from '../../services/discord.service';
import { Command } from '../command';

export class VocalTimeCommand extends Command {
  readonly name = 'vocaltime';
  readonly channelType = 'text';
  readonly adminOnly = true;

  constructor(
    private readonly client: Client,
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
      await message.reply(`Usage : !vocaltime <dump>`);
      return false;
    }

    const subCommand = args[0];

    if (message.channel.type === 'text' && subCommand === 'dump') {
      await this.dumpVocalTimes(message.channel);
    } else {
      return false;
    }

    return true;
  }

  @Cron('0 0,30 * * * *')
  async increaseVocalTimes(): Promise<void> {
    await Promise.all(
      this.client.guilds.cache.map((guild) => {
        const vocalMembers = this.discordService.listVocalMembers(guild);
        return this.userRepository.increment(
          {
            discordId: In(vocalMembers.map((member) => member.id)),
          },
          'vocal_time',
          30,
        );
      }),
    );
  }

  @Cron('0 0 9 * * *')
  async resetVocalTimes(): Promise<void> {
    await Promise.all(
      this.client.guilds.cache.map((guild) => {
        const channelId = this.discordService.getServerConfigForGuild(guild)
          .vocalTimeChannelId;

        return this.dumpVocalTimes(
          guild.channels.resolve(channelId) as TextChannel,
        );
      }),
    );

    await this.userRepository.update(
      {},
      {
        voiceTime: 0,
      },
    );
  }

  private async dumpVocalTimes(channel: TextChannel): Promise<void> {
    const entries: [
      login: string,
      vocalTime: number,
    ][] = await this.userRepository
      .find()
      .then((userEntities) =>
        userEntities.map((userEntity) => [
          userEntity.microsoftLogin,
          userEntity.voiceTime,
        ]),
      );

    const csvData = [['login', 'vocalTime'], ...entries]
      .map((line) => line.join(','))
      .join('\n');

    const today = new Date();
    const timestamp = format(today, 'yyyy-MM-dd_HH-mm-ss');

    await channel.send(
      `Temps vocaux du ${format(subDays(today, 1), 'yyyy-MM-dd')} :`,
    );
    await channel.send(
      new MessageAttachment(
        Buffer.from(csvData, 'utf8'),
        `vocal_times_${timestamp}.csv`,
      ),
    );
  }
}
