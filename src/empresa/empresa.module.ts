import { Module } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { EmpresaController } from './empresa.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from './entities/empresa.entity';
import { Auth } from 'src/auth/entities/user.entity';
import { Cupon } from 'src/cupon/entities/cupon.entity';
import { EmpresaImage } from './entities/empresa-image.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [EmpresaController],
  providers: [EmpresaService],
  imports:[
    TypeOrmModule.forFeature([
      Empresa,
      Auth,
      Cupon,
      EmpresaImage
    ]),
    AuthModule
  ],
  exports: [
    TypeOrmModule,
    EmpresaService
  ]
})
export class EmpresaModule {}
