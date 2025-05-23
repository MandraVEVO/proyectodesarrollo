import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
import { UpdateUserDto } from './dto/update-user.dto';


@Injectable()
export class AuthService {
  // Almacén de tokens invalidados (en memoria - para producción usar Redis)
  private invalidatedTokens: Set<string> = new Set();
  
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



  async deleteAccount(userId: string) {
    try {
      // 1. Buscar el cliente usando ClienteService
      // Primero necesitamos buscar todos los clientes y filtrar
      const clientes = await this.clienteService.findAll();
      const cliente = clientes.find(c => c.user_id?.id === userId);

      if (!cliente) {
        throw new NotFoundException(`No se encontró cliente asociado al usuario con ID ${userId}`);
      }

      // 2. Guardar IDs para referencias
      const clienteId = cliente.id;
      
      // 3. Borrar primero el cliente usando el servicio
      await this.clienteService.remove(clienteId);
      
      // 4. Borrar el usuario
      const user = await this.authRepository.findOneBy({ id: userId });
      
      if (!user) {
        throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
      }
      
      await this.authRepository.remove(user);
      
      // 5. Retornar confirmación
      return {
        statusCode: 200,
        message: 'Cuenta eliminada correctamente',
        data: {
          userId,
          clienteId
        }
      };
    } catch (error) {
      // Si es un error conocido, propagarlo
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Para otros errores, usar el manejador general
      this.handleDBErrors(error);
    }
  }

  async deleteEmpresaAccount(userId: string) {
    try {
      // 1. Verificar que el usuario existe antes de todo
      const user = await this.authRepository.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
      }
      
      // 2. Buscar la empresa asociada al usuario
      const empresas = await this.empresaService.findAll();
      const empresa = empresas.find(e => e.user_id?.id === userId);
      
      if (!empresa) {
        throw new NotFoundException(`No se encontró empresa asociada al usuario con ID ${userId}`);
      }
      
      // Guardar ID para referencias
      const empresaId = empresa.id;
      
      // 3. Borrar la empresa
      console.log(`Borrando empresa con ID ${empresaId}`);
      await this.empresaService.remove(empresaId);
      console.log(`Empresa borrada exitosamente`);
      
      // 4. Borrar el usuario - Usar try/catch específico para esta operación
      try {
        console.log(`Intentando borrar usuario con ID ${userId}`);
        const result = await this.authRepository.delete(userId);
        console.log(`Resultado de borrado de usuario:`, result);
        
        if (result.affected === 0) {
          throw new Error(`No se pudo borrar el usuario con ID ${userId}`);
        }
      } catch (userError) {
        console.error('Error al borrar usuario:', userError);
        throw new InternalServerErrorException(`Error al borrar el usuario: ${userError.message}`);
      }
      
      // 5. Retornar confirmación
      return {
        statusCode: 200,
        message: 'Cuenta de empresa eliminada completamente',
        data: {
          userId,
          empresaId
        }
      };
    } catch (error) {
      console.error('Error en deleteEmpresaAccount:', error);
      // Si es un error conocido, propagarlo
      if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
        throw error;
      }
      // Para otros errores, usar el manejador general
      this.handleDBErrors(error);
    }
  }

  async actualizarDatos(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.authRepository.findOneBy({ id });
      if (!user) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }
      
      // Actualizar solo los campos que existen en el DTO
      Object.assign(user, updateUserDto);
      
      await this.authRepository.save(user);
      
      return user;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  // Método para logout
  async logout(userId: string, token: string) {
    try {
      // 1. Verificar que el usuario existe
      const user = await this.authRepository.findOneBy({ id: userId });
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // 2. Añadir el token a la lista negra
      this.invalidatedTokens.add(token);
      
      // 3. Opcional: Guardar en base de datos para persistencia
      // await this.tokenBlacklistRepository.save({ token, expiresAt: ... });

      // 4. Retornar confirmación
      return {
        statusCode: 200,
        message: 'Sesión cerrada correctamente'
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.handleDBErrors(error);
    }
  }

  // Método para verificar si un token está en la lista negra
  isTokenInvalidated(token: string): boolean {
    return this.invalidatedTokens.has(token);
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
