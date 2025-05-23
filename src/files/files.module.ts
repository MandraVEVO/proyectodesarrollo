import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { EmpresaImage } from 'src/empresa/entities/empresa-image.entity';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Empresa,EmpresaImage]),
  ],
})
export class FilesModule {}
