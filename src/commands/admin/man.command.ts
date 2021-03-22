import { Injectable } from '@nestjs/common';
import { default as axios } from 'axios';
import * as cheerio from 'cheerio';
import { Client, Message, MessageEmbed } from 'discord.js';

import { Command } from '../command';

// eslint-disable-next-line sonarjs/no-duplicate-string
const partNames = ['Name', 'Synopsis', 'Description', 'Return Value'];

interface ManPage {
  url: string;
  title: string;
  name: string;
  synopsis: string;
  description: string;
  returnValue: string;
}

async function fetchManPage(section: string, func: string): Promise<ManPage> {
  const url = `https://linux.die.net/man/${section}/${func}`;
  const $ = await axios.get<string>(url).then((res) => cheerio.load(res.data));

  const title = $('h1').text();

  let content = $('#content').text();
  content = content.substr(0, content.indexOf('Errors'));
  const contentLines = content.split('\n').filter((line) => line.length > 0);

  const parts = {};
  let currentPart = null;
  let currentValue = '';
  const fold = (newPart = null) => {
    if (currentPart != null) parts[currentPart] = currentValue;
    currentPart = newPart;
    currentValue = '';
  };

  contentLines.forEach((line) => {
    if (partNames.includes(line)) {
      fold(line);
      return;
    }

    currentValue += `${line}\n`;
  });
  fold();

  return {
    url,
    title,
    name: parts['Name'],
    synopsis: parts['Synopsis'],
    description: parts['Description'],
    returnValue: parts['Return Value'],
  };
}

@Injectable()
export class ManCommand extends Command {
  readonly name = 'man';
  readonly channelType = 'text';
  readonly adminOnly = true;

  async handle(
    client: Client,
    message: Message,
    args: string[],
  ): Promise<boolean> {
    if (args.length !== 2) {
      await message.reply(`Usage : !man <section> <name>`);
      return false;
    }

    const section = args[0];
    const func = args[1];
    const manPage = await fetchManPage(section, func);

    await message.channel.send(
      new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(manPage.title)
        .setDescription(manPage.name)
        .addField('Synopsis', manPage.synopsis)
        .addField('Descripton', manPage.description)
        .addField('Return Value', manPage.returnValue)
        .setURL(manPage.url)
        .setAuthor('Man (Linux Die)', null, 'https://linux.die.net/'),
    );

    return true;
  }
}
