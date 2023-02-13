import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UnprocessableEntityError } from '../../src/share/errors';
import { UserTokenDto } from './user.dto';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const user: UserTokenDto = request['user'];
    const result = data ? user?.[data] : user;

    if (!result) {
      throw new UnprocessableEntityError({ user: ['can not found user'] });
    }

    return result;
  },
);
