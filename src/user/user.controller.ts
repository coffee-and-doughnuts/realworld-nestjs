import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateDto, ResponseDto, LogInDto } from './user.dto';
import {UserResponse} from './user.response'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body('user') body: CreateDto): Promise<UserResponse> {
    const userResult = await this.userService.create(body);
    const response  = userResult.match({
      ok: (res) => new UserResponse(res),
      err: (err) => {
        throw new Error(err);
      },
    });

    return response
  }

  @Post('login')
  async login(@Body('user') body: LogInDto): Promise<UserResponse> {
    const userResult = await this.userService.login(body);
    const response = userResult.match({
      ok: (res) => new UserResponse(res),
      err: (err) => {
        throw new Error(err);
      },
    });

    return response;
  }
}
