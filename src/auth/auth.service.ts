import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './dto/interfaces/jwt-payload.interfaces';
import { ClienteService } from '../cliente/cliente.service';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { CreateClienteDto } from 'src/cliente/dto/create-cliente.dto';
import { EmpresaService } from 'src/empresa/empresa.service';
import { CreateEmpresaDto } from 'src/empresa/dto/create-empresa.dto';


@Injectable()
export class AuthService {

    constructor(
  @InjectRepository(Auth)
  private readonly authRepository: Repository<Auth>,  

  private readonly jwtService: JwtService,

  private readonly clienteService: ClienteService,

  private readonly empresaService: EmpresaService,

  
) {}


     async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      
      const user = this.authRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      
      // Primero guarda el usuario para obtener su ID
      await this.authRepository.save(user);
      
      // Ahora crea el cliente con el ID del usuario
      const createClienteDto: CreateClienteDto = { user_id: user.id };
      await this.clienteService.create(createClienteDto);

      return {
        ...user,
        token: this.getJwtToken({id: user.id}),
      }

    } catch (error) {
      this.handleDBErrors(error);
    }
  }


  async createEmpresa(createUserDto: CreateUserDto) {
    try {
      // 1. Crear el usuario con rol de empresa
      const { password, ...userData } = createUserDto;
      
      const user = this.authRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
        rol: ['empresa']  // Asignar rol de empresa
      });
      
      // Guardar el usuario
      await this.authRepository.save(user);
      
      // 2. Solo crear el registro de empresa con el ID del usuario
      // Los datos específicos de la empresa se ingresarán después
      const createEmpresaDto: CreateEmpresaDto = { 
        user_id: user.id, 
        empresa: 'Pendiente',     // Valor temporal
        ubicacion: 'Pendiente',
            // Valor temporal
      };
      
      const empresa = await this.empresaService.create(createEmpresaDto);

      // 3. Retornar los datos del usuario con token
      return {
        ...user,
        token: this.getJwtToken({id: user.id}),
         // Incluir el ID de la empresa para futuras referencias
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
