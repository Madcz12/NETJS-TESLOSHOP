import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { LoginUserDto, CreateUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService { // las interacciones con la base de datos son asincronas
  
  constructor(

    @InjectRepository(User)

    private readonly userRepository: Repository<User>, 
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,

  ){}


  async create(createUserDto: CreateUserDto) {
    
    try {

      const { password, ...userData } = createUserDto;
      
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });

      await this.userRepository.save(user)
      //delete user.password; CORREGIR

      return {
        ...user,
        token: this.getJwtToken({ id: user.id }),
      };
      // TODO: Retornar JWT de acceso

    } catch (error) {
      this.handleDBErrors(error);
    }

  }

  async login(loginUserDto: LoginUserDto){

    const {email, password} = loginUserDto;

    const user = await this.userRepository.findOne({

      where: { email },

      select: { email: true, password: true, id: true },
    })

    if(!user){
      throw new UnauthorizedException('Credentials are not valid (email)');
    }

    if(!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid (password)');


    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
    //TODO: retornar un JWT

  }

  private getJwtToken(payload: JwtPayload){
    const token = this.jwtService.sign(payload); 
    return token;
 }

  private handleDBErrors(error: any): never{

    if(error.code === '23505')
      throw new BadRequestException(error.detail);
    console.log(error);

    throw new InternalServerErrorException('Please check server logs');
  }

}
