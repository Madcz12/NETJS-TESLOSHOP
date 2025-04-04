import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { jwtConstants } from '../constants';

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ) {

    constructor(
        @InjectRepository( User )
        private readonly userRepository: Repository<User>,

        //configService: ConfigService, 
              
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConstants.secret,
          });
          //console.log(jwtConstants.secret);
    }

    async validate( payload: JwtPayload ): Promise<User> {
        
        //const { email } = payload;
        const { id } = payload;

        const user = await this.userRepository.findOneBy({ id });

        if ( !user ) 
            throw new UnauthorizedException('Token not valid')
            
        if ( !user.isActive ) 
            throw new UnauthorizedException('User is inactive, talk with an admin');
        
        console.log({user});

        return user;
    }

}
