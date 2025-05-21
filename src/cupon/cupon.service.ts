import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateCuponDto } from './dto/create-cupon.dto';
import { UpdateCuponDto } from './dto/update-cupon.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cupon } from './entities/cupon.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CuponService {


  private readonly logger = new Logger(CuponService.name);
    
  constructor(
     @InjectRepository(Cupon)
     private cuponRepo: Repository<Cupon>,
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
      const cliente = await this.cuponRepo.findOneBy({id});
      if (!cliente) {
        throw new NotFoundException(`Cliente with id ${id} not found`);
      }
      await this.cuponRepo.remove(cliente);
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
