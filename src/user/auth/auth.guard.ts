import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UnauthorizedError } from '../../share/errors';

/* Validates request has 'user' field.
 * To inject user field into request, use `auth.middleware`.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request['user']) {
      throw new UnauthorizedError({ authorize: ['need authorization'] });
    }

    return true;
  }
}
