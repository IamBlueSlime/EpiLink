import { Injectable } from '@nestjs/common';
import { Client, Message } from 'discord.js';

import { Configuration } from '../../configuration';
import { DiscordService } from '../../services/discord.service';
import { TokenService } from '../../services/token.service';
import { Command } from '../command';

@Injectable()
export class AuthCommand extends Command {
  readonly name = 'auth';
  readonly channelType = 'dm';
  readonly adminOnly = false;

  constructor(
    private readonly configuration: Configuration,
    private readonly discordService: DiscordService,
    private readonly tokenService: TokenService,
  ) {
    super();
  }

  async handle(
    client: Client,
    message: Message,
    args: string[],
  ): Promise<boolean> {
    if (args.length !== 1) {
      await message.reply(
        `Pour lier votre compte, rendez-vous sur ${this.configuration.publicHost}/link.`,
      );
      return false;
    }

    await this.tokenService
      .verifyToken(args[0])
      .then(async (payload) => {
        await this.discordService.setUserDiscordId(payload, message.author.id);
        await this.discordService.addCertifiedRoleEverywhereTo(message.author);
      })
      .catch(async (err) => {
        console.error(err);
        await message.react('😢');
        await message.reply('Une erreur est survenue :(');
      });

    return true;
  }
}
