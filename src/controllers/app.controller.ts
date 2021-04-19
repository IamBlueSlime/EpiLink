import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

@Controller()
export class AppController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Get('link')
  @HttpCode(HttpStatus.MOVED_PERMANENTLY)
  async link(@Res() res: Response) {
    res.redirect(await this.authService.getLoginUri());
  }

  @Get('link/callback')
  @HttpCode(HttpStatus.OK)
  async linkCallback(@Req() request: Request): Promise<string> {
    const user = await this.authService.getUser(request.query.code as string);

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
