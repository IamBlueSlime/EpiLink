import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '../data/entities/user.entity';
import { AzureAdStrategy } from './azuread.strategy';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [
    PassportModule.register({ session: true }),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  providers: [AzureAdStrategy, SessionSerializer],
})
export class AuthModule {}
