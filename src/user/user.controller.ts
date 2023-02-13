import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { UnprocessableEntityError } from '../../src/share/errors';
import { AuthGuard } from './auth/auth.guard';
import { User } from './user.decorator';
import {
  UserCreateDto,
  UserLogInDto,
  UserResponseDto,
  UserRO,
  UserUpdateDto,
} from './user.dto';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users')
  async registrate(@Body('user') createReq: UserCreateDto): Promise<UserRO> {
    const user = (await this.userService.create(createReq)).match({
      ok: (user) => this.formatResponse(user),
      err: (error) => {
        throw error;
      },
    });

    return user;
  }

  @Post('users/login')
  async authenticate(@Body('user') loginReq: UserLogInDto): Promise<UserRO> {
    const user = (await this.userService.login(loginReq)).match({
      ok: (user) => this.formatResponse(user),
      err: (error) => {
        throw error;
      },
    });

    return user;
  }

  @Get('user')
  @UseGuards(new AuthGuard())
  async getCurrent(@User('id') id: number): Promise<UserRO> {
    if (!id) {
      throw new UnprocessableEntityError({ id: ['wrong id is given'] });
    }

    const user = (await this.userService.findOneById(id)).match({
      ok: (user) => this.formatResponse(user),
      err: (error) => {
        throw error;
      },
    });

    return user;
  }

  @Put('user')
  @UseGuards(new AuthGuard())
  async update(
    @User('id') id: number,
    @Body('user') updateDto: UserUpdateDto,
  ): Promise<UserRO> {
    if (!id) {
      throw new UnprocessableEntityError({ id: ['wrong id is given'] });
    }

    const updatedUser = (
      await this.userService.updateById(id, updateDto)
    ).match({
      ok: (user) => this.formatResponse(user),
      err: (error) => {
        throw error;
      },
    });

    return updatedUser;
  }

  private formatResponse(user: UserResponseDto): UserRO {
    return { user };
  }
}
