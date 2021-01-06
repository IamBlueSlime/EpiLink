import { Injectable, OnModuleInit } from '@nestjs/common';
import { promises as fsPromises } from 'fs';
import { sign, Algorithm, verify } from 'jsonwebtoken';

import { Configuration } from '../configuration';

export interface TokenPayload {
  microsoftId: string;
  microsoftLogin: string;
}

@Injectable()
export class TokenService implements OnModuleInit {
  private privateKey: string;
  private publicKey: string;

  constructor(private readonly configuration: Configuration) {}

  async encodeToken(payload: TokenPayload): Promise<string> {
    return new Promise((resolve, reject) => {
      sign(
        payload,
        this.privateKey,
        {
          algorithm: this.configuration.jwtAlgorithm as Algorithm,
        },
        (err, token) => {
          if (err) return reject(err);
          return resolve(token);
        },
      );
    });
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    return new Promise((resolve, reject) => {
      verify(
        token,
        this.publicKey,
        {
          algorithms: [this.configuration.jwtAlgorithm as Algorithm],
        },
        (err, decoded) => {
          if (err) return reject(err);
          return resolve(decoded as TokenPayload);
        },
      );
    });
  }

  async onModuleInit(): Promise<void> {
    this.privateKey = await fsPromises.readFile(
      this.configuration.jwtPrivateKeyPath,
      'utf8',
    );

    this.publicKey = await fsPromises.readFile(
      this.configuration.jwtPublicKeyPath,
      'utf8',
    );
  }
}
