import { Client, Message } from 'discord.js';
import { Repository } from 'typeorm';

import { Configuration } from '../configuration';
import { UserEntity } from '../entities/user.entity';
import { DiscordService } from '../services/discord.service';
import { Command } from './command';

export class WhoIsCommand extends Command {
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
    if (args.length !== 1) {
      await message.reply(`Usage : !whois <user>`);
      return false;
    }

    await this.userRepository
      .findOne({
        discordId: message.mentions.users.first().id,
      })
      .then(async (userEntity) => {
        if (userEntity) {
          await message.reply(
            `Le login de l'utilisateur mentionné est ${userEntity.microsoftLogin}.`,
          );
        } else {
          await message.reply('Utilisateur inconnu.');
        }
      })
      .catch(async (err) => {
        console.error(err);
        await message.react('😢');
        await message.reply('Une erreur est survenue :(');
      });

    return true;
  }
}
