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

  findAll(options?: any) {
    return this.empresaRepo.find(options || {
      relations: {
        user_id: true,
        cupones: true
      }
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
      
      // Retornar mensaje de éxito en lugar de lanzar un error
      return { message: `Empresa con ID ${id} eliminada correctamente` };
    } catch (error) {
      // Manejar errores aquí
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error al eliminar empresa:', error);
      throw new InternalServerErrorException('Error removing empresa');
    }
  }

  private handleExceptions(error: any) {
      if (error.code === '23505') {
        throw new BadRequestException(error.detail);
      }
      this.logger.error(error);
      throw new InternalServerErrorException('Unexpected error, check server logs');
    }

    // Añade este método en EmpresaService
    async findByUserId(userId: string) {
      return this.empresaRepo.findOne({
        where: { user_id: { id: userId } },
        relations: ['user_id', 'cupones']
      });
    }

    // En EmpresaService
async clearCupones(empresaId: string) {
  const empresa = await this.empresaRepo.findOne({
    where: { id: empresaId },
    relations: ['cupones']
  });
  
  if (empresa && empresa.cupones.length > 0) {
    // Desasociar cupones
    empresa.cupones = [];
    await this.empresaRepo.save(empresa);
  }
  
  return true;
}
}
