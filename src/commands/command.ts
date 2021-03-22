import { Client, Message } from 'discord.js';

export abstract class Command {
  abstract readonly name: string;
  abstract readonly channelType: 'text' | 'dm' | 'news';
  abstract readonly adminOnly: boolean;

  abstract handle(
    client: Client,
    message: Message,
    args: string[],
  ): Promise<boolean>;
}
