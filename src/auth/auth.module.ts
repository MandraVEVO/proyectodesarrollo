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
import { ClienteService } from 'src/cliente/cliente.service';
import { EmpresaService } from 'src/empresa/empresa.service';
import { Cupon } from 'src/cupon/entities/cupon.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtBlacklistGuard } from './guards/jwt-blacklist.guard';
import { CacheModule } from 'src/cache/cache.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, ClienteService,EmpresaService,JwtStrategy,JwtBlacklistGuard],
  imports:[
    CacheModule,
    ConfigModule,
    TypeOrmModule.forFeature([
      Auth,
      Cliente,
      Empresa,
      Cupon
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
    JwtStrategy,
    JwtBlacklistGuard
    
  ]
  
 
})
export class AuthModule {}
