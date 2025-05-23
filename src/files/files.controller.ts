import { Controller, Post, Body, UploadedFile, BadRequestException, UseInterceptors, Get } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/fileNamer.helper';
import { ConfigService } from '@nestjs/config';
import { CreateEmpresaImageDto } from '../empresa/dto/create-empresa-image.dto';


@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Post('empresa-image')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }))
  async uploadEmpresaImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() createEmpresaImageDto: CreateEmpresaImageDto,
  ) {
    if(!file) {
      throw new BadRequestException('Make sure that the file is a valid image');
    }

    // Generar la URL segura
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;
    
    // Guardar en la base de datos
    const savedImage = await this.filesService.createEmpresaImage({
      ...createEmpresaImageDto,
      url: secureUrl
    });

    return {
      message: 'Imagen guardada correctamente',
      image: savedImage
    };
  }

  

}
