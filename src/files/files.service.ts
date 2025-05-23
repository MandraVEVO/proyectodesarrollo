import { BadGatewayException, Injectable, NotFoundException } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmpresaImage } from 'src/empresa/entities/empresa-image.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { v4 as uuid } from 'uuid';


@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(EmpresaImage)
    private readonly empresaImageRepository: Repository<EmpresaImage>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}
 
  getStaticeRecompensaImage(imageName: string) {
    const path = join(__dirname,'../../static/products', imageName);

    if(!existsSync(path)){
      throw new BadGatewayException(`No product found with image ${imageName}`);
    }
    return path;
  }

  async createEmpresaImage(data: {
    nombre: string;
    descripcion: string;
    costo: number;
    url: string;
    empresaId: string;
  }) {
    try {
      // 1. Verificar que la empresa existe
      const empresa = await this.empresaRepository.findOneBy({ id: data.empresaId });
      
      if (!empresa) {
        throw new NotFoundException(`Empresa con ID ${data.empresaId} no encontrada`);
      }
      
      // 2. Crear la nueva instancia de EmpresaImage
      const empresaImage = this.empresaImageRepository.create({
        id: uuid(), // Generar un ID único para la imagen
        nombre: data.nombre,
        descripcion: data.descripcion,
        costo: data.costo,
        url: data.url,
        recompensa: empresa // Relacionar con la empresa
      });
      
      // 3. Guardar la imagen en la base de datos
      return await this.empresaImageRepository.save(empresaImage);
    } catch (error) {
      throw error;
    }
  }

  // Obtener todas las imágenes de una empresa
  async getEmpresaImages(empresaId: string) {
    const empresa = await this.empresaRepository.findOne({
      where: { id: empresaId },
      relations: []
    });
    
    if (!empresa) {
      throw new NotFoundException(`Empresa con ID ${empresaId} no encontrada`);
    }
    
    return empresa.image;
  }

  // Eliminar una imagen
  async removeEmpresaImage(imageId: string) {
    const image = await this.empresaImageRepository.findOneBy({ id: imageId });
    
    if (!image) {
      throw new NotFoundException(`Imagen con ID ${imageId} no encontrada`);
    }
    
    await this.empresaImageRepository.remove(image);
    return { message: 'Imagen eliminada correctamente' };
  }
}
