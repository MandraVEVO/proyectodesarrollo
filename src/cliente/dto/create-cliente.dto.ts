import { IsUUID } from "class-validator";
import { Auth } from "src/auth/entities/user.entity";

export class CreateClienteDto {
    @IsUUID()
    user_id: string
}
