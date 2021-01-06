import { Global, Module } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { promises as fsPromises } from 'fs';
import { camelCase } from 'lodash';

import { Configuration, DataConfiguration } from './configuration';

@Global()
@Module({
  providers: [
    {
      provide: Configuration,
      useFactory: (): Promise<Configuration> => {
        const values = Object.keys(process.env).reduce((acc, envKey) => {
          acc[camelCase(envKey)] = process.env[envKey];
          return acc;
        }, {});

        const config = plainToClass(Configuration, values);

        return validate(config, {
          whitelist: true,
        }).then((errors) => {
          if (errors.length > 0) {
            console.error(errors);
            process.exit(1);
          }

          return config;
        });
      },
    },
    {
      provide: DataConfiguration,
      useFactory: (): Promise<DataConfiguration> => {
        return (
          fsPromises
            .readFile('data.json', 'utf8')
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            .then((content) => JSON.parse(content))
            .then((dataConfigJson) =>
              plainToClass(DataConfiguration, dataConfigJson),
            )
            .then((dataConfig) =>
              validate(dataConfig, {
                whitelist: true,
              }).then((errors) => {
                if (errors.length > 0) {
                  console.error(errors);
                  process.exit(1);
                }

                return dataConfig;
              }),
            )
        );
      },
    },
  ],
  exports: [Configuration, DataConfiguration],
})
export class ConfigModule {}
