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
    // Buscar la empresa incluyendo su relación con las imágenes
    const empresa = await this.empresaRepository.findOne({
      where: { id: empresaId },
      relations: ['image'] // Cargar las imágenes relacionadas
    });
    
    if (!empresa) {
      throw new NotFoundException(`Empresa con ID ${empresaId} no encontrada`);
    }
    
    // Verificar si hay imágenes
    if (!empresa.image || empresa.image.length === 0) {
      return []; // Retornar un array vacío si no hay imágenes
    }
    
    // Retornar un array con los detalles completos de cada imagen
    return empresa.image.map(img => ({
      id: img.id,
      nombre: img.nombre,
      descripcion: img.descripcion,
      costo: img.costo,
      url: img.url,
      // Asegúrate de que la URL sea completa
      imagenCompleta: img.url.startsWith('http') ? img.url : `${process.env.HOST_API || 'http://localhost:3000'}/files/recompensa/${img.url}`
    }));
  }

  // Obtener todas las imágenes de todas las empresas
async getAllImages() {
  try {
    // Buscar todas las imágenes de empresas
    const images = await this.empresaImageRepository.find({
      relations: ['recompensa'] // Cargar la relación con la empresa
    });
    
    // Si no hay imágenes, devolver array vacío
    if (!images || images.length === 0) {
      return [];
    }
    
    // Transformar los resultados para incluir los detalles de la imagen y la URL completa
    return images.map(img => ({
      id: img.id,
      nombre: img.nombre,
      descripcion: img.descripcion,
      costo: img.costo,
      url: img.url,
      // Información de la empresa relacionada
      empresa: img.recompensa ? {
        id: img.recompensa.id,
        nombre: img.recompensa.empresa
      } : null,
      // Asegúrate de que la URL sea completa
      imagenCompleta: img.url.startsWith('http') ? img.url : `${process.env.HOST_API || 'http://localhost:3000'}/files/recompensa/${img.url}`
    }));
  } catch (error) {
    console.error('Error al obtener todas las imágenes:', error);
    throw new Error('Error al obtener las imágenes de todas las empresas');
  }
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
