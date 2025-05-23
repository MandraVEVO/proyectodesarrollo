import { applyDecorators, UseGuards } from "@nestjs/common";
import { ValidRoles } from "src/auth/dto/interfaces/valid-roles";
import { RoleProtectedDecoratorsTs } from "./role-protected.decorators.ts.decorator";
import { AuthGuard } from "@nestjs/passport";
import { UserRoleGuard } from "src/auth/guards/user-role/user-role.guard";
import { JwtBlacklistGuard } from "src/auth/guards/jwt-blacklist.guard";


export function Auth(...roles:ValidRoles[]){
    return applyDecorators(
        RoleProtectedDecoratorsTs(...roles), //esto es para que no se repita el string en el decorador y en el guardia
        UseGuards(JwtBlacklistGuard, UserRoleGuard), //se recomienda no crear instancias de guardias
        
    )
}