import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { AzureAdAuthGuard } from '../auth/azuread.guard';
import { UserEntity } from '../data/entities/user.entity';
import { TokenService } from '../services/token.service';

@Controller()
export class AppController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('link')
  @HttpCode(HttpStatus.MOVED_PERMANENTLY)
  @UseGuards(AzureAdAuthGuard)
  link() {}

  @Get('link/callback')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AzureAdAuthGuard)
  async linkCallback(@Req() request: Request): Promise<string> {
    const user = request.user as UserEntity;

    const token = await this.tokenService.encodeToken({
      microsoftId: user.microsoftId,
      microsoftLogin: user.microsoftLogin,
    });

    return `
      <html>
        <head>
            <title>EpiLink</title>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
        </head>

        <body>
            <p>Envoyez la commande suivante au bot pour lier votre compte :</p>
            <code>!auth ${token}</code>
        </body>
      </html>
    `;
  }
}
