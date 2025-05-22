import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateCuponDto } from './dto/create-cupon.dto';
import { UpdateCuponDto } from './dto/update-cupon.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cupon } from './entities/cupon.entity';
import { Repository } from 'typeorm';
import { Empresa } from 'src/empresa/entities/empresa.entity';

@Injectable()
export class CuponService {


  private readonly logger = new Logger(CuponService.name);
    
  constructor(
     @InjectRepository(Cupon)
     private cuponRepo: Repository<Cupon>,
     @InjectRepository(Empresa)
     private empresaRepo: Repository<Empresa>,
  ) {}

  async create(createCuponDto: CreateCuponDto) {
    try {
      const cupon = await this.cuponRepo.save(createCuponDto);
      return cupon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll() {
    return this.cuponRepo.find({
      relations:{}
    })
  }

  async findOne(id: string) {
    try {
          const cupon = await this.cuponRepo.findOneBy({id});
          if (!cupon) {
            throw new NotFoundException(`Cliente with id ${id} not found`);
          }
          return cupon;
        } catch (error) {
                throw new NotFoundException(`Employee with id ${id} not found`);
    
        }
  }

  async update(id: string, updateCuponDto: UpdateCuponDto) {
    try {
      const cliente = this.cuponRepo.findOneBy({id});
      if (!cliente) {
        throw new NotFoundException(`Cliente with id ${id} not found`);
      }
      await this.cuponRepo.update(id, updateCuponDto);
      return { ...cliente, ...updateCuponDto };
      } catch (error) {
      
    }
  }

  async remove(id: string) {
    try {
      const cupon = await this.cuponRepo.findOneBy({id});
      if (!cupon) {
        throw new NotFoundException(`Cupon with id ${id} not found`);
      }
      await this.cuponRepo.remove(cupon);
      
      // Retornar confirmación en lugar de lanzar error
      return { message: `Cupon with id ${id} successfully removed` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error removing cupon: ${error.message}`);
    }
  }

  async createWithEmpresa(empresaId: string, createCuponDto: CreateCuponDto) {
    try {
      // 1. Verificar que la empresa existe
      const empresa = await this.empresaRepo.findOneBy({ id: empresaId });
      if (!empresa) {
        throw new NotFoundException(`Empresa con ID ${empresaId} no encontrada`);
      }

      // 2. Crear el cupón con relación a la empresa
      const cupon = this.cuponRepo.create({
        ...createCuponDto,
        empresa: empresa  // Establece la relación con la empresa
      });

      // 3. Guardar el cupón
      const savedCupon = await this.cuponRepo.save(cupon);

      // 4. Retornar el cupón creado con información básica de la empresa
      return {
        ...savedCupon,
        empresa: {
          id: empresa.id,
          nombre: empresa.empresa
        }
      };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

    private handleExceptions(error: any) {
      if (error.code === '23505') {
        throw new BadRequestException(error.detail);
      }
      this.logger.error(error);
      throw new InternalServerErrorException('Unexpected error, check server logs');
    }
}
