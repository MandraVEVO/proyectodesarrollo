import { Type } from "class-transformer";
import { IsDate, IsNumber, IsString } from "class-validator";

export class CreateCuponDto {
    @IsString()
    titulo: string;
    @IsNumber()
    precio: number;
    @IsNumber()
    cantidad: number;
    @IsString()
    detalles: string;
    @IsString()
    fechaExpiracion: string;
}
