import { Transform, Type } from 'class-transformer';
import { IsString, IsNotEmpty, Min, ValidateNested } from 'class-validator';

export class DataServerConfiguration {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  certifiedRoleId: string;

  @IsString()
  @IsNotEmpty()
  vocalTimeChannelId: string;

  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  adminRoleIds: string[];
}

export class DataConfiguration {
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  admins: string[];

  @ValidateNested({ each: true })
  @Type(() => DataServerConfiguration)
  servers: DataServerConfiguration[];
}

export class Configuration {
  @IsString()
  @IsNotEmpty()
  host: string;

  @Min(0)
  @Transform(({ value }) => parseInt(value))
  port: number;

  @IsString()
  @IsNotEmpty()
  publicHost: string;

  @IsString()
  @IsNotEmpty()
  databaseHost: string;

  @Min(0)
  @Transform(({ value }) => parseInt(value))
  databasePort: number;

  @IsString()
  @IsNotEmpty()
  databaseUsername: string;

  @IsString()
  @IsNotEmpty()
  databasePassword: string;

  @IsString()
  @IsNotEmpty()
  databaseName: string;

  @IsString()
  @IsNotEmpty()
  discordToken: string;

  @IsString()
  @IsNotEmpty()
  jwtPrivateKeyPath: string;

  @IsString()
  @IsNotEmpty()
  jwtPublicKeyPath: string;

  @IsString()
  @IsNotEmpty()
  jwtAlgorithm: string;

  @IsString()
  @IsNotEmpty()
  azureAdTenant: string;

  @IsString()
  @IsNotEmpty()
  azureAdClientId: string;

  @IsString()
  @IsNotEmpty()
  azureAdClientSecret: string;
}
