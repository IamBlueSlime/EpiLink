import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '../data/entities/user.entity';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    super();
  }

  serializeUser(
    user: UserEntity,
    done: (err: Error | null, user: string) => void,
  ): void {
    done(null, user.uuid);
  }

  deserializeUser(
    uuid: string,
    done: (err: Error | null, payload?: UserEntity) => void,
  ): void {
    this.userRepository
      .findOne({
        uuid,
      })
      .then((user) => done(null, user))
      .catch((error) => done(error));
  }
}
