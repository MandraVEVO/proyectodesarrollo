import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ValidRoles } from './dto/interfaces/valid-roles';
import { Auth } from './decorators/role-protected.decorators.ts/auth.decorator';
import { AuthGuard } from '@nestjs/passport';
import { JwtBlacklistGuard } from './guards/jwt-blacklist.guard';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('register/empresa')
  createEmpresa(@Body() createUserDto: CreateUserDto) {
    return this.authService.createEmpresa(createUserDto);
  }

   @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Delete('empresa/:id/delete')
  @UseGuards(JwtBlacklistGuard)
  @Auth(ValidRoles.admin)
  deleteEmpresaAccount(@Param('id') id: string) {
    return this.authService.deleteEmpresaAccount(id);
  }

  @Patch('update/:id')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.authService.actualizarDatos(id, updateUserDto);
  }

  @Delete(':id/delete')
  deleteUser(@Param('id') id: string) {
    return this.authService.deleteAccount(id);
  }

  @Post('logout')
  @UseGuards(JwtBlacklistGuard)
  async logout(@Req() request) {
    const token = request.headers.authorization?.split(' ')[1];
    return this.authService.logout(request.user.id, token);
  }
}
