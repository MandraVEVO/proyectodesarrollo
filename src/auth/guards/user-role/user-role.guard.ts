import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from 'src/auth/decorators/role-protected.decorators.ts/role-protected.decorators.ts.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector //ayuda a ver informacion de otros decoradores
  ) {}



  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    
    const validRoles: string[] = this.reflector.get(META_ROLES, context.getHandler());

    if (!validRoles || validRoles.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      throw new BadRequestException('User not found in request');
    }

    // Añade este log para ver la estructura completa del usuario
    console.log('User object:', JSON.stringify(user, null, 2));

    // Maneja tanto 'rol' como 'roles'
    let userRoles = [];
    
    if (user.roles && Array.isArray(user.roles)) {
      userRoles = user.roles;
    } else if (user.rol && Array.isArray(user.rol)) {
      userRoles = user.rol;
    } else if (typeof user.rol === 'string') {
      userRoles = user.rol;
    } else {
      console.log('No se encontraron roles en el usuario');
      userRoles = [];
    }

    console.log('Roles del usuario:', userRoles);
    console.log('Roles requeridos:', validRoles);

    // Verificar si el usuario tiene alguno de los roles requeridos
    for (const role of userRoles) {
      if (validRoles.includes(role)) {
        return true;
      }
    }

    throw new ForbiddenException(`User ${user.nombre || 'unknown'} need a valid role: [${validRoles}]`);
  }
}
