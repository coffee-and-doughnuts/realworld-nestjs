import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Err, Ok, Result } from '@sniptt/monads/build';
import { hash, verify } from 'argon2';
import { Repository } from 'typeorm';
import { UnprocessableEntityError } from '../share/errors';
import {
  UserCreateDto,
  UserLogInDto,
  UserResponseDto,
  UserTokenDto,
  UserUpdateDto,
} from './user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(
    dto: UserCreateDto,
  ): Promise<Result<UserResponseDto, UnprocessableEntityError>> {
    const existUser = await this.userRepository.findOne({
      where: [
        { username: dto.username.toLowerCase() },
        { email: dto.email.toLowerCase() },
      ],
    });

    if (existUser) {
      let errors = {};
      if (existUser.username == dto.username) {
        errors['username'] = ['must be unique'];
      }

      if (existUser.email == dto.email) {
        errors['email'] = ['must be unique'];
      }
      return Err(new UnprocessableEntityError(errors));
    }

    const hashedPassword = await this.hashPassword(dto.password);
    const newUser = User.build({
      ...dto,
      hashedPassword,
    });

    // TODO: validate user

    const savedUser = await this.userRepository.save(newUser);
    const signedResponse = await this.signUser(savedUser);
    return Ok(signedResponse);
  }

  async login(
    dto: UserLogInDto,
  ): Promise<Result<UserResponseDto, UnprocessableEntityError>> {
    const existUser = await this.userRepository.findOneBy({
      email: dto.email,
    });

    if (!existUser) {
      return Err(
        new UnprocessableEntityError({
          email: ['not found'],
        }),
      );
    }

    if (!(await verify(existUser.hashedPassword, dto.password))) {
      return Err(
        new UnprocessableEntityError({
          email: ['not correct'],
          password: ['not correct'],
        }),
      );
    }

    return Ok(await this.signUser(existUser));
  }

  async findOneById(
    id: number,
  ): Promise<Result<UserResponseDto, UnprocessableEntityError>> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      return Err(new UnprocessableEntityError({ user: ['can not be found'] }));
    }

    return Ok(await this.signUser(user));
  }

  async updateById(
    id: number,
    params: UserUpdateDto,
  ): Promise<Result<UserResponseDto, UnprocessableEntityError>> {
    // should find first. `update` method does not check if entity exsit.
    const origin = await this.userRepository.findOneBy({ id });

    if (!origin) {
      return Err(new UnprocessableEntityError({ user: ['can not be found'] }));
    }

    let hashedPassword;
    if (params.password) {
      hashedPassword = await hash(params.password);
    }

    await this.userRepository.update(id, {
      username: params.username,
      email: params.email,
      bio: params.bio,
      image: params.image,
      hashedPassword,
    });

    const updated = await this.userRepository.findOneBy({ id });

    return Ok(await this.signUser(updated));
  }

  private async signUser(user: User): Promise<UserResponseDto> {
    const content: UserTokenDto = {
      id: user.id,
    };

    const token = await this.jwtService.signAsync(content);

    return {
      email: user.email,
      username: user.username,
      bio: user.bio,
      image: user.image,
      token,
    };
  }

  private async hashPassword(origin: string): Promise<string> {
    return hash(origin);
  }
}
