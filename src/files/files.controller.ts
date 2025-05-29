import { Controller, Post, Body, UploadedFile, BadRequestException, UseInterceptors, Get, Delete, Param } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/fileNamer.helper';
import { ConfigService } from '@nestjs/config';
import { CreateEmpresaImageDto } from '../empresa/dto/create-empresa-image.dto';
import { Auth } from 'src/auth/decorators/role-protected.decorators.ts/auth.decorator';
import { ValidRoles } from 'src/auth/dto/interfaces/valid-roles';


@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}
  @Get('empresa-image')
  
  getAllEmpresaImages() {
    return this.filesService.getAllImages();
  }

  @Get('empresa-images/:imageName')
  @Auth(ValidRoles.empresa)
  findEmpresaImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('imageName') imageName: string,
  ) {
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${imageName}`;
    return {
      message: 'Imagen encontrada correctamente',
      url: secureUrl
    };
  }

  @Post('empresa-image')
  @Auth(ValidRoles.empresa)
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

  @Delete('empresa-image/:id')
  
  async deleteEmpresaImage(@Param('id') id: string) {
    const deletedImage = await this.filesService.removeEmpresaImage(id);
    if (!deletedImage) {
      throw new BadRequestException('No se pudo eliminar la imagen');
    }
    return deletedImage;
  }

  

}
