import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Auth } from './entities/user.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

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
    PassportModule.register({ defaultStrategy: 'jwt' }), 
//modulo asincrono
    JwtModule.registerAsync({
      imports:[ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => { //injectar dependencias
        return {
          secret: configService.get('JWT_SECRET'), //esto debe ser secreto y guardado en un archivo .env,
          signOptions: {
            expiresIn: '4h',
          },
        }
      }
    })
  ],
  exports: [
    TypeOrmModule,
    JwtModule,
    PassportModule,
    
  ]
  
 
})
export class AuthModule {}
