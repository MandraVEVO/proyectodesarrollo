import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Auth } from './entities/user.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports:[
    ConfigModule,
    TypeOrmModule.forFeature([
      Auth,
      Cliente,
      Empresa
    ]),
  ],
  
 
})
export class AuthModule {}
