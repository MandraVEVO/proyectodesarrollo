import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Auth } from 'src/auth/decorators/role-protected.decorators.ts/auth.decorator';
import { ValidRoles } from 'src/auth/dto/interfaces/valid-roles';
import { JwtBlacklistGuard } from 'src/auth/guards/jwt-blacklist.guard';

@Controller('cliente')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}


  

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clienteService.findOne(id);
  }

  

  @Patch(':id/puntos')
  @Auth(ValidRoles.empresa)
  @UseGuards(JwtBlacklistGuard)
  async updatePuntos(
    @Param('id') id: string,
    @Body() puntosData: { puntos: number }
  ) {
    return this.clienteService.updatePuntos(id, puntosData);
  }

 

  @Get(':id/cupones')
  @Auth(ValidRoles.empresa,ValidRoles.cliente)
  @UseGuards(JwtBlacklistGuard)
  findCuponesByCliente(@Param('id') id: string) {
    return this.clienteService.findCuponesByCliente(id);
  }
}
