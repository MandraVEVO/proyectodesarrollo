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
    // Crear una nueva instancia de Cliente
    const cliente = this.clienteRepo.create({
      puntos: 0,  // valores iniciales
      user_id: { id: createClienteDto.user_id }  // Solo referenciar el ID
    });
    
    // Guardar la entidad
    return this.clienteRepo.save(cliente);
  } catch (error) {
    this.handleExceptions(error);
  }
}

  findAll() {
    return this.clienteRepo.find({
      relations: {
        historial: true,
        user_id: true
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
      //await this.clienteRepo.update(id, updateClienteDto);
      return { ...cliente, ...updateClienteDto };
      } catch (error) {
      
    }
  }

  async updatePuntos(id: string, puntosData: { puntos: number }) {
    try {
      const cliente = await this.clienteRepo.findOneBy({id});
      if (!cliente) {
        throw new NotFoundException(`Cliente with id ${id} not found`);
      }
      
      // Accede a los puntos desde el objeto JSON
      const { puntos } = puntosData;
      
      // Valida que puntos sea un número
      if (isNaN(puntos)) {
        throw new BadRequestException('Los puntos deben ser un número válido');
      }
      
      cliente.puntos += puntos;
      
      // Guarda el cliente actualizado
      await this.clienteRepo.save(cliente);
      
      // Retorna una respuesta en formato JSON
      return {
        statusCode: 200,
        mensaje: `Puntos actualizados correctamente. Nuevo total: ${cliente.puntos}`,
        data: {
          clienteId: cliente.id,
          puntosAnteriores: cliente.puntos - puntos,
          puntosAgregados: puntos,
          puntosActuales: cliente.puntos
        }
      };
    } catch (error) {
      this.handleExceptions(error);
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
