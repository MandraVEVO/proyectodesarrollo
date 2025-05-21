import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TicketService {

  private readonly logger = new Logger(TicketService.name);
  
  constructor(
     @InjectRepository(Ticket)
     private ticketRepo: Repository<Ticket>,
  ) {}

  async create(createTicketDto: CreateTicketDto) {
     try {
      const ticket = await this.ticketRepo.save(createTicketDto);
      return ticket;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll() {
    return this.ticketRepo.find({
      relations: {}
    })
  }

  async findOne(id: string) {
    try {
          const ticket = await this.ticketRepo.findOneBy({id});
          if (!ticket) {
            throw new NotFoundException(`Ticket with id ${id} not found`);
          }
          return ticket;
        } catch (error) {
                throw new NotFoundException(`Ticket with id ${id} not found`);
    
        }
  }

  async update(id: string, updateTicketDto: UpdateTicketDto) {
     try {
      const ticket = this.ticketRepo.findOneBy({id});
      if (!ticket) {
        throw new NotFoundException(`Ticket with id ${id} not found`);
      }
      await this.ticketRepo.update(id, updateTicketDto);
      return { ...ticket, ...updateTicketDto };
      } catch (error) {
      
    }
  }

  async remove(id: string) {
    try {
      const ticket = await this.ticketRepo.findOneBy({id});
      if (!ticket) {
        throw new NotFoundException(`Ticket with id ${id} not found`);
      }
      await this.ticketRepo.remove(ticket);
    } catch (error) {
      throw error;
      
    }
    throw new InternalServerErrorException('Error removing ticket');
  
  }

   private handleExceptions(error: any) {
      if (error.code === '23505') {
        throw new BadRequestException(error.detail);
      }
      this.logger.error(error);
      throw new InternalServerErrorException('Unexpected error, check server logs');
    }
}
