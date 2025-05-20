import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { Cupon } from 'src/cupon/entities/cupon.entity';

@Module({
  controllers: [TicketController],
  providers: [TicketService],
  imports: [
    TypeOrmModule.forFeature([
      Ticket,
      Cupon,
    ]),
  ],
  exports: [
    TypeOrmModule
  ]
})
export class TicketModule {}
