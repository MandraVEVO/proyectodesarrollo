import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';

@Injectable()
export class ClienteService {

  private readonly logger = new Logger(ClienteService.name);

  constructor(
    @InjectRepository(Cliente)
    private clienteRepo: Repository<Cliente>,
  ) {}


  async create(createClienteDto: CreateClienteDto) {
    try {
      const cliente = await this.clienteRepo.save(createClienteDto);
      return cliente;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll() {
    return this.clienteRepo.find({
      relations: {
        historial: true,
        auth: true
      }
    });
  }

  async findOne(id: string) {
    try {
      const cliente = await this.clienteRepo.findOneBy({id});
      if (!cliente) {
        throw new NotFoundException(`Cliente with id ${id} not found`);
      }
      return cliente;
    } catch (error) {
            throw new NotFoundException(`Cliente with id ${id} not found`);

    }
  }

  async update(id: string, updateClienteDto: UpdateClienteDto) {
    try {
      const cliente = this.clienteRepo.findOneBy({id});
      if (!cliente) {
        throw new NotFoundException(`Cliente with id ${id} not found`);
      }
      await this.clienteRepo.update(id, updateClienteDto);
      return { ...cliente, ...updateClienteDto };
      } catch (error) {
      
    }
  }

 async remove(id: string) {
    try {
      const cliente = await this.clienteRepo.findOneBy({id});
      if (!cliente) {
        throw new NotFoundException(`Cliente with id ${id} not found`);
      }
      await this.clienteRepo.remove(cliente);
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
