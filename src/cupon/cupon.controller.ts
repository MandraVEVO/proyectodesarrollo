import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CuponService } from './cupon.service';
import { CreateCuponDto } from './dto/create-cupon.dto';
import { UpdateCuponDto } from './dto/update-cupon.dto';
import { Auth } from 'src/auth/decorators/role-protected.decorators.ts/auth.decorator';
import { ValidRoles } from 'src/auth/dto/interfaces/valid-roles';
import { JwtBlacklistGuard } from 'src/auth/guards/jwt-blacklist.guard';

@Controller('cupon')
export class CuponController {
  constructor(private readonly cuponService: CuponService) {}

  @Post()
  create(@Body() createCuponDto: CreateCuponDto) {
    return this.cuponService.create(createCuponDto);
  }

  @Post('empresa/:id')
  createWithEmpresa(
    @Param('id') empresaId: string,
    @Body() createCuponDto: CreateCuponDto
  ) {
    return this.cuponService.createWithEmpresa(empresaId, createCuponDto);
  }

  @Get()
  findAll() {
    return this.cuponService.findAll();
  }
  @Get('personas/:id')
  @Auth(ValidRoles.empresa)
findPersonasRegistradas(@Param('id') id: string) {
  return this.cuponService.findPersonasRegistradas(id);
}

  @Get('empresa/:id')
  @Auth(ValidRoles.empresa, ValidRoles.admin)
  @UseGuards(JwtBlacklistGuard)
  findAllByEmpresa(@Param('id') empresaId: string) {
    return this.cuponService.findAllByEmpresa(empresaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cuponService.findOne(id);
  }
  
  @Patch(':id')
  @Auth(ValidRoles.empresa)
  update(@Param('id') id: string, @Body() updateCuponDto: UpdateCuponDto) {
    return this.cuponService.update(id, updateCuponDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.empresa, ValidRoles.admin)
  @UseGuards(JwtBlacklistGuard)
  remove(@Param('id') id: string) {
    return this.cuponService.remove(id);
  }

  @Post(':id/agregar-cliente/:clienteId')
  @Auth(ValidRoles.cliente)
  @UseGuards(JwtBlacklistGuard)
  agregarCliente(
    @Param('id') cuponId: string,
    @Param('clienteId') clienteId: string
  ) {
    return this.cuponService.agregarCliente(cuponId, clienteId);
  }
}
