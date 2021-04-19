import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { IProfile, OIDCStrategy } from 'passport-azure-ad';
import { Repository } from 'typeorm';

import { Configuration } from '../configuration';
import { UserEntity } from '../data/entities/user.entity';

@Injectable()
export class AzureAdStrategy extends PassportStrategy(OIDCStrategy, 'azuread') {
  constructor(
    readonly configuration: Configuration,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    super({
      identityMetadata: `https://login.microsoftonline.com/${configuration.azureAdTenant}/v2.0/.well-known/openid-configuration`,
      clientID: configuration.azureAdClientId,
      responseType: 'code',
      responseMode: 'query',
      redirectUrl: `${configuration.publicHost}/link/callback`,
      allowHttpForRedirectUrl: configuration.publicHost.startsWith('http://'),
      clientSecret: configuration.azureAdClientSecret,
      useCookieInsteadOfSession: false,
      scope: ['email', 'profile'],
      passReqToCallback: false,
    });
  }

  validate(_iss: string, _sub: string, profile: IProfile): Promise<UserEntity> {
    console.log('validate', profile);
    if (profile.emails && profile.emails.length > 0) {
      return this.getUser(profile.oid, profile.emails[0]);
    } else if (profile._json.email) {
      return this.getUser(profile.oid, profile._json.email);
    }

    throw new UnprocessableEntityException('No email found in Azure profile');
  }

  private getUser(id: string, login: string): Promise<UserEntity> {
    console.log('get', id, login);
    return this.userRepository
      .findOne({
        microsoftId: id,
        microsoftLogin: login,
      })
      .then((user) => {
        if (!user) {
          console.log(`Creating new user ${login}`);

          const newUser = new UserEntity({
            microsoftId: id,
            microsoftLogin: login,
          });

          return this.userRepository.save(newUser);
        }

        return user;
      });
  }
}
