import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

export const GetUser = createParamDecorator(
    // el ctx indica el contexto en el que se encuentra Nest en este momento
    // sirve para obtener la request
    (data: string, ctx: ExecutionContext) => {
        
        console.log({data});
        const req = ctx.switchToHttp().getRequest();
        const user = req.user;

        if( !user )
            throw new InternalServerErrorException('User not found in (request)');

        return (! data ) ? user : user[data];

    }
);