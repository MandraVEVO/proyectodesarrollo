// src/auth/guards/jwt-blacklist.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtBlacklistGuard extends AuthGuard('jwt') {
  constructor(
    private authService: AuthService,
    reflector?: Reflector,
  ) {
    // Pasar el reflector a la clase padre si lo necesita
    super({ reflector });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Primero intentamos la validación del token JWT
    try {
      const isJwtValid = await super.canActivate(context);
      if (!isJwtValid) return false;
      
      // Ahora verificamos si el token está en la lista negra
      const request = context.switchToHttp().getRequest();
      const token = request.headers.authorization?.split(' ')[1];
      
      // Verificamos que tanto token como authService existen antes de llamar al método
      if (token && this.authService && this.authService.isTokenInvalidated) {
        if (this.authService.isTokenInvalidated(token)) {
          throw new UnauthorizedException('Token has been invalidated (logged out)');
        }
      } else {
        // Debug para ver qué está pasando
        console.log('Token o authService no disponibles:', {
          tokenExists: !!token,
          authServiceExists: !!this.authService,
          isTokenInvalidatedExists: this.authService && !!this.authService.isTokenInvalidated
        });
      }
      
      return true;
    } catch (error) {
      // Si el error es de nuestro código, propagarlo
      if (error instanceof UnauthorizedException) throw error;
      
      // Otros errores podrían ser del guard JWT base
      console.error('Error en JwtBlacklistGuard:', error);
      return false;
    }
  }
}