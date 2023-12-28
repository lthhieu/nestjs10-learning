import {
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/decorators/customize';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }
    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler());
        if (isPublic) {
            return true;
        }
        return super.canActivate(context);
    }

    handleRequest(err, user, info, ctx: ExecutionContext) {
        const request: Request = ctx.switchToHttp().getRequest();
        // You can throw an exception based on either "info" or "err" arguments
        if (err || !user) {
            throw err || new UnauthorizedException('Invalid token or Not found token from header');
        }
        const targetMethod = request.method
        const targetPath = request.route.path as string
        const permissions = user?.permissions ?? []
        let isExist = permissions.find(item => targetMethod === item.method && targetPath === item.apiPath)
        if (targetPath.startsWith('/api/v1/auth')) isExist = true
        if (!isExist) {
            throw new ForbiddenException("You don't have permission to access endpoint")
        }
        return user;
    }
}