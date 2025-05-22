import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Empresa } from './entities/empresa.entity';
import { Repository } from 'typeorm';
import e from 'express';

@Injectable()
export class EmpresaService {
  private readonly logger = new Logger(EmpresaService.name);

  constructor(
   @InjectRepository(Empresa)
   private empresaRepo: Repository<Empresa>,
  ) {}

  async create(createEmpresaDto: CreateEmpresaDto) {
    try {
      // Primero, crea una instancia de Empresa
      const empresa = this.empresaRepo.create({
        // Asignar el ID de la empresa igual al ID del usuario
        id: createEmpresaDto.user_id,
        empresa: createEmpresaDto.empresa,
        ubicacion: createEmpresaDto.ubicacion,
        // La relación debe ser un objeto con id, no un string
        user_id: { id: createEmpresaDto.user_id }
      });
      
      // Ahora guarda la instancia de Empresa
      return await this.empresaRepo.save(empresa);
    } catch (error) {
      // Manejo de errores
      throw new InternalServerErrorException('Error creating empresa');
    }
  }

  async findAll() {
    return this.empresaRepo.find({
      relations: {}
    });
  }

  async findOne(id: string) {
    try {
          const empresa = await this.empresaRepo.findOneBy({id});
          if (!empresa) {
            throw new NotFoundException(`Empresa with id ${id} not found`);
          }
          return empresa;
        } catch (error) {
                throw new NotFoundException(`Empresa with id ${id} not found`);
    
        }
  }

  async update(id: string, updateEmpresaDto: UpdateEmpresaDto) {
    try {
      // Buscar la empresa primero
      const empresa = await this.empresaRepo.findOneBy({id});
      if (!empresa) {
        throw new NotFoundException(`Empresa with id ${id} not found`);
      }
      
      // Crear un objeto parcial para la actualización
      const updateData: Partial<Empresa> = {};
      
      // Solo incluir los campos que existen en el DTO
      if (updateEmpresaDto.empresa !== undefined) {
        updateData.empresa = updateEmpresaDto.empresa;
      }
      if (updateEmpresaDto.ubicacion !== undefined) {
        updateData.ubicacion = updateEmpresaDto.ubicacion;
      }
      // No incluir user_id ya que no debería cambiar
      
      // Ahora actualizar con el objeto parcial
      await this.empresaRepo.update(id, updateData);
      
      // Retornar la empresa actualizada
      return this.empresaRepo.findOne({
        where: { id },
        relations: ['user_id']
      });
    } catch (error) {
      // Manejo de errores
      throw new InternalServerErrorException('Error updating empresa');
    }
  }

  async remove(id: string) {
   try {
      const empresa = await this.empresaRepo.findOneBy({id});
      if (!empresa) {
        throw new NotFoundException(`Empresa with id ${id} not found`);
      }
      await this.empresaRepo.remove(empresa);
    } catch (error) {
      throw error;
      
    }
    throw new InternalServerErrorException('Error removing cliente');
  
  }

  private handleExceptions(error: any) {
      if (error.code === '23505') {
        throw new BadRequestException(error.detail);
      }
      this.logger.error(error);
      throw new InternalServerErrorException('Unexpected error, check server logs');
    }
}
