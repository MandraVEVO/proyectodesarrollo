import { IsString, IsUUID, MinLength } from "class-validator";

export class CreateEmpresaDto {
    @IsUUID()
    user_id: string;

    @IsString()
    @MinLength(1)
    empresa: string;

    @IsString()
    @MinLength(1)
    ubicacion: string;
}
