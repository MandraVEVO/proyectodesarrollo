import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { CreateCuponDto } from 'src/cupon/dto/create-cupon.dto';
import { Auth } from 'src/auth/decorators/role-protected.decorators.ts/auth.decorator';
import { ValidRoles } from 'src/auth/dto/interfaces/valid-roles';
import { JwtBlacklistGuard } from 'src/auth/guards/jwt-blacklist.guard';

@Controller('empresa')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

 

  @Get()
  @Auth(ValidRoles.admin)
  @UseGuards(JwtBlacklistGuard)
  findAll() {
    return this.empresaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.empresaService.findOne(id);
  }

 


  
}
