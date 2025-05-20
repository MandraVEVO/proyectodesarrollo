import { Module } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { EmpresaController } from './empresa.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from './entities/empresa.entity';
import { Auth } from 'src/auth/entities/user.entity';
import { Cupon } from 'src/cupon/entities/cupon.entity';

@Module({
  controllers: [EmpresaController],
  providers: [EmpresaService],
  imports:[
    TypeOrmModule.forFeature([
      Empresa,
      Auth,
      Cupon
    ])
  ]
})
export class EmpresaModule {}
