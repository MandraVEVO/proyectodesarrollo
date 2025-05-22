import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create-user.dto";


export class UpdateUserDto extends PartialType(CreateUserDto) {
  // Puedes agregar propiedades adicionales aquí si es necesario
}