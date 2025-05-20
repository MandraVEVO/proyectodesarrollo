import { Module } from '@nestjs/common';
import { CuponService } from './cupon.service';
import { CuponController } from './cupon.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { Cupon } from './entities/cupon.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Ticket } from 'src/ticket/entities/ticket.entity';

@Module({
  controllers: [CuponController],
  providers: [CuponService],
  imports:[
    TypeOrmModule.forFeature([
      Cliente,
      Cupon,
      Empresa,
      Ticket
    
    ])
  ],
  exports: [
    TypeOrmModule
  ]
})
export class CuponModule {}
