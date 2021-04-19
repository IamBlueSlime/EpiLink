import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AzureAdAuthGuard extends AuthGuard('azuread') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('guard');
    const request = context.switchToHttp().getRequest();
    console.log(request.session);
    const can = await super.canActivate(context);
    console.log('guard can', can);

    if (can) {
      const request = context.switchToHttp().getRequest();
      void super.logIn(request);
    }

    return true;
  }
}
