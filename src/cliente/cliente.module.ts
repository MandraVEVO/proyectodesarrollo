import { Module } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { ClienteController } from './cliente.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { Auth } from 'src/auth/entities/user.entity';
import { Cupon } from 'src/cupon/entities/cupon.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';

@Module({
  controllers: [ClienteController],
  providers: [ClienteService],
  imports:[
    TypeOrmModule.forFeature([
      Cliente,
      Auth,
      Cupon
    ]),
  ],
  exports: [
    TypeOrmModule,
    ClienteService,

  ],
})
export class ClienteModule {}
