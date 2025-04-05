import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

export const GetRawHeaders = createParamDecorator(
    // el ctx indica el contexto en el que se encuentra Nest en este momento
    // sirve para obtener la request
    (data: string, ctx: ExecutionContext) => {
        
        console.log({data});
        const req = ctx.switchToHttp().getRequest();
        const rawHeaders = req.rawHeaders;
        //const user = req.user;

        return rawHeaders;
    }
);