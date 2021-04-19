import { AuthGuard } from '@nestjs/passport';

export const AzureAdAuthGuard = AuthGuard('azuread');
