import { IsEmail, IsString } from 'class-validator';
import { User } from './user.entity';
import { hashPassword } from './user.util';

export class CreateDto {
  @IsString()
  readonly username: string;

  @IsString()
  readonly password: string;

  @IsEmail()
  readonly email: string;

  async toUser(): Promise<User> {
    const user = new User();
    user.email = this.email;
    user.username = this.username;
    user.email = this.email;
    user.hashedPassword = await hashPassword(this.password);
    return user;
  }
}

export class ResponseDto {
  @IsEmail()
  readonly email: string;
  readonly username: string;
  readonly bio: string;
  readonly image: string;
  readonly token: string;

  private constructor(
    email: string,
    username: string,
    bio: string,
    image: string,
    token: string,
  ) {
    this.email = email;
    this.username = username;
    this.bio = bio;
    this.image = image;
    this.token = token;
  }

  static fromUser(
    user: User,
    token: string
  ): ResponseDto {

    const responseDto = new ResponseDto(
      user.email,
      user.username,
      user.bio,
      user.image,
      token,
    );

    return responseDto;
  }
}

export class LogInDto {
  @IsString()
  readonly email: string;

  @IsString()
  readonly password: string;
}
