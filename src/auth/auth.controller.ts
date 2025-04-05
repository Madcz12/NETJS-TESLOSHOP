import { Controller, Get, Post, Body, UseGuards, Request, Req, Header, Headers, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { Auth, GetRawHeaders, GetUser } from './decorators';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected/role-protected.decorator';
import { ValidRoles } from './interfaces';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser('id') user: User

  ){
    return this.authService.checkAuthStatus(user);
  }


  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @GetRawHeaders('email') rawHeaders: string[],
  ){

    return {
      ok: true, 
      message: 'Hola Mundo Private',
      user,
      userEmail,
      rawHeaders,
    }
  }
  // @SetMetadata('roles', ['admin', 'super-user'])
  @Get('private2')
  @RoleProtected(ValidRoles.superUser, ValidRoles.admin, ValidRoles.user)
  @UseGuards(AuthGuard(), UserRoleGuard) // contiene los permisos del usuario para iniciar sesión de forma autenticada
  private2(
    @GetUser() user: User
  ){
    return{
      ok: true,
      user 
    }
  }

  @Get('private3')
  @Auth(ValidRoles.admin, ValidRoles.user)
  private3(
    @GetUser() user: User
  ){
    return{
      ok: true,
      user 
    }
  }


}
