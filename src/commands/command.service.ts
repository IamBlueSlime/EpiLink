import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

import { Command } from './command';

@Injectable()
export class CommandService implements OnModuleInit {
  readonly commands: Record<string, Command> = {};

  constructor(
    private readonly discoveryService: DiscoveryService,
    @Optional()
    private readonly logger: Logger = new Logger(new.target.name, true),
  ) {}

  onModuleInit(): void {
    this.discoveryService
      .getProviders()
      .filter((wrapper: InstanceWrapper) => wrapper.instance instanceof Command)
      .map(({ instance }) => instance as Command)
      .forEach((command) => {
        this.commands[command.name] = command;
        this.logger.log(`Registered {!${command.name}} command`);
      });
  }
}
