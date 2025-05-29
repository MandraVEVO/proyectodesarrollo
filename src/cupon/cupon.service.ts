import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateCuponDto } from './dto/create-cupon.dto';
import { UpdateCuponDto } from './dto/update-cupon.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cupon } from './entities/cupon.entity';
import { Repository } from 'typeorm';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';

@Injectable()
export class CuponService {


  private readonly logger = new Logger(CuponService.name);
    
  constructor(
     @InjectRepository(Cupon)
     private cuponRepo: Repository<Cupon>,
     @InjectRepository(Empresa)
     private empresaRepo: Repository<Empresa>,
     @InjectRepository(Cliente)
     private clienteRepo: Repository<Cliente>,
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
    try {
      // Buscar todos los cupones activos y cargar sus empresas relacionadas
      const cupones = await this.cuponRepo.find({
        where: {
          status: true  // Solo cupones activos
        },
        relations: ['empresa'],  // Incluir la relación con empresa
        order: {
          fechaExpiracion: 'DESC'  // Ordenar por fecha de expiración (opcional)
        }
      });

      // Transformar la respuesta para tener un formato más limpio
      return cupones.map(cupon => ({
        ...cupon,
        empresa: cupon.empresa ? {
          id: cupon.empresa.id,
          nombre: cupon.empresa.empresa,
          ubicacion: cupon.empresa.ubicacion
        } : null
      }));
    } catch (error) {
      this.logger.error('Error al buscar cupones activos:', error);
      throw new InternalServerErrorException('Error al obtener los cupones activos');
    }
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


  /**
 * Obtiene todos los cupones que pertenecen a una empresa específica
 * @param empresaId ID de la empresa cuyos cupones se quieren consultar
 * @returns Array con todos los cupones de la empresa
 */
async findAllByEmpresa(empresaId: string) {
  try {
    // 1. Verificar que la empresa existe
    const empresaExists = await this.empresaRepo.findOneBy({ id: empresaId });
    if (!empresaExists) {
      throw new NotFoundException(`Empresa con ID ${empresaId} no encontrada`);
    }

    // 2. Buscar todos los cupones asociados a esa empresa
    const cupones = await this.cuponRepo.find({
      where: {
        empresa: { id: empresaId }
      },
      relations: ['empresa'], // incluir info de la empresa relacionada
      order: {
        fechaExpiracion: 'DESC' // ordenar por fecha de expiración descendente (opcional)
      }
    });

    // 3. Retornar los cupones encontrados
    return {
      empresa: {
        id: empresaId,
        nombre: empresaExists.empresa
      },
      cantidad: cupones.length,
      cupones
    };
  } catch (error) {
    if (error instanceof NotFoundException) {
      throw error;
    }
    this.handleExceptions(error);
  }
}

/**
 * Agrega un cliente al cupón y actualiza su estado
 * @param cuponId ID del cupón al que se agregará el cliente
 * @param clienteId ID del cliente a agregar
 * @returns El cupón actualizado
 */
async agregarCliente(cuponId: string, clienteId: string) {
  try {
    // 1. Buscar el cupón
    const cupon = await this.cuponRepo.findOneBy({ id: cuponId });
    
    if (!cupon) {
      throw new NotFoundException(`Cupón con ID ${cuponId} no encontrado`);
    }
    
    // 2. Verificar que el cupón esté activo
    if (!cupon.status) {
      throw new BadRequestException('Este cupón ya no está disponible');
    }
    
    // 3. Verificar que queden cupones disponibles
    if (cupon.cantidad <= 0) {
      throw new BadRequestException('No quedan cupones disponibles');
    }
    
    // 4. Verificar si el cliente ya está en la lista
    if (cupon.personas.includes(clienteId)) {
      throw new BadRequestException('Este cliente ya ha adquirido este cupón');
    }
    
    // 5. Agregar el cliente al arreglo de personas
    cupon.personas.push(clienteId);
    
    // 6. Decrementar la cantidad disponible
    cupon.cantidad -= 1;
    
    // 7. Si ya no quedan cupones, desactivar
    if (cupon.cantidad === 0) {
      cupon.status = false;
    }
    
    // 8. Guardar los cambios
    await this.cuponRepo.save(cupon);
    
    // 9. También agregar el cupón al historial del cliente (opcional)
    await this.clienteRepo.createQueryBuilder()
      .relation(Cliente, "historial")
      .of(clienteId)
      .add(cuponId);
    
    // 10. Retornar el cupón actualizado
    return {
      message: 'Cupón agregado al cliente correctamente',
      cupon: {
        id: cupon.id,
        titulo: cupon.titulo,
        cantidad: cupon.cantidad,
        status: cupon.status,
        fechaExpiracion: cupon.fechaExpiracion,
        clientesRegistrados: cupon.personas.length
      }
    };
  } catch (error) {
    if (error instanceof NotFoundException || error instanceof BadRequestException) {
      throw error;
    }
    this.logger.error(`Error al agregar cliente ${clienteId} al cupón ${cuponId}:`, error);
    throw new InternalServerErrorException('Error al procesar la solicitud');
  }
}

/**
 * Obtiene la información detallada de todas las personas registradas en un cupón
 * @param cuponId ID del cupón cuyas personas se quieren consultar
 * @returns Lista de clientes que están registrados en el cupón
 */
async findPersonasRegistradas(cuponId: string) {
  try {
    // 1. Buscar el cupón por ID
    const cupon = await this.cuponRepo.findOneBy({ id: cuponId });
    
    if (!cupon) {
      throw new NotFoundException(`Cupón con ID ${cuponId} no encontrado`);
    }
    
    // 2. Verificar que tenga personas registradas
    if (!cupon.personas || cupon.personas.length === 0) {
      return {
        cupon: {
          id: cuponId,
          titulo: cupon.titulo
        },
        total: 0,
        personas: []
      };
    }
    
    // 3. Buscar la información completa de cada persona
    const personasDetalladas = await Promise.all(
      cupon.personas.map(async (clienteId) => {
        try {
          // Buscar el cliente usando su ID
          const cliente = await this.clienteRepo.findOne({
            where: { id: clienteId },
            relations: ['user_id'] // Para obtener información del usuario asociado
          });
          
          // Si existe el cliente, devolver datos relevantes
          if (cliente && cliente.user_id) {
            return {
              id: cliente.id,
              nombre: cliente.user_id.nombre || 'Sin nombre',
              email: cliente.user_id.email,
              telefono: cliente.user_id.telefono || 'Sin teléfono',
              puntos: cliente.puntos
            };
          }
          
          // Si no existe el cliente pero el ID está en el array, mostrar solo el ID
          return {
            id: clienteId,
            nombre: 'Cliente no encontrado',
            error: 'El cliente ya no existe en la base de datos'
          };
        } catch (error) {
          this.logger.warn(`Error al buscar el cliente ${clienteId}: ${error.message}`);
          return {
            id: clienteId,
            nombre: 'Error al obtener datos',
            error: 'No se pudo recuperar la información del cliente'
          };
        }
      })
    );
    
    // 4. Formatear y devolver la respuesta
    return {
      cupon: {
        id: cuponId,
        titulo: cupon.titulo,
        precio: cupon.precio,
        status: cupon.status,
        fechaExpiracion: cupon.fechaExpiracion,
        cantidadDisponible: cupon.cantidad
      },
      total: personasDetalladas.length,
      personas: personasDetalladas
    };
  } catch (error) {
    if (error instanceof NotFoundException) {
      throw error;
    }
    this.logger.error(`Error al obtener personas del cupón ${cuponId}:`, error);
    throw new InternalServerErrorException('Error al procesar la solicitud');
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
