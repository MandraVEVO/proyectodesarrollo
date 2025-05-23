// src/empresa/dto/create-empresa-image.dto.ts
import { IsNumber, IsString, IsUUID } from "class-validator";

export class CreateEmpresaImageDto {
  @IsString()
  nombre: string;
  
  @IsString()
  descripcion: string;
  
  @IsNumber()
  costo: number;
  
  @IsUUID()
  empresaId: string; // ID de la empresa a la que pertenecerá la imagen
}