import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './dto/interfaces/jwt-payload.interfaces';


@Injectable()
export class AuthService {

    constructor(
  @InjectRepository(Auth)
  private readonly authRepository: Repository<Auth>,  

  private readonly jwtService: JwtService,
) {}


     async create(createUserDto: CreateUserDto) {
    try {
      const {password, ...userData } = createUserDto;
      
      const user = this.authRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
        
      });
      await this.authRepository.save(user);

      // delete user.password;
      //TODO return the JWT of access
      return {
        ...user,
        token: this.getJwtToken({id: user.id}),
      }
  
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {

    const {password, email} = loginUserDto;

    const user = await this.authRepository.findOne({
       where: {email},
       select: {email: true, password: true,id: true}
      });
      if(!user)
         throw new UnauthorizedException('Credentials are not valid (email)');

      if(!bcrypt.compareSync(password,user.password))
        throw new UnauthorizedException('Credentials are not valid (password)');
      // console.log({user});


    return {
      ...user,
    token: this.getJwtToken({id: user.id}),
    };
    //TO DO: RETORNAR EL JWT

  }



  private getJwtToken( payload: JwtPayload){
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDBErrors(error: any): never{
    if (error.code === '23505') 
      throw new BadRequestException(error.detail);
    console.log(error);
    throw new InternalServerErrorException('Please check server logs');
  }
  
}
