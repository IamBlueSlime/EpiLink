import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client, Message } from 'discord.js';
import { Repository } from 'typeorm';

import { UserEntity } from '../../data/entities/user.entity';
import { Command } from '../command';

@Injectable()
export class WhoIsCommand extends Command {
  readonly name = 'whois';
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
