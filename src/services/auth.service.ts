import { ConfidentialClientApplication } from '@azure/msal-node';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Configuration } from '../configuration';
import { UserEntity } from '../data/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly configuration: Configuration,
    private readonly azureApp: ConfidentialClientApplication,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  getLoginUri(): Promise<string> {
    return this.azureApp.getAuthCodeUrl({
      scopes: ['user.read'],
      redirectUri: `${this.configuration.publicHost}/link/callback`,
    });
  }

  getUser(code: string): Promise<UserEntity> {
    // eslint-disable-next-line
    return this.azureApp
      .acquireTokenByCode({
        scopes: ['user.read'],
        redirectUri: `${this.configuration.publicHost}/link/callback`,
        code,
      })
      .then((res) => {
        return this.userRepository
          .findOne({
            microsoftId: res.account.localAccountId,
            microsoftLogin: res.account.username,
          })
          .then((user) => {
            if (!user) {
              console.log(`Creating new user ${res.account.username}`);

              const newUser = new UserEntity({
                microsoftId: res.account.localAccountId,
                microsoftLogin: res.account.username,
              });

              return this.userRepository.save(newUser);
            }

            return user;
          });
      });
  }
}
