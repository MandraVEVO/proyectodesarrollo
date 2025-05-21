import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from 'src/auth/dto/interfaces/valid-roles';


export const META_ROLES = 'roles';
export const RoleProtectedDecoratorsTs = (...args: ValidRoles[]) => 
{
    return SetMetadata(META_ROLES, args);

}
