import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { IncomingHttpHeaders } from 'http2';
import { UnauthorizedError } from '../../../src/share/errors';
import { UserTokenDto } from '../user.dto';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const token = this.getTokenFromHeader(req.headers);

    if (!token) {
      return next();
    }

    try {
      const decoded: UserTokenDto = await this.jwtService.verifyAsync(token);

      req['user'] = decoded;
      return next();
    } catch {
      throw new UnauthorizedError({ authorize: ['token error'] });
    }
  }

  private getTokenFromHeader(header: IncomingHttpHeaders): string | null {
    const authHeader = header.authorization;

    if (!authHeader) {
      return null;
    }

    return authHeader.split(' ')[1];
  }
}
