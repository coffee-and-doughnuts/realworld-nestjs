import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUrl,
} from 'class-validator';

export class UserCreateDto {
  @IsString()
  readonly username: string;

  @IsStrongPassword({
    minLength: 6,
    minLowercase: 0,
    minNumbers: 0,
    minSymbols: 0,
    minUppercase: 0,
  })
  readonly password: string;

  @IsEmail()
  readonly email: string;
}

export class UserTokenDto {
  readonly id: number;
}

export class UserResponseDto {
  readonly email: string;
  readonly username: string;
  readonly bio: string;
  readonly image: string;
  readonly token: string;
}

export class UserLogInDto {
  @IsString()
  readonly email: string;

  @IsString()
  readonly password: string;
}

export class UserRO {
  readonly user: UserResponseDto;
}

export class UserUpdateDto {
  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @IsString()
  @IsOptional()
  readonly username?: string;

  @IsStrongPassword({
    minLength: 6,
    minLowercase: 0,
    minNumbers: 0,
    minSymbols: 0,
    minUppercase: 0,
  })
  @IsOptional()
  readonly password?: string;

  @IsUrl()
  @IsOptional()
  readonly image?: string;

  @IsString()
  @IsOptional()
  readonly bio?: string;
}
