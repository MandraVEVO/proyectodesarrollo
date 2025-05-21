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
      const empresa = await this.empresaRepo.save(createEmpresaDto);
      return empresa;
    } catch (error) {
      this.handleExceptions(error);
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
      const empresa = this.empresaRepo.findOneBy({id});
      if (!empresa) {
        throw new NotFoundException(`Empresa with id ${id} not found`);
      }
      await this.empresaRepo.update(id, updateEmpresaDto);
      return { ...empresa, ...updateEmpresaDto };
      } catch (error) {
      
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
