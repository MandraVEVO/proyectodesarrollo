import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { ArrayContains, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { Cupon } from 'src/cupon/entities/cupon.entity';

@Injectable()
export class ClienteService {

  private readonly logger = new Logger(ClienteService.name);

  constructor(
    @InjectRepository(Cliente)
    private clienteRepo: Repository<Cliente>,
    @InjectRepository(Cupon)
    private cuponRepo: Repository<Cupon>,
    
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
      // Primero buscar el cliente con todas sus relaciones
      const cliente = await this.clienteRepo.findOne({
        where: { id },
        relations: ['historial', 'user_id']
      });
      
      if (!cliente) {
        throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
      }
      
      // Si tiene relaciones historial, vaciarlas primero
      if (cliente.historial && cliente.historial.length > 0) {
        cliente.historial = []; // Desasociar cupones
        await this.clienteRepo.save(cliente);
      }
      
      // Ahora sí eliminamos el cliente
      await this.clienteRepo.remove(cliente);
      
      return { message: `Cliente con ID ${id} eliminado exitosamente` };
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      throw new InternalServerErrorException('Error removing cliente');
    }
  }


  /**
 * Obtiene todos los cupones asociados a un cliente específico
 * @param clienteId ID del cliente cuyos cupones se quieren consultar
 * @returns Array con todos los cupones del cliente
 */
async findCuponesByCliente(clienteId: string) {
  try {
    // 1. Verificar que el cliente existe
    const cliente = await this.clienteRepo.findOne({
      where: { id: clienteId },
      relations: ['historial', 'historial.empresa', 'user_id']
    });
    
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado`);
    }
    
    // 2. Obtener los cupones que tiene el cliente en su historial
    const cuponesDelCliente = cliente.historial || [];
    
    // 3. Obtener también los cupones donde el cliente está en el array 'personas'
    const cuponesAdicionales = await this.cuponRepo.find({
      where: {
        personas: ArrayContains([clienteId])  // Sintaxis correcta de TypeORM
      },
      relations: ['empresa']
    });
    
    // 4. Combinar los cupones (eliminando duplicados)
    const todosCupones = [...cuponesDelCliente];
    
    // Añadir cupones adicionales solo si no están ya incluidos
    cuponesAdicionales.forEach(cuponAdicional => {
      const yaExiste = todosCupones.some(cupon => cupon.id === cuponAdicional.id);
      if (!yaExiste) {
        todosCupones.push(cuponAdicional);
      }
    });
    
    // 5. Formatear la respuesta
    return {
      cliente: {
        id: cliente.id,
        nombre: cliente.user_id?.nombre || 'Cliente',
        puntos: cliente.puntos
      },
      cantidad: todosCupones.length,
      cupones: todosCupones.map(cupon => ({
        id: cupon.id,
        titulo: cupon.titulo,
        precio: cupon.precio,
        detalles: cupon.detalles,
        status: cupon.status,
        fechaExpiracion: cupon.fechaExpiracion,
        empresa: cupon.empresa ? {
          id: cupon.empresa.id,
          nombre: cupon.empresa.empresa,
          ubicacion: cupon.empresa.ubicacion
        } : null
      }))
    };
  } catch (error) {
    if (error instanceof NotFoundException) {
      throw error;
    }
    this.logger.error(`Error al buscar cupones del cliente ${clienteId}:`, error);
    throw new InternalServerErrorException('Error al obtener los cupones del cliente');
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
