import { SetMetadata } from '@nestjs/common';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

//public true => uncheck jwt auth guard
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

//customize response message
export const RESPONSE_MESSAGE = 'responseMessage';
export const ResponseMessage = (message: string) =>
    SetMetadata(RESPONSE_MESSAGE, message);

//get req.user when decode token
export const User = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);
